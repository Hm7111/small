import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
}

interface BranchEmployeesRequest {
  action: 'list' | 'get' | 'toggle_status';
  branchId: string;
  employeeId?: string;
  newStatus?: boolean;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { action, branchId, employeeId, newStatus }: BranchEmployeesRequest = await req.json()

    console.log('Branch Employees Request:', { action, branchId, employeeId })

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    switch (action) {
      case 'list':
        // Get all employees for this branch
        const { data: employees, error: employeesError } = await supabase
          .from('users')
          .select(`
            id, full_name, email, phone, role, is_active, branch_id, created_at, updated_at
          `)
          .eq('branch_id', branchId)
          .in('role', ['employee', 'branch_manager'])
          .order('role', { ascending: false }) // branch_manager first, then employee
          .order('created_at', { ascending: true })

        if (employeesError) {
          throw employeesError
        }

        // Get employee activities
        // In a real implementation, you would calculate actual metrics
        // Here we'll simulate with random values

        // Format the response with added performance metrics
        const employeesWithMetrics = employees?.map(employee => ({
          ...employee,
          // These are mock values - in a real app would be calculated from database
          registered_members_count: Math.floor(Math.random() * 20),
          pending_tasks: Math.floor(Math.random() * 5),
        })) || []

        return new Response(
          JSON.stringify({ 
            success: true, 
            employees: employeesWithMetrics,
            count: employeesWithMetrics.length
          }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )

      case 'toggle_status':
        if (!employeeId || newStatus === undefined) {
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: 'معرف الموظف والحالة الجديدة مطلوبان' 
            }),
            { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }

        // Verify the employee belongs to this branch
        const { data: employee, error: employeeError } = await supabase
          .from('users')
          .select('id, branch_id, role')
          .eq('id', employeeId)
          .eq('branch_id', branchId)
          .single()

        if (employeeError || !employee) {
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: 'الموظف غير موجود في هذا الفرع' 
            }),
            { 
              status: 404, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }

        // Don't allow branch managers to deactivate themselves
        if (employee.role === 'branch_manager') {
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: 'لا يمكن تغيير حالة مدير الفرع' 
            }),
            { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }

        // Update the employee status
        const { data: updatedEmployee, error: updateError } = await supabase
          .from('users')
          .update({ 
            is_active: newStatus,
            updated_at: new Date().toISOString()
          })
          .eq('id', employeeId)
          .select()
          .single()

        if (updateError) {
          throw updateError
        }

        return new Response(
          JSON.stringify({ 
            success: true, 
            employee: updatedEmployee,
            message: `تم ${newStatus ? 'تفعيل' : 'إلغاء تفعيل'} الموظف بنجاح`
          }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )

      case 'get':
        if (!employeeId) {
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: 'معرف الموظف مطلوب' 
            }),
            { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }

        // Get employee details
        const { data: employeeDetails, error: detailsError } = await supabase
          .from('users')
          .select(`
            id, full_name, email, phone, role, is_active, branch_id, created_at, updated_at
          `)
          .eq('id', employeeId)
          .eq('branch_id', branchId)
          .single()

        if (detailsError) {
          throw detailsError
        }

        // Get employee activity metrics
        // In a real implementation, you would query the database
        // Here we'll simulate with mock data

        return new Response(
          JSON.stringify({ 
            success: true, 
            employee: {
              ...employeeDetails,
              registered_members_count: Math.floor(Math.random() * 20),
              pending_tasks: Math.floor(Math.random() * 5),
              completed_tasks: Math.floor(Math.random() * 50),
              average_review_time: '1.2 يوم',
              last_activity: new Date().toISOString()
            }
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
    console.error('Branch Employees Error:', error)
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