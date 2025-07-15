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

    const { action, criteria } = await req.json()

    if (action !== 'generate') {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid action' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    let member: any = null

    // البحث عن المستفيد حسب المعيار - البحث في جدول users
    if (criteria.type === 'national_id') {
      // البحث أولاً في جدول users
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('national_id', criteria.value)
        .maybeSingle()

      if (userError) {
        console.error('Database error in users table:', userError)
      }

      // إذا وجد في users، ابحث عن بياناته في members
      if (userData) {
        const { data: memberData, error: memberError } = await supabase
          .from('members')
          .select('*')
          .eq('user_id', userData.id)
          .maybeSingle()

        if (memberData) {
          member = { ...memberData, ...userData }
        } else {
          // إذا لم يوجد في members، استخدم بيانات users
          member = {
            id: userData.id,
            user_id: userData.id,
            national_id: userData.national_id,
            full_name: userData.full_name,
            phone: userData.phone,
            email: userData.email,
            role: userData.role,
            status: 'active',
            created_at: userData.created_at,
            updated_at: userData.updated_at
          }
        }
      } else {
        // إذا لم يوجد في users، ابحث في members مباشرة
        const { data, error } = await supabase
          .from('members')
          .select('*')
          .eq('national_id', criteria.value)
          .maybeSingle()

        if (error) {
          console.error('Database error in members table:', error)
          return new Response(
            JSON.stringify({ success: false, error: `خطأ في قاعدة البيانات: ${error.message}` }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        
        member = data
      }

      if (!member) {
        return new Response(
          JSON.stringify({ success: false, error: `لم يتم العثور على مستفيد بالهوية الوطنية: ${criteria.value}` }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    } else if (criteria.type === 'phone_number') {
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .eq('phone', criteria.value)
        .maybeSingle()

      if (error) {
        console.error('Database error:', error)
        return new Response(
          JSON.stringify({ success: false, error: `خطأ في قاعدة البيانات: ${error.message}` }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
      if (!data) {
        return new Response(
          JSON.stringify({ success: false, error: `لم يتم العثور على مستفيد برقم الجوال: ${criteria.value}` }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
      member = data
    } else if (criteria.type === 'transaction_id') {
      // البحث عن الطلب أولاً ثم المستفيد
      const { data: request, error: requestError } = await supabase
        .from('requests')
        .select(`
          *,
          members (*)
        `)
        .eq('id', criteria.value)
        .maybeSingle()

      if (requestError) {
        console.error('Database error:', requestError)
        return new Response(
          JSON.stringify({ success: false, error: `خطأ في قاعدة البيانات: ${requestError.message}` }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
      if (!request) {
        return new Response(
          JSON.stringify({ success: false, error: `لم يتم العثور على معاملة برقم: ${criteria.value}` }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
      member = request.members
    }

    if (!member) {
      return new Response(
        JSON.stringify({ success: false, error: 'لم يتم العثور على المستفيد' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // جلب طلبات المستفيد
    const { data: requests } = await supabase
      .from('requests')
      .select(`
        *,
        services (name, category, max_amount),
        users:employee_id (full_name)
      `)
      .eq('member_id', member.id)
      .order('created_at', { ascending: false })

    // جلب المستندات
    const { data: documents } = await supabase
      .from('member_documents')
      .select('*')
      .eq('member_id', member.id)

    // حساب الملخص المالي
    const totalRequested = requests?.reduce((sum, req) => sum + (req.requested_amount || 0), 0) || 0
    const totalApproved = requests?.filter(req => req.status === 'approved')
      .reduce((sum, req) => sum + (req.approved_amount || 0), 0) || 0
    const pendingAmount = requests?.filter(req => req.status === 'pending')
      .reduce((sum, req) => sum + (req.requested_amount || 0), 0) || 0

    // حساب ملخص النشاط
    const totalRequests = requests?.length || 0
    const approvedRequests = requests?.filter(req => req.status === 'approved').length || 0
    const rejectedRequests = requests?.filter(req => req.status === 'rejected').length || 0
    const pendingRequests = requests?.filter(req => req.status === 'pending').length || 0

    // تقييم المخاطر
    const rejectionRate = totalRequests > 0 ? (rejectedRequests / totalRequests) * 100 : 0
    let riskLevel: 'low' | 'medium' | 'high' = 'low'
    let riskScore = 0
    const riskFactors: string[] = []

    if (rejectionRate > 50) {
      riskLevel = 'high'
      riskScore = 80
      riskFactors.push('معدل رفض عالي للطلبات')
    } else if (rejectionRate > 25) {
      riskLevel = 'medium'
      riskScore = 50
      riskFactors.push('معدل رفض متوسط للطلبات')
    } else {
      riskLevel = 'low'
      riskScore = 20
      riskFactors.push('تاريخ جيد في الطلبات')
    }

    if (totalRequests > 10) {
      riskScore += 10
      riskFactors.push('عدد كبير من الطلبات')
    }

    // التوصيات
    const recommendations: string[] = []
    if (approvedRequests > rejectedRequests) {
      recommendations.push('يمكن الموافقة على طلبات إضافية بناءً على التاريخ الإيجابي')
    }
    if (member.employment_status === 'unemployed') {
      recommendations.push('يُنصح بتقديم برامج تدريبية مهنية')
    }
    if (totalRequests === 0) {
      recommendations.push('مستفيد جديد - يحتاج لمتابعة خاصة')
    }
    if (member.profile_completion_percentage < 80) {
      recommendations.push('يحتاج لاستكمال بيانات الملف الشخصي')
    }

    // إنشاء التقرير الشامل
    const comprehensiveReport = {
      search_criteria: criteria,
      beneficiary: {
        id: member.id,
        national_id: member.national_id,
        full_name: member.full_name,
        phone: member.phone,
        email: member.email || member.users?.email || '',
        birth_date: member.birth_date,
        gender: member.gender,
        marital_status: member.marital_status || 'غير محدد',
        address: {
          city: member.city || '',
          district: member.district || '',
          street: member.street_name || '',
          building_number: member.building_number || ''
        },
        employment_status: member.employment_status || 'غير محدد',
        monthly_income: member.monthly_income || 0,
        family_members_count: member.family_members_count || 0,
        registration_date: member.created_at,
        status: member.status,
        branch_id: member.preferred_branch_id,
        branch_name: member.branches?.name || 'غير محدد',
        completion_percentage: member.profile_completion_percentage || 0,
        last_activity_date: requests?.[0]?.created_at || member.updated_at,
        disability_type: member.disability_type,
        education_level: member.education_level
      },
      service_requests: requests?.map(request => ({
        id: request.id,
        service_id: request.service_id,
        service_name: request.services?.name || 'خدمة غير محددة',
        service_category: request.services?.category || 'غير محدد',
        status: request.status,
        requested_amount: request.requested_amount,
        approved_amount: request.approved_amount,
        request_date: request.created_at,
        processing_date: request.updated_at,
        completion_date: request.status === 'approved' ? request.processed_at : undefined,
        employee_id: request.employee_id,
        employee_name: request.users?.full_name || 'غير محدد',
        notes: request.notes,
        rejection_reason: request.rejection_reason,
        priority: request.priority,
        timeline: [
          {
            date: request.created_at,
            action: 'تم تقديم الطلب',
            performed_by: 'المستفيد'
          }
        ]
      })) || [],
      financial_summary: {
        total_requested: totalRequested,
        total_approved: totalApproved,
        total_received: totalApproved, // افتراض أن المبلغ المُوافق عليه تم استلامه
        pending_amount: pendingAmount
      },
      activity_summary: {
        total_requests: totalRequests,
        approved_requests: approvedRequests,
        rejected_requests: rejectedRequests,
        pending_requests: pendingRequests,
        last_request_date: requests?.[0]?.created_at || null,
        average_processing_time: 2.5
      },
      risk_assessment: {
        score: riskScore,
        level: riskLevel,
        factors: riskFactors
      },
      recommendations: recommendations,
      documents_summary: {
        total_documents: documents?.length || 0,
        verified_documents: documents?.filter(doc => doc.verification_status === 'approved').length || 0,
        pending_documents: documents?.filter(doc => doc.verification_status === 'pending').length || 0
      },
      generated_at: new Date().toISOString(),
      generated_by: 'admin_system'
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: comprehensiveReport
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in admin-comprehensive-report:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'حدث خطأ في إنشاء التقرير'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
