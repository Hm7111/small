import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const { action, target_id, data } = await req.json()

    let result: any = null
    let message = ''

    switch (action) {
      case 'approve_request':
        const { error: approveError } = await supabase
          .from('requests')
          .update({
            status: 'approved',
            approved_amount: data?.approved_amount,
            notes: data?.notes,
            processed_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', target_id)

        if (approveError) throw approveError
        message = 'تمت الموافقة على الطلب بنجاح'
        break

      case 'reject_request':
        const { error: rejectError } = await supabase
          .from('requests')
          .update({
            status: 'rejected',
            rejection_reason: data?.reason,
            notes: data?.notes,
            processed_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', target_id)

        if (rejectError) throw rejectError
        message = 'تم رفض الطلب'
        break

      case 'suspend_beneficiary':
        const { error: suspendError } = await supabase
          .from('members')
          .update({
            status: 'inactive',
            notes: data?.reason,
            updated_at: new Date().toISOString()
          })
          .eq('id', target_id)

        if (suspendError) throw suspendError
        message = 'تم إيقاف المستفيد مؤقتاً'
        break

      case 'activate_beneficiary':
        const { error: activateError } = await supabase
          .from('members')
          .update({
            status: 'active',
            updated_at: new Date().toISOString()
          })
          .eq('id', target_id)

        if (activateError) throw activateError
        message = 'تم تفعيل المستفيد'
        break

      case 'transfer_branch':
        const { error: transferError } = await supabase
          .from('members')
          .update({
            preferred_branch_id: data?.new_branch_id,
            notes: data?.notes,
            updated_at: new Date().toISOString()
          })
          .eq('id', target_id)

        if (transferError) throw transferError
        message = 'تم نقل المستفيد للفرع الجديد'
        break

      case 'update_priority':
        const { error: priorityError } = await supabase
          .from('requests')
          .update({
            priority: data?.priority,
            notes: data?.notes,
            updated_at: new Date().toISOString()
          })
          .eq('id', target_id)

        if (priorityError) throw priorityError
        message = 'تم تحديث أولوية الطلب'
        break

      case 'schedule_interview':
        // يمكن إنشاء جدول منفصل للمقابلات أو إضافة معلومات للطلب
        const { error: scheduleError } = await supabase
          .from('requests')
          .update({
            notes: `${data?.notes || ''}\n\nموعد المقابلة: ${data?.interview_date} في ${data?.interview_time}`,
            updated_at: new Date().toISOString()
          })
          .eq('id', target_id)

        if (scheduleError) throw scheduleError
        message = 'تم جدولة المقابلة'
        break

      case 'request_documents':
        // إضافة طلب مستندات إضافية
        const { error: docsError } = await supabase
          .from('requests')
          .update({
            notes: `${data?.notes || ''}\n\nمطلوب تقديم المستندات التالية: ${data?.required_documents?.join(', ')}`,
            status: 'pending_documents',
            updated_at: new Date().toISOString()
          })
          .eq('id', target_id)

        if (docsError) throw docsError
        message = 'تم طلب المستندات الإضافية'
        break

      default:
        throw new Error('نوع الإجراء غير مدعوم')
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          action_id: `action_${Date.now()}`,
          status: 'completed',
          message: message,
          result: result
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in admin-actions:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'فشل في تنفيذ الإجراء'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
