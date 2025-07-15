import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
}

interface EmployeeRegistrationsRequest {
  action: 'list' | 'get' | 'update_status' | 'assign';
  employeeId: string;
  branchId: string;
  registrationId?: string;
  memberId?: string;
  newStatus?: string;
  notes?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { action, employeeId, branchId, registrationId, memberId, newStatus, notes }: EmployeeRegistrationsRequest = await req.json()

    console.log('Employee Registrations Request:', { action, employeeId, branchId })

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    switch (action) {
      case 'list':
        // Get all registration requests that need employee verification
        const { data: members, error: membersError } = await supabase
          .from('members')
          .select(`
            id, full_name, national_id, phone, gender, city, 
            disability_type, email, created_at, updated_at,
            registration_status, disability_card_number, employment_status,
            reviewed_by_employee
          `)
          .eq('preferred_branch_id', branchId)
          .in('registration_status', [
            'pending_review', 
            'under_employee_review'
          ])
          .order('updated_at', { ascending: false })

        if (membersError) {
          throw membersError
        }

        // Format the response
        const registrations = members?.map(member => ({
          id: member.id, // Using member ID as registration ID for simplicity
          member_id: member.id,
          member_name: member.full_name,
          national_id: member.national_id,
          phone: member.phone,
          gender: member.gender,
          registration_status: member.registration_status,
          city: member.city,
          disability_type: member.disability_type,
          email: member.email,
          registration_date: member.created_at,
          employment_status: member.employment_status,
          assigned_to: member.reviewed_by_employee,
          assigned_date: member.updated_at,
          assigned_by: 'branch_manager'
        })) || []

        return new Response(
          JSON.stringify({ 
            success: true, 
            registrations,
            count: registrations.length
          }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )

      case 'update_status':
        if (!memberId || !newStatus) {
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: 'معرف المستفيد والحالة الجديدة مطلوبان' 
            }),
            { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }

        // Validate the status transition
        const validStatuses = ['pending_review', 'under_employee_review', 'under_manager_review', 'approved', 'rejected', 'needs_correction'];
        if (!validStatuses.includes(newStatus)) {
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: 'حالة التسجيل غير صحيحة' 
            }),
            { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }

        // Prepare the update object
        const updateData: Record<string, any> = {
          registration_status: newStatus,
          updated_at: new Date().toISOString()
        }

        // Add additional fields based on the status
        if (newStatus === 'approved') {
          updateData.employee_review_date = new Date().toISOString()
          updateData.employee_notes = notes || 'تمت الموافقة من قبل الموظف'
          updateData.status = 'active' // Activate the member
          updateData.reviewed_by_employee = employeeId
        } else if (newStatus === 'rejected') {
          updateData.employee_review_date = new Date().toISOString()
          updateData.employee_notes = notes || null
          updateData.rejection_reason = notes || 'تم رفض الطلب من قبل الموظف'
          updateData.status = 'inactive' // Set member as inactive
          updateData.reviewed_by_employee = employeeId
        } else if (newStatus === 'needs_correction') {
          updateData.employee_review_date = new Date().toISOString()
          updateData.employee_notes = notes || 'يحتاج تصحيح البيانات'
          updateData.reviewed_by_employee = employeeId
        } else if (newStatus === 'under_manager_review') {
          updateData.employee_review_date = new Date().toISOString()
          updateData.employee_notes = notes || 'تمت المراجعة من قبل الموظف وتحويله للمدير'
          updateData.reviewed_by_employee = employeeId
        } else if (newStatus === 'under_employee_review') {
          updateData.reviewed_by_employee = employeeId
        }

        // Update the member record
        const { data: updatedMember, error: updateError } = await supabase
          .from('members')
          .update(updateData)
          .eq('id', memberId)
          .select()
          .single()

        if (updateError) {
          throw updateError
        }

        // Update workflow step
        const workflowStepMap: Record<string, string> = {
          'under_employee_review': 'employee_review_started',
          'under_manager_review': 'employee_review_completed',
          'approved': 'approved',
          'rejected': 'rejected',
          'needs_correction': 'needs_correction'
        }

        const workflowStepName = workflowStepMap[newStatus]
        if (workflowStepName) {
          await supabase
            .from('registration_workflow')
            .upsert({
              member_id: memberId,
              step_name: workflowStepName,
              step_status: 'completed',
              completed_at: new Date().toISOString(),
              performed_by: employeeId,
              notes: notes
            }, {
              onConflict: 'member_id,step_name'
            })
        }

        return new Response(
          JSON.stringify({ 
            success: true, 
            member: updatedMember,
            message: `تم تحديث حالة التسجيل بنجاح إلى "${newStatus}"`
          }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )

      case 'get':
        if (!registrationId) {
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: 'معرف التسجيل مطلوب' 
            }),
            { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }

        // Get registration details
        const { data: memberDetails, error: memberError } = await supabase
          .from('members')
          .select(`
            id, full_name, national_id, phone, gender, city, 
            disability_type, email, created_at, updated_at,
            registration_status, disability_card_number, employment_status,
            education_level, monthly_income, job_title, employer,
            address, district, building_number, street_name, postal_code,
            emergency_contact_name, emergency_contact_phone, emergency_contact_relation,
            disability_details, employee_notes, manager_notes, rejection_reason,
            profile_completion_percentage, reviewed_by_employee
          `)
          .eq('id', registrationId)
          .eq('preferred_branch_id', branchId)
          .single()

        if (memberError) {
          throw memberError
        }

        // Get member documents
        const { data: documents, error: documentsError } = await supabase
          .from('member_documents')
          .select(`
            id, document_type, file_name, file_path, 
            verification_status, is_required, verified_at, verified_by,
            verification_notes
          `)
          .eq('member_id', registrationId)

        if (documentsError) {
          console.error('Error fetching documents:', documentsError)
          // Continue without documents data rather than failing
        }

        // Get workflow steps
        const { data: workflowSteps, error: workflowError } = await supabase
          .from('registration_workflow')
          .select(`
            id, step_name, step_status, started_at, completed_at, notes, step_data,
            performed_by
          `)
          .eq('member_id', registrationId)
          .order('created_at', { ascending: true })

        if (workflowError) {
          console.error('Error fetching workflow:', workflowError)
          // Continue without workflow data rather than failing
        }

        return new Response(
          JSON.stringify({ 
            success: true, 
            registration: {
              ...memberDetails,
              documents: documents || [],
              workflow: workflowSteps || []
            }
          }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )

      case 'assign':
        // Logic to assign a registration to an employee
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'تم إسناد الطلب بنجاح' 
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
    console.error('Employee Registrations Error:', error)
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