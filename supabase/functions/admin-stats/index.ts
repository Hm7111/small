import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
}

interface AdminStatsRequest {
  adminId: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { adminId }: AdminStatsRequest = await req.json()

    console.log('Admin Stats Request:', { adminId })

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Verify admin access
    const { data: adminUser, error: adminError } = await supabase
      .from('users')
      .select('id, role')
      .eq('id', adminId)
      .eq('role', 'admin')
      .single()

    if (adminError || !adminUser) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'غير مصرح للوصول' 
        }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get total users count
    const { count: totalUsers } = await supabase
      .from('users')
      .select('id', { count: 'exact' })

    // Get total members count
    const { count: totalMembers } = await supabase
      .from('members')
      .select('id', { count: 'exact' })

    // Get pending requests count
    const { count: pendingRequests } = await supabase
      .from('members')
      .select('id', { count: 'exact' })
      .in('registration_status', ['pending_review', 'under_employee_review', 'under_manager_review'])

    // Get active branches count
    const { count: activeBranches } = await supabase
      .from('branches')
      .select('id', { count: 'exact' })
      .eq('is_active', true)

    // Get total services count
    const { count: totalServices } = await supabase
      .from('services')
      .select('id', { count: 'exact' })
      .eq('is_active', true)

    // حساب النمو الشهري للمستخدمين
    const currentDate = new Date()
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
    const startOfLastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    
    const { count: usersThisMonth } = await supabase
      .from('users')
      .select('id', { count: 'exact' })
      .gte('created_at', startOfMonth.toISOString())

    const { count: usersLastMonth } = await supabase
      .from('users')
      .select('id', { count: 'exact' })
      .gte('created_at', startOfLastMonth.toISOString())
      .lt('created_at', startOfMonth.toISOString())

    const userGrowthRate = usersLastMonth > 0 
      ? Math.round(((usersThisMonth - usersLastMonth) / usersLastMonth) * 100)
      : usersThisMonth > 0 ? 100 : 0

    // حساب متوسط الطلبات لكل فرع
    const { data: branchRequests } = await supabase
      .from('members')
      .select('preferred_branch_id')
      .not('preferred_branch_id', 'is', null)

    const requestsPerBranch: { [key: string]: number } = {}
    branchRequests?.forEach(member => {
      requestsPerBranch[member.preferred_branch_id] = (requestsPerBranch[member.preferred_branch_id] || 0) + 1
    })

    const avgRequestsPerBranch = activeBranches > 0
      ? Math.round(Object.values(requestsPerBranch).reduce((sum, count) => sum + count, 0) / activeBranches)
      : 0

    // حساب معدل الموافقة على الطلبات
    const { count: totalRequests } = await supabase
      .from('requests')
      .select('id', { count: 'exact' })

    const { count: approvedRequests } = await supabase
      .from('requests')
      .select('id', { count: 'exact' })
      .eq('status', 'approved')

    const approvalRate = totalRequests > 0
      ? Math.round((approvedRequests / totalRequests) * 100)
      : 0

    // حساب متوسط زمن المعالجة
    const { data: processedRequests } = await supabase
      .from('requests')
      .select('created_at, updated_at')
      .eq('status', 'approved')
      .limit(100)

    let avgProcessingTime = 0
    if (processedRequests && processedRequests.length > 0) {
      const totalProcessingTime = processedRequests.reduce((sum, request) => {
        const created = new Date(request.created_at)
        const updated = new Date(request.updated_at)
        const daysDiff = (updated.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)
        return sum + daysDiff
      }, 0)
      avgProcessingTime = Math.round((totalProcessingTime / processedRequests.length) * 10) / 10
    }

    // Determine system health based on multiple factors
    let systemHealth: 'excellent' | 'good' | 'warning' | 'critical' = 'good'
    
    if (pendingRequests === 0 && approvalRate > 90 && avgProcessingTime < 2) {
      systemHealth = 'excellent'
    } else if (pendingRequests <= 5 && approvalRate > 75 && avgProcessingTime < 3) {
      systemHealth = 'good'
    } else if (pendingRequests <= 15 || approvalRate < 60 || avgProcessingTime > 5) {
      systemHealth = 'warning'
    } else if (pendingRequests > 20 || approvalRate < 40 || avgProcessingTime > 7) {
      systemHealth = 'critical'
    }

    const stats = {
      totalUsers: totalUsers || 0,
      totalMembers: totalMembers || 0,
      pendingRequests: pendingRequests || 0,
      activeBranches: activeBranches || 0,
      totalServices: totalServices || 0,
      systemHealth,
      // إحصائيات إضافية
      userGrowthRate: `${userGrowthRate > 0 ? '+' : ''}${userGrowthRate}%`,
      avgRequestsPerBranch,
      approvalRate,
      avgProcessingTime,
      totalRequests: totalRequests || 0,
      approvedRequests: approvedRequests || 0
    }

    console.log('Generated stats:', stats)

    return new Response(
      JSON.stringify({ 
        success: true, 
        stats,
        message: 'تم تحميل الإحصائيات بنجاح'
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Admin Stats Error:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'حدث خطأ في تحميل الإحصائيات'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})