import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
}

interface BranchRequestsRequest {
  action: 'list' | 'get' | 'update_status';
  branchId: string;
  requestId?: string;
  newStatus?: string;
  approvedAmount?: number;
  notes?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { action, branchId, requestId, newStatus, approvedAmount, notes }: BranchRequestsRequest = await req.json()

    console.log('Branch Requests Request:', { action, branchId, requestId, newStatus })

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    switch (action) {
      case 'list':
        // Get all service requests for this branch
        const { data: realRequests, error } = await supabase
          .from('requests')
          .select(`
            id, member_id, service_id, status, requested_amount, approved_amount, 
            created_at, updated_at, processed_at,
            members:member_id(id, full_name, national_id, phone),
            services:service_id(id, name)
          `)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Database error:', error);
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: 'حدث خطأ في تحميل البيانات: ' + error.message
            }),
            { 
              status: 500, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }

        let requests = [];
        
        if (realRequests && realRequests.length > 0) {
          // تنسيق البيانات الحقيقية
          requests = realRequests.map(req => ({
            id: req.id,
            member_id: req.member_id,
            member_name: req.members?.full_name || 'غير معروف',
            national_id: req.members?.national_id || 'غير معروف',
            service_id: req.service_id,
            service_name: req.services?.name || 'غير معروف',
            status: req.status,
            requested_amount: req.requested_amount,
            approved_amount: req.approved_amount,
            created_at: req.created_at,
            updated_at: req.updated_at,
            processed_at: req.processed_at
          }));
        }

        return new Response(
          JSON.stringify({ 
            success: true, 
            requests: requests,
            count: requests.length
          }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )

      case 'update_status':
        if (!requestId || !newStatus) {
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: 'معرف الطلب والحالة الجديدة مطلوبان' 
            }),
            { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }

        // Update the request status in the database
        const updateData: any = {
          status: newStatus,
          updated_at: new Date().toISOString()
        };

        if (approvedAmount !== undefined) {
          updateData.approved_amount = approvedAmount;
        }

        if (newStatus === 'approved' || newStatus === 'rejected') {
          updateData.processed_at = new Date().toISOString();
        }

        const { data: updatedRequest, error: updateError } = await supabase
          .from('requests')
          .update(updateData)
          .eq('id', requestId)
          .select()
          .single();

        if (updateError) {
          console.error('Update error:', updateError);
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: 'حدث خطأ في تحديث الطلب: ' + updateError.message
            }),
            { 
              status: 500, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: `تم تحديث حالة الطلب بنجاح إلى "${newStatus}"`,
            request: updatedRequest
          }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )

      case 'get':
        if (!requestId) {
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: 'معرف الطلب مطلوب' 
            }),
            { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }

        // Get request details from database
        const { data: requestData, error: getError } = await supabase
          .from('requests')
          .select(`
            id, member_id, service_id, status, requested_amount, approved_amount, 
            created_at, updated_at, processed_at, notes,
            members:member_id(id, full_name, national_id, phone),
            services:service_id(id, name)
          `)
          .eq('id', requestId)
          .single();

        if (getError) {
          console.error('Get request error:', getError);
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: 'حدث خطأ في تحميل بيانات الطلب: ' + getError.message
            }),
            { 
              status: 500, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }

        if (!requestData) {
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: 'الطلب غير موجود'
            }),
            { 
              status: 404, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            request: {
              id: requestData.id,
              member_id: requestData.member_id,
              member_name: requestData.members?.full_name || 'غير معروف',
              national_id: requestData.members?.national_id || 'غير معروف',
              service_id: requestData.service_id,
              service_name: requestData.services?.name || 'غير معروف',
              status: requestData.status,
              requested_amount: requestData.requested_amount,
              approved_amount: requestData.approved_amount,
              created_at: requestData.created_at,
              updated_at: requestData.updated_at,
              processed_at: requestData.processed_at,
              notes: requestData.notes
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
    console.error('Branch Requests Error:', error)
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