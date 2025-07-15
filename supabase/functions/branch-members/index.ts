import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
}

interface BranchMembersRequest {
  action: 'list' | 'get' | 'update_status';
  branchId: string;
  memberId?: string;
  newStatus?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { action, branchId, memberId, newStatus }: BranchMembersRequest = await req.json()

    console.log('Branch Members Request:', { action, branchId, memberId })

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    switch (action) {
      case 'list':
        // Get all members for this branch
        const { data: members, error: membersError } = await supabase
          .from('members')
          .select(`
            id, full_name, national_id, phone, gender, city, 
            disability_type, email, created_at, updated_at,
            status, registration_status
          `)
          .eq('preferred_branch_id', branchId)
          .in('registration_status', ['approved', 'rejected', 'needs_correction'])
          .order('created_at', { ascending: false })

        if (membersError) {
          throw membersError
        }

        return new Response(
          JSON.stringify({ 
            success: true, 
            members: members || [],
            count: members?.length || 0
          }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )

      case 'get':
        if (!memberId) {
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: 'معرف المستفيد مطلوب' 
            }),
            { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }

        // Get member details
        const { data: memberDetails, error: memberError } = await supabase
          .from('members')
          .select(`
            id, full_name, national_id, phone, gender, city, 
            disability_type, email, created_at, updated_at, status, registration_status,
            disability_details, disability_card_number, age, birth_date,
            education_level, employment_status, job_title, employer, monthly_income,
            address, district, building_number, street_name, postal_code, additional_number,
            emergency_contact_name, emergency_contact_phone, emergency_contact_relation
          `)
          .eq('id', memberId)
          .eq('preferred_branch_id', branchId)
          .single()

        if (memberError) {
          throw memberError
        }

        // Get member documents
        const { data: documents, error: documentsError } = await supabase
          .from('member_documents')
          .select(`
            id, document_type, file_name, file_path, verification_status, is_required
          `)
          .eq('member_id', memberId)

        if (documentsError) {
          console.error('Error fetching documents:', documentsError)
          // Continue without documents data rather than failing
        }

        // Get member requests
        const { data: requests, error: requestsError } = await supabase
          .from('requests')
          .select(`
            id, service_id, status, requested_amount, approved_amount, created_at,
            services:service_id (name)
          `)
          .eq('member_id', memberId)
          .order('created_at', { ascending: false })

        if (requestsError) {
          console.error('Error fetching requests:', requestsError)
          // Continue without requests data rather than failing
        }

        // Format the requests
        const formattedRequests = requests?.map(request => ({
          ...request,
          service_name: request.services?.name || 'غير محدد',
          services: undefined // Remove the nested object
        })) || []

        return new Response(
          JSON.stringify({ 
            success: true, 
            member: {
              ...memberDetails,
              documents: documents || [],
              requests: formattedRequests
            }
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

        // Validate the status
        const validStatuses = ['active', 'inactive', 'suspended'];
        if (!validStatuses.includes(newStatus)) {
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: 'حالة المستفيد غير صحيحة' 
            }),
            { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }

        // Update the member status
        const { data: updatedMember, error: updateError } = await supabase
          .from('members')
          .update({ 
            status: newStatus,
            updated_at: new Date().toISOString()
          })
          .eq('id', memberId)
          .eq('preferred_branch_id', branchId)
          .select()
          .single()

        if (updateError) {
          throw updateError
        }

        return new Response(
          JSON.stringify({ 
            success: true, 
            member: updatedMember,
            message: `تم تحديث حالة المستفيد بنجاح إلى "${newStatus}"`
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
    console.error('Branch Members Error:', error)
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