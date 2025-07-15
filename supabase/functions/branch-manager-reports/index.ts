import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // التحقق من المصادقة
    console.log('Starting authentication check...')
    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser()

    if (authError || !user) {
      console.error('Authentication failed:', {
        error: authError,
        token: req.headers.get('Authorization')?.slice(0, 20) + '...',
        userPresent: !!user
      })
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'غير مصرح بالوصول',
          details: authError?.message || 'No user found'
        }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }
    console.log('User authenticated:', { userId: user.id, email: user.email })


    // التحقق من دور المستخدم
    console.log('Checking user role...')
    const { data: userData, error: userError } = await supabaseClient
      .from('users')
      .select('id, role, branch_id, full_name, can_access_all_branches')
      .eq('id', user.id)
      .single()

    if (userError || !userData || userData.role !== 'branch_manager') {
      console.error('Role check failed:', {
        userError,
        userData: userData ? {
          id: userData.id,
          role: userData.role,
          branch_id: userData.branch_id
        } : null,
        requiredRole: 'branch_manager'
      })
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'ليس لديك صلاحية مدير فرع',
          details: userError?.message || 
                  (!userData ? 'User not found' : `User role is ${userData.role}`)
        }),
        {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }
    console.log('User role verified:', {
      userId: userData.id, 
      role: userData.role,
      branchId: userData.branch_id,
      canAccessAllBranches: userData.can_access_all_branches
    })


    const { action, criteria } = await req.json()

    if (action === 'search_members') {
      const searchTerm = criteria?.searchTerm?.trim()
      
      if (!searchTerm) {
        return new Response(
          JSON.stringify({ success: false, error: 'يجب إدخال قيمة للبحث' }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        )
      }

      // بناء استعلام البحث حسب الصلاحيات
      let query = supabaseClient
        .from('members')
        .select(`
          id,
          full_name,
          national_id,
          phone,
          email,
          city,
          district,
          status,
          disability_type,
          created_at,
          preferred_branch_id,
          branches:preferred_branch_id(name)
        `)

      // إذا لم يكن لديه صلاحية الوصول لجميع الفروع، قيد البحث على فرعه فقط
      if (!userData.can_access_all_branches) {
        query = query.eq('preferred_branch_id', userData.branch_id)
      }

      // البحث برقم الهوية أو الجوال
      if (/^\d+$/.test(searchTerm)) {
        if (searchTerm.length === 10) {
          // رقم الهوية
          query = query.eq('national_id', searchTerm)
        } else {
          // رقم الجوال
          query = query.eq('phone', searchTerm)
        }
      } else {
        // البحث بالاسم
        query = query.ilike('full_name', `%${searchTerm}%`)
      }

      const { data: members, error: searchError } = await query.limit(10)

      if (searchError) {
        console.error('Search error:', searchError)
        return new Response(
          JSON.stringify({ success: false, error: 'خطأ في البحث' }),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        )
      }

      return new Response(
        JSON.stringify({ success: true, data: members || [] }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    if (action === 'generate_report') {
      const { type, value } = criteria
      
      if (!type || !value) {
        return new Response(
          JSON.stringify({ success: false, error: 'معايير البحث غير مكتملة' }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        )
      }

      // البحث عن المستفيد
      let memberQuery = supabaseClient
        .from('members')
        .select(`
          *,
          branches:preferred_branch_id(id, name, city)
        `)

      if (type === 'national_id') {
        memberQuery = memberQuery.eq('national_id', value)
      } else if (type === 'phone_number') {
        memberQuery = memberQuery.eq('phone', value)
      }

      // تطبيق قيود الصلاحيات
      if (!userData.can_access_all_branches) {
        memberQuery = memberQuery.eq('preferred_branch_id', userData.branch_id)
      }

      const { data: member, error: memberError } = await memberQuery.single()

      if (memberError || !member) {
        return new Response(
          JSON.stringify({ success: false, error: 'لم يتم العثور على المستفيد أو ليس لديك صلاحية للوصول إليه' }),
          {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        )
      }

      // جلب طلبات الخدمات
      const { data: requests, error: requestsError } = await supabaseClient
        .from('requests')
        .select(`
          *,
          services(id, name, category, max_amount),
          assigned_employee:employee_id(id, full_name),
          processing_branch:branch_id(id, name)
        `)
        .eq('member_id', member.id)
        .order('created_at', { ascending: false })

      if (requestsError) {
        console.error('Requests error:', requestsError)
      }

      // جلب المستندات
      const { data: documents, error: documentsError } = await supabaseClient
        .from('member_documents')
        .select('*')
        .eq('member_id', member.id)
        .order('created_at', { ascending: false })

      if (documentsError) {
        console.error('Documents error:', documentsError)
      }

      // بناء التقرير الشامل
      const report = {
        search_criteria: { type, value },
        report_metadata: {
          generated_at: new Date().toISOString(),
          generated_by: {
            id: userData.id,
            name: userData.full_name,
            role: 'branch_manager',
            branch: userData.branch_id
          },
          report_type: 'branch_comprehensive',
          access_level: userData.can_access_all_branches ? 'all_branches' : 'single_branch'
        },
        beneficiary: {
          id: member.id,
          national_id: member.national_id,
          full_name: member.full_name,
          phone: member.phone,
          email: member.email,
          birth_date: member.birth_date,
          age: member.age,
          gender: member.gender,
          disability_type: member.disability_type,
          disability_details: member.disability_details,
          disability_card_number: member.disability_card_number,
          city: member.city,
          district: member.district,
          address: member.address,
          registration_date: member.created_at,
          status: member.status,
          preferred_branch: member.branches,
          employment_status: member.employment_status,
          monthly_income: member.monthly_income,
          completion_percentage: member.profile_completion_percentage || 0
        },
        service_requests: (requests || []).map(req => ({
          id: req.id,
          request_number: `REQ-${req.id.slice(-8).toUpperCase()}`,
          service: req.services,
          status: req.status,
          priority: req.priority || 'normal',
          requested_amount: req.requested_amount,
          approved_amount: req.approved_amount,
          request_date: req.created_at,
          processing_date: req.updated_at,
          assigned_employee: req.assigned_employee,
          processing_branch: req.processing_branch,
          notes: req.notes,
          rejection_reason: req.rejection_reason,
          timeline: [
            {
              date: req.created_at,
              action: 'تم تقديم الطلب',
              performed_by: 'المستفيد',
              notes: 'طلب جديد'
            },
            ...(req.updated_at !== req.created_at ? [{
              date: req.updated_at,
              action: `تم تحديث الحالة إلى: ${req.status}`,
              performed_by: req.assigned_employee?.full_name || 'النظام',
              notes: req.notes || ''
            }] : [])
          ]
        })),
        documents: (documents || []).map(doc => ({
          id: doc.id,
          document_type: doc.document_type,
          file_name: doc.file_name,
          upload_date: doc.created_at,
          verification_status: doc.verification_status || 'pending',
          verified_by: doc.verified_by,
          file_size: doc.file_size
        })),
        financial_summary: {
          total_requested: (requests || []).reduce((sum, req) => sum + (req.requested_amount || 0), 0),
          total_approved: (requests || []).reduce((sum, req) => sum + (req.approved_amount || 0), 0),
          pending_amount: (requests || [])
            .filter(req => req.status === 'pending' || req.status === 'under_review')
            .reduce((sum, req) => sum + (req.requested_amount || 0), 0)
        },
        activity_summary: {
          total_requests: (requests || []).length,
          approved_requests: (requests || []).filter(req => req.status === 'approved').length,
          rejected_requests: (requests || []).filter(req => req.status === 'rejected').length,
          pending_requests: (requests || []).filter(req => req.status === 'pending' || req.status === 'under_review').length,
          last_request_date: requests && requests.length > 0 ? requests[0].created_at : null
        },
        available_actions: [
          'add_note',
          'request_documents', 
          'schedule_interview'
        ]
      }

      return new Response(
        JSON.stringify({ success: true, data: report }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    return new Response(
      JSON.stringify({ success: false, error: 'إجراء غير مدعوم' }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ success: false, error: 'خطأ في الخادم' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
