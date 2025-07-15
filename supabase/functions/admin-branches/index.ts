import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
}

interface AdminBranchesRequest {
  action: 'list' | 'create' | 'update' | 'delete' | 'toggle_status';
  branchId?: string;
  branchData?: any;
  newStatus?: boolean;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { action, branchId, branchData, newStatus }: AdminBranchesRequest = await req.json()

    console.log('Admin Branches Request:', { action, branchId })

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    switch (action) {
      case 'list':
        // Get all branches with manager information and counts
        const { data: branches, error: branchesError } = await supabase
          .from('branches')
          .select(`
            id, name, city, address, phone, manager_id, is_active, created_at, updated_at,
            manager:manager_id (
              full_name
            )
          `)
          .order('created_at', { ascending: false })

        if (branchesError) {
          throw branchesError
        }

        // Get employee counts for each branch
        const branchIds = branches?.map(b => b.id) || []
        
        const { data: employeeCounts, error: employeeError } = await supabase
          .from('users')
          .select('branch_id')
          .in('branch_id', branchIds)

        const { data: memberCounts, error: memberError } = await supabase
          .from('members')
          .select('preferred_branch_id')
          .in('preferred_branch_id', branchIds)

        // Count employees and members per branch
        const employeeCountMap = (employeeCounts || []).reduce((acc, emp) => {
          acc[emp.branch_id] = (acc[emp.branch_id] || 0) + 1
          return acc
        }, {} as Record<string, number>)

        const memberCountMap = (memberCounts || []).reduce((acc, member) => {
          acc[member.preferred_branch_id] = (acc[member.preferred_branch_id] || 0) + 1
          return acc
        }, {} as Record<string, number>)

        // Format the response
        const formattedBranches = branches?.map(branch => ({
          ...branch,
          manager_name: branch.manager?.full_name || null,
          employees_count: employeeCountMap[branch.id] || 0,
          members_count: memberCountMap[branch.id] || 0,
          manager: undefined // Remove the nested object
        })) || []

        return new Response(
          JSON.stringify({ 
            success: true, 
            branches: formattedBranches
          }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )

      case 'toggle_status':
        if (!branchId || newStatus === undefined) {
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: 'معرف الفرع والحالة الجديدة مطلوبان' 
            }),
            { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }

        const { data: updatedBranch, error: updateError } = await supabase
          .from('branches')
          .update({ 
            is_active: newStatus,
            updated_at: new Date().toISOString()
          })
          .eq('id', branchId)
          .select()
          .single()

        if (updateError) {
          throw updateError
        }

        return new Response(
          JSON.stringify({ 
            success: true, 
            branch: updatedBranch,
            message: `تم ${newStatus ? 'تفعيل' : 'إلغاء تفعيل'} الفرع بنجاح`
          }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )

      case 'create':
        if (!branchData) {
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: 'بيانات الفرع مطلوبة' 
            }),
            { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }
        
        // التحقق من وجود المدير إن وجد
        if (branchData.manager_id) {
          const { data: manager } = await supabase
            .from('users')
            .select('id, role')
            .eq('id', branchData.manager_id)
            .single()
            
          if (!manager) {
            return new Response(
              JSON.stringify({ 
                success: false, 
                error: 'مدير الفرع غير موجود في النظام' 
              }),
              { 
                status: 400, 
                headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
              }
            )
          }
        }
        
        // إنشاء الفرع الجديد
        const { data: newBranch, error: createError } = await supabase
          .from('branches')
          .insert({
            name: branchData.name,
            city: branchData.city,
            address: branchData.address,
            phone: branchData.phone,
            manager_id: branchData.manager_id,
            is_active: branchData.is_active ?? true
          })
          .select()
          .single()

        if (createError) {
          console.error('Branch creation error:', createError)
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: 'حدث خطأ في إنشاء الفرع: ' + createError.message
            }),
            { 
              status: 500, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }

        // إذا تم تعيين مدير للفرع، تحديث بيانات المستخدم ليكون مدير فرع
        if (branchData.manager_id) {
          await supabase
            .from('users')
            .update({ 
              role: 'branch_manager',
              branch_id: newBranch.id,
              updated_at: new Date().toISOString()
            })
            .eq('id', branchData.manager_id)
        }

        return new Response(
          JSON.stringify({ 
            success: true, 
            branch: newBranch,
            message: 'تم إنشاء الفرع بنجاح'
          }),
          { 
            status: 201, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )

      case 'update':
        // TODO: Implement branch update
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'تحديث الفروع قيد التطوير' 
          }),
          { 
            status: 501, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )

      case 'delete':
        // TODO: Implement branch deletion (soft delete)
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'حذف الفروع قيد التطوير' 
          }),
          { 
            status: 501, 
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
    console.error('Admin Branches Error:', error)
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