import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ReportCriteria {
  type: 'national_id' | 'phone_number'
  value: string
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

    // التحقق من هوية المستخدم
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: 'غير مصرح بالوصول' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }

    // التحقق من دور المستخدم
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*, branches(*)')
      .eq('id', user.id)
      .single()

    if (userError || !userData || userData.role !== 'employee') {
      return new Response(
        JSON.stringify({ success: false, error: 'هذه الخدمة متاحة للموظفين فقط' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
      )
    }

    const { action, criteria, filters } = await req.json()

    switch (action) {
      case 'generate_report':
        return await generateEmployeeReport(supabase, userData, criteria, filters)
      
      case 'search_assigned_members':
        return await searchAssignedMembers(supabase, userData, criteria)
      
      case 'get_member_summary':
        return await getMemberSummary(supabase, userData, criteria)
      
      default:
        return new Response(
          JSON.stringify({ success: false, error: 'إجراء غير صالح' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }

  } catch (error) {
    console.error('Error in employee-reports:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'حدث خطأ في معالجة الطلب'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})

async function generateEmployeeReport(
  supabase: any, 
  employee: any, 
  criteria: ReportCriteria,
  filters?: any
) {
  try {
    // البحث عن المستفيد
    let memberQuery = supabase.from('members').select('*')
    
    if (criteria.type === 'national_id') {
      memberQuery = memberQuery.eq('national_id', criteria.value)
    } else if (criteria.type === 'phone_number') {
      memberQuery = memberQuery.eq('phone', criteria.value)
    }

    const { data: member, error: memberError } = await memberQuery.maybeSingle()

    if (memberError) {
      throw new Error(`خطأ في البحث: ${memberError.message}`)
    }

    if (!member) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'لم يتم العثور على المستفيد' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // التحقق من صلاحية الموظف للوصول لهذا المستفيد
    // الموظف يمكنه رؤية المستفيدين المسندين إليه فقط
    const { data: assignedMembers } = await supabase
      .from('employee_member_assignments')
      .select('member_id')
      .eq('employee_id', employee.id)
      .eq('member_id', member.id)
      .eq('is_active', true)
      .single()

    // التحقق أيضاً من الطلبات المسندة للموظف
    const { data: assignedRequests } = await supabase
      .from('requests')
      .select('member_id')
      .eq('employee_id', employee.id)
      .eq('member_id', member.id)
      .limit(1)

    if (!assignedMembers && (!assignedRequests || assignedRequests.length === 0)) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'ليس لديك صلاحية للوصول لبيانات هذا المستفيد' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
      )
    }

    // جلب بيانات المستخدم المرتبط
    let userInfo = null
    if (member.user_id) {
      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('id', member.user_id)
        .single()
      userInfo = userData
    }

    // جلب طلبات الخدمات المسندة للموظف فقط
    const { data: requests } = await supabase
      .from('requests')
      .select(`
        *,
        services (
          id,
          name,
          category,
          max_amount,
          duration_days,
          required_documents
        ),
        branches:branch_id (
          id,
          name,
          city
        )
      `)
      .eq('member_id', member.id)
      .eq('employee_id', employee.id)
      .order('created_at', { ascending: false })

    // جلب المستندات التي يمكن للموظف رؤيتها
    const { data: documents } = await supabase
      .from('member_documents')
      .select(`
        *,
        users:verified_by (
          id,
          full_name
        )
      `)
      .eq('member_id', member.id)
      .in('document_type', ['national_id', 'disability_card', 'income_proof'])
      .order('created_at', { ascending: false })

    // جلب سجل التعديلات المتعلقة بالموظف
    const { data: auditLogs } = await supabase
      .from('audit_logs')
      .select(`
        *,
        users:user_id (
          id,
          full_name,
          role
        )
      `)
      .or(`entity_type.eq.member,entity_type.eq.request`)
      .or(`entity_id.eq.${member.id},entity_id.in.(${requests?.map(r => r.id).join(',') || ''})`)
      .eq('user_id', employee.id)
      .order('created_at', { ascending: false })
      .limit(30)

    // حساب الإحصائيات للطلبات المسندة للموظف
    const employeeStats = calculateEmployeeStats(requests || [], member)
    
    // تقييم أداء الموظف مع هذا المستفيد
    const performanceMetrics = calculateEmployeePerformance(requests || [], documents || [])

    // بناء التقرير المحدود للموظف
    const employeeReport = {
      search_criteria: criteria,
      report_metadata: {
        generated_at: new Date().toISOString(),
        generated_by: {
          id: employee.id,
          name: employee.full_name,
          role: employee.role,
          branch: employee.branches?.name || 'غير محدد'
        },
        report_type: 'employee_report',
        access_level: 'assigned_members_only'
      },
      beneficiary: {
        // معلومات أساسية محدودة
        id: member.id,
        national_id: member.national_id,
        full_name: member.full_name,
        phone: member.phone,
        email: member.email || userInfo?.email,
        
        // معلومات شخصية أساسية
        birth_date: member.birth_date,
        age: member.age,
        gender: member.gender,
        
        // معلومات الإعاقة
        disability_type: member.disability_type,
        disability_card_number: member.disability_card_number,
        
        // معلومات العنوان الأساسية
        city: member.city,
        district: member.district,
        
        // معلومات الحساب
        registration_date: member.created_at,
        status: member.status,
        preferred_branch_id: member.preferred_branch_id,
        
        // معلومات المراجعة المتعلقة بالموظف
        review_info: {
          reviewed_by_employee: member.reviewed_by_employee === employee.id ? employee.full_name : null,
          employee_review_date: member.employee_review_date,
          employee_notes: member.reviewed_by_employee === employee.id ? member.employee_notes : null
        }
      },
      assigned_service_requests: requests?.map(request => ({
        // معلومات الطلب الأساسية
        id: request.id,
        request_number: `REQ-${request.id.slice(0, 8).toUpperCase()}`,
        
        // معلومات الخدمة
        service: {
          id: request.service_id,
          name: request.services?.name || 'خدمة غير محددة',
          category: request.services?.category || 'غير محدد',
          max_amount: request.services?.max_amount
        },
        
        // حالة الطلب
        status: request.status,
        priority: request.priority || 'normal',
        
        // المبالغ المالية
        requested_amount: request.requested_amount,
        approved_amount: request.approved_amount,
        
        // التواريخ
        request_date: request.created_at,
        last_update: request.updated_at,
        processing_date: request.processed_at,
        
        // معلومات المعالجة
        processing_info: {
          assigned_date: request.assigned_at,
          processing_duration: calculateProcessingDuration(request),
          is_overdue: isRequestOverdue(request)
        },
        
        // الملاحظات
        notes: request.notes,
        internal_notes: request.internal_notes,
        
        // المستندات المطلوبة
        required_documents: request.services?.required_documents || [],
        documents_submitted: documents?.filter(doc => 
          doc.created_at >= request.created_at
        ).length || 0
      })) || [],
      
      // المستندات المتاحة للموظف
      visible_documents: documents?.map(doc => ({
        id: doc.id,
        document_type: doc.document_type,
        file_name: doc.file_name,
        upload_date: doc.created_at,
        verification_status: doc.verification_status,
        can_verify: !doc.verified_by && doc.verification_status === 'pending'
      })) || [],
      
      // إحصائيات الموظف
      employee_statistics: employeeStats,
      performance_metrics: performanceMetrics,
      
      // الإجراءات المتاحة
      available_actions: getAvailableActions(member, requests || []),
      
      // سجل نشاط الموظف
      activity_log: auditLogs?.slice(0, 10).map(log => ({
        date: log.created_at,
        action: log.action,
        entity_type: log.entity_type,
        details: log.details
      })) || []
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: employeeReport
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error generating employee report:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'حدث خطأ في إنشاء التقرير'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
}

async function searchAssignedMembers(supabase: any, employee: any, criteria: any) {
  try {
    // البحث في المستفيدين المسندين للموظف
    let query = supabase
      .from('members')
      .select(`
        id, 
        national_id, 
        full_name, 
        phone, 
        status, 
        city,
        employee_member_assignments!inner(
          employee_id,
          is_active
        )
      `)
      .eq('employee_member_assignments.employee_id', employee.id)
      .eq('employee_member_assignments.is_active', true)

    // تطبيق معايير البحث
    if (criteria.searchTerm) {
      query = query.or(`national_id.ilike.%${criteria.searchTerm}%,full_name.ilike.%${criteria.searchTerm}%,phone.ilike.%${criteria.searchTerm}%`)
    }

    const { data: assignedMembers, error: assignmentError } = await query.limit(10)

    // البحث أيضاً في المستفيدين الذين لديهم طلبات مسندة للموظف
    const { data: membersWithRequests } = await supabase
      .from('members')
      .select(`
        id, 
        national_id, 
        full_name, 
        phone, 
        status, 
        city
      `)
      .in('id', 
        supabase
          .from('requests')
          .select('member_id')
          .eq('employee_id', employee.id)
      )

    // دمج النتائج وإزالة التكرارات
    const allMembers = [...(assignedMembers || []), ...(membersWithRequests || [])]
    const uniqueMembers = Array.from(
      new Map(allMembers.map(m => [m.id, m])).values()
    )

    return new Response(
      JSON.stringify({
        success: true,
        data: uniqueMembers
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error searching assigned members:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'حدث خطأ في البحث'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
}

async function getMemberSummary(supabase: any, employee: any, criteria: any) {
  try {
    const { memberId } = criteria

    // التحقق من صلاحية الوصول
    const hasAccess = await checkEmployeeAccess(supabase, employee.id, memberId)
    if (!hasAccess) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'ليس لديك صلاحية للوصول لبيانات هذا المستفيد' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
      )
    }

    // جلب ملخص بيانات المستفيد
    const { data: member } = await supabase
      .from('members')
      .select(`
        id,
        full_name,
        national_id,
        phone,
        status,
        disability_type,
        profile_completion_percentage
      `)
      .eq('id', memberId)
      .single()

    // جلب آخر الطلبات
    const { data: recentRequests } = await supabase
      .from('requests')
      .select(`
        id,
        status,
        created_at,
        services (name)
      `)
      .eq('member_id', memberId)
      .eq('employee_id', employee.id)
      .order('created_at', { ascending: false })
      .limit(3)

    // جلب المستندات المعلقة
    const { data: pendingDocs } = await supabase
      .from('member_documents')
      .select('count')
      .eq('member_id', memberId)
      .eq('verification_status', 'pending')

    const summary = {
      member: member,
      recent_requests: recentRequests || [],
      pending_documents_count: pendingDocs?.[0]?.count || 0,
      needs_attention: member?.profile_completion_percentage < 80 || pendingDocs?.[0]?.count > 0
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: summary
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error getting member summary:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'حدث خطأ في جلب الملخص'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
}

// دوال مساعدة

async function checkEmployeeAccess(supabase: any, employeeId: string, memberId: string): Promise<boolean> {
  // التحقق من التعيين المباشر
  const { data: assignment } = await supabase
    .from('employee_member_assignments')
    .select('id')
    .eq('employee_id', employeeId)
    .eq('member_id', memberId)
    .eq('is_active', true)
    .single()

  if (assignment) return true

  // التحقق من وجود طلبات مسندة
  const { data: requests } = await supabase
    .from('requests')
    .select('id')
    .eq('employee_id', employeeId)
    .eq('member_id', memberId)
    .limit(1)

  return requests && requests.length > 0
}

function calculateEmployeeStats(requests: any[], member: any) {
  const stats = {
    total_assigned_requests: requests.length,
    completed_requests: requests.filter(r => r.status === 'completed').length,
    pending_requests: requests.filter(r => ['pending', 'under_review'].includes(r.status)).length,
    approved_requests: requests.filter(r => r.status === 'approved').length,
    rejected_requests: requests.filter(r => r.status === 'rejected').length,
    
    average_processing_time: 0,
    on_time_completion_rate: 0,
    
    last_interaction_date: requests[0]?.updated_at || member.created_at,
    days_since_last_interaction: 0
  }

  // حساب متوسط وقت المعالجة
  const processedRequests = requests.filter(r => r.processed_at)
  if (processedRequests.length > 0) {
    const totalTime = processedRequests.reduce((sum, req) => {
      const created = new Date(req.created_at)
      const processed = new Date(req.processed_at)
      return sum + (processed.getTime() - created.getTime())
    }, 0)
    stats.average_processing_time = totalTime / processedRequests.length / (1000 * 60 * 60 * 24)
  }

  // حساب معدل الإنجاز في الوقت المحدد
  const completedRequests = requests.filter(r => r.status === 'completed')
  if (completedRequests.length > 0) {
    const onTimeCount = completedRequests.filter(req => {
      const expectedDays = req.services?.duration_days || 7
      const actualDays = calculateProcessingDuration(req)
      return actualDays && actualDays <= expectedDays
    }).length
    stats.on_time_completion_rate = (onTimeCount / completedRequests.length) * 100
  }

  // حساب الأيام منذ آخر تفاعل
  const lastInteraction = new Date(stats.last_interaction_date)
  const now = new Date()
  stats.days_since_last_interaction = Math.floor((now.getTime() - lastInteraction.getTime()) / (1000 * 60 * 60 * 24))

  return stats
}

function calculateEmployeePerformance(requests: any[], documents: any[]) {
  const performance = {
    efficiency_score: 0,
    accuracy_score: 0,
    responsiveness_score: 0,
    overall_rating: 0,
    strengths: [] as string[],
    areas_for_improvement: [] as string[]
  }

  // حساب نقاط الكفاءة
  const avgProcessingTime = calculateAverageProcessingTime(requests)
  if (avgProcessingTime < 2) {
    performance.efficiency_score = 90
    performance.strengths.push('معالجة سريعة للطلبات')
  } else if (avgProcessingTime < 5) {
    performance.efficiency_score = 70
  } else {
    performance.efficiency_score = 50
    performance.areas_for_improvement.push('تحسين سرعة معالجة الطلبات')
  }

  // حساب نقاط الدقة
  const rejectionRate = requests.length > 0 
    ? (requests.filter(r => r.status === 'rejected').length / requests.length) * 100
    : 0
  
  if (rejectionRate < 10) {
    performance.accuracy_score = 90
    performance.strengths.push('دقة عالية في تقييم الطلبات')
  } else if (rejectionRate < 25) {
    performance.accuracy_score = 70
  } else {
    performance.accuracy_score = 50
    performance.areas_for_improvement.push('مراجعة معايير تقييم الطلبات')
  }

  // حساب نقاط الاستجابة
  const pendingOldRequests = requests.filter(r => {
    const daysPending = calculateDaysSince(r.created_at)
    return r.status === 'pending' && daysPending > 3
  }).length

  if (pendingOldRequests === 0) {
    performance.responsiveness_score = 90
    performance.strengths.push('استجابة سريعة للطلبات الجديدة')
  } else if (pendingOldRequests < 3) {
    performance.responsiveness_score = 70
  } else {
    performance.responsiveness_score = 50
    performance.areas_for_improvement.push('معالجة الطلبات المعلقة القديمة')
  }

  // حساب التقييم الإجمالي
  performance.overall_rating = Math.round(
    (performance.efficiency_score + performance.accuracy_score + performance.responsiveness_score) / 3
  )

  return performance
}

function calculateProcessingDuration(request: any): number | null {
  if (!request.processed_at) return null
  
  const created = new Date(request.created_at)
  const processed = new Date(request.processed_at)
  const durationMs = processed.getTime() - created.getTime()
  
  return Math.floor(durationMs / (1000 * 60 * 60 * 24))
}

function isRequestOverdue(request: any): boolean {
  if (request.status === 'completed' || request.status === 'rejected') return false
  
  const created = new Date(request.created_at)
  const expectedDays = request.services?.duration_days || 7
  const now = new Date()
  const daysPassed = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24))
  
  return daysPassed > expectedDays
}

function getAvailableActions(member: any, requests: any[]): string[] {
  const actions = []
  
  // إجراءات على مستوى المستفيد
  if (member.status === 'active') {
    actions.push('add_note')
    actions.push('request_document')
  }
  
  // إجراءات على مستوى الطلبات
  const hasPendingRequests = requests.some(r => r.status === 'pending')
  if (hasPendingRequests) {
    actions.push('process_request')
    actions.push('request_additional_info')
  }
  
  const hasUnderReviewRequests = requests.some(r => r.status === 'under_review')
  if (hasUnderReviewRequests) {
    actions.push('complete_review')
    actions.push('escalate_to_manager')
  }
  
  return actions
}

function calculateAverageProcessingTime(requests: any[]): number {
  const processedRequests = requests.filter(r => r.processed_at)
  if (processedRequests.length === 0) return 0
  
  const totalTime = processedRequests.reduce((sum, req) => {
    const duration = calculateProcessingDuration(req)
    return sum + (duration || 0)
  }, 0)
  
  return totalTime / processedRequests.length
}

function calculateDaysSince(dateString: string): number {
  const date = new Date(dateString)
  const now = new Date()
  return Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
}
