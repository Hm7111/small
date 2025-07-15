import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
}

interface BranchManagerRequest {
  action: 'get_dashboard' | 'get_branch_info';
  managerId: string;
  branchId: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { action, managerId, branchId }: BranchManagerRequest = await req.json()

    console.log('Branch Manager Request:', { action, managerId, branchId })

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Verify branch manager access
    const { data: managerUser, error: managerError } = await supabase
      .from('users')
      .select('id, role, branch_id')
      .eq('id', managerId)
      .eq('role', 'branch_manager')
      .single()

    if (managerError || !managerUser || managerUser.branch_id !== branchId) {
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

    switch (action) {
      case 'get_dashboard':
        // Get branch data
        const { data: branchData, error: branchError } = await supabase
          .from('branches')
          .select(`
            id, name, city, address, phone, manager_id,
            manager:manager_id (
              full_name
            )
          `)
          .eq('id', branchId)
          .single()
          
        if (branchError || !branchData) {
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: 'خطأ في الحصول على بيانات الفرع' 
            }),
            { 
              status: 500, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }

        // Get branch stats
        
        // 1. Get pending registrations count
        const { count: pendingRegistrationsCount } = await supabase
          .from('members')
          .select('id', { count: 'exact' })
          .eq('preferred_branch_id', branchId)
          .in('registration_status', ['pending_review', 'under_employee_review'])

        // 2. Get total members count
        const { count: totalMembersCount } = await supabase
          .from('members')
          .select('id', { count: 'exact' })
          .eq('preferred_branch_id', branchId)
          .eq('status', 'active')

        // 3. Get active requests count
        const { count: activeRequestsCount } = await supabase
          .from('requests')
          .select('id', { count: 'exact' })
          .eq('branch_id', branchId)
          .in('status', ['pending', 'under_review'])

        // 4. Get employees count
        const { count: employeesCount } = await supabase
          .from('users')
          .select('id', { count: 'exact' })
          .eq('branch_id', branchId)
          .in('role', ['employee'])

        const stats = {
          pendingRegistrations: pendingRegistrationsCount || 0,
          totalMembers: totalMembersCount || 0,
          activeRequests: activeRequestsCount || 0,
          employeesCount: employeesCount || 0,
          reviewTime: '1.5 يوم',  // هذه قيمة ثابتة للعرض - يمكن حسابها فعلياً في التطبيق الحقيقي
          branchRank: 2  // قيمة ثابتة للعرض - يمكن حسابها فعلياً في التطبيق الحقيقي
        }

        // Format the branch data
        const formattedBranchData = {
          ...branchData,
          manager_name: branchData.manager?.full_name || 'غير محدد',
          manager: undefined // Remove the nested object
        }

        return new Response(
          JSON.stringify({ 
            success: true, 
            branchData: formattedBranchData,
            stats,
            message: 'تم تحميل بيانات الفرع بنجاح'
          }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )

      case 'get_branch_info':
        // Similar to above but just return the branch info
        const { data: branchInfo, error: branchInfoError } = await supabase
          .from('branches')
          .select(`
            id, name, city, address, phone, manager_id,
            manager:manager_id (
              full_name
            )
          `)
          .eq('id', branchId)
          .single()
          
        if (branchInfoError || !branchInfo) {
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: 'خطأ في الحصول على بيانات الفرع' 
            }),
            { 
              status: 500, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }

        // Format the branch data
        const formattedBranchInfo = {
          ...branchInfo,
          manager_name: branchInfo.manager?.full_name || 'غير محدد',
          manager: undefined // Remove the nested object
        }

        return new Response(
          JSON.stringify({ 
            success: true, 
            branch: formattedBranchInfo,
            message: 'تم تحميل معلومات الفرع بنجاح'
          }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )

      default:
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'عملية غير مدعومة' 
          }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
    }
  } catch (error) {
    console.error('Branch Manager Error:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'حدث خطأ في العملية: ' + error.message
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})