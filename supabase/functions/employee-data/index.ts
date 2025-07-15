import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
}

interface EmployeeDataRequest {
  action: 'get_dashboard' | 'get_employee_info';
  employeeId: string;
  branchId: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { action, employeeId, branchId }: EmployeeDataRequest = await req.json()

    console.log('Employee Data Request:', { action, employeeId, branchId })

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Verify employee access
    const { data: employeeUser, error: employeeError } = await supabase
      .from('users')
      .select('id, role, branch_id, full_name, email, phone, created_at, is_active, updated_at')
      .eq('id', employeeId)
      .eq('role', 'employee')
      .single()

    if (employeeError || !employeeUser) {
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

        // Get employee stats
        
        // 1. Get total pending registrations in the branch
        const { count: pendingRegistrationsCount } = await supabase
          .from('members')
          .select('id', { count: 'exact' })
          .eq('preferred_branch_id', branchId)
          .in('registration_status', ['pending_review', 'under_employee_review'])

        // 2. Get registrations assigned to this employee
        const { count: assignedToMeCount } = await supabase
          .from('members')
          .select('id', { count: 'exact' })
          .eq('preferred_branch_id', branchId)
          .eq('reviewed_by_employee', employeeId)
          .eq('registration_status', 'under_employee_review')

        // 3. Get registrations reviewed by this employee
        const { count: reviewedByMeCount } = await supabase
          .from('members')
          .select('id', { count: 'exact' })
          .eq('preferred_branch_id', branchId)
          .eq('reviewed_by_employee', employeeId)
          .in('registration_status', ['under_manager_review', 'approved', 'rejected', 'needs_correction'])

        // Format the branch data
        const formattedBranchData = {
          ...branchData,
          manager_name: branchData.manager?.full_name || 'غير محدد',
          manager: undefined // Remove the nested object
        }

        const stats = {
          pendingRegistrations: pendingRegistrationsCount || 0,
          assignedToMe: assignedToMeCount || 0,
          reviewedByMe: reviewedByMeCount || 0,
          averageReviewTime: '1.2 يوم'  // هذه قيمة ثابتة للعرض - يمكن حسابها فعلياً في التطبيق الحقيقي
        }

        return new Response(
          JSON.stringify({ 
            success: true, 
            employeeData: employeeUser,
            branchData: formattedBranchData,
            stats,
            message: 'تم تحميل بيانات الموظف بنجاح'
          }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )

      case 'get_employee_info':
        return new Response(
          JSON.stringify({ 
            success: true, 
            employee: employeeUser,
            message: 'تم تحميل معلومات الموظف بنجاح'
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
    console.error('Employee Data Error:', error)
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