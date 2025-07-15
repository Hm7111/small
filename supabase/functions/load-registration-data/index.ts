import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
}

interface LoadDataRequest {
  userId: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { userId }: LoadDataRequest = await req.json()

    console.log('Load Registration Data Request:', { userId })

    // Validate input
    if (!userId) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'معرف المستخدم مطلوب' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get member record with all data
    const { data: member, error: memberError } = await supabase
      .from('members')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (memberError || !member) {
      console.error('Member not found:', memberError)
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'ملف المستفيد غير موجود' 
        }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get workflow steps
    const { data: workflowSteps, error: workflowError } = await supabase
      .from('registration_workflow')
      .select('*')
      .eq('member_id', member.id)
      .order('created_at', { ascending: true })

    if (workflowError) {
      console.error('Error loading workflow:', workflowError)
      // Continue without workflow data
    }

    // Map member data to registration data structure
    const registrationData = {
      personalInfo: {
        fullName: member.full_name || '',
        nationalId: member.national_id || '',
        dateOfBirth: member.birth_date || '',
        age: member.age || 0,
        gender: member.gender || 'male',
        disabilityType: member.disability_type || '',
        disabilityDetails: member.disability_details || '',
        disabilityCardNumber: member.disability_card_number || ''
      },
      professionalInfo: {
        educationLevel: member.education_level || '',
        employmentStatus: member.employment_status || '',
        jobTitle: member.job_title || '',
        employer: member.employer || '',
        monthlyIncome: member.monthly_income || 0
      },
      addressInfo: {
        buildingNumber: member.building_number || '',
        streetName: member.street_name || '',
        district: member.district || '',
        city: member.city || '',
        postalCode: member.postal_code || '',
        additionalNumber: member.additional_number || '',
        address: member.address || ''
      },
      contactInfo: {
        phone: member.phone || '',
        alternativePhone: member.alternative_phone || '',
        email: member.email || '',
        emergencyContactName: member.emergency_contact_name || '',
        emergencyContactPhone: member.emergency_contact_phone || '',
        emergencyContactRelation: member.emergency_contact_relation || ''
      },
      branchSelection: {
        preferredBranchId: member.preferred_branch_id || '',
        branchName: '' // Will be filled from branch lookup if needed
      },
      documentUpload: {
        // Documents will be loaded separately if needed
      }
    }

    // Determine completed steps based on data completeness
    const completedSteps: number[] = []

    // Step 1: Personal Info
    if (member.full_name && member.national_id && member.birth_date && member.gender && member.disability_type) {
      completedSteps.push(1)
    }

    // Step 2: Professional Info  
    if (member.education_level && member.employment_status) {
      completedSteps.push(2)
    }

    // Step 3: Address Info
    if (member.building_number && member.street_name && member.district && member.city && member.postal_code) {
      completedSteps.push(3)
    }

    // Step 4: Contact Info
    if (member.phone && member.emergency_contact_name && member.emergency_contact_phone && member.emergency_contact_relation) {
      completedSteps.push(4)
    }

    // Step 5: Branch Selection
    if (member.preferred_branch_id) {
      completedSteps.push(5)
    }

    // Step 6: Documents (check if any documents exist)
    const { data: documents } = await supabase
      .from('member_documents')
      .select('id')
      .eq('member_id', member.id)
      .limit(1)

    if (documents && documents.length > 0) {
      completedSteps.push(6)
    }

    // Step 7: Final submission
    if (member.registration_status === 'pending_review' || member.registration_status === 'approved') {
      completedSteps.push(7)
    }

    // Calculate current step (next incomplete step)
    let currentStep = 1
    for (let i = 1; i <= 7; i++) {
      if (!completedSteps.includes(i)) {
        currentStep = i
        break
      }
    }

    // If all steps are completed, stay on step 7
    if (completedSteps.length === 7) {
      currentStep = 7
    }

    console.log('Loaded registration data successfully', {
      completedSteps,
      currentStep,
      completionPercentage: member.profile_completion_percentage
    })

    return new Response(
      JSON.stringify({ 
        success: true, 
        registrationData,
        completedSteps,
        currentStep,
        member,
        workflowSteps: workflowSteps || [],
        message: 'تم تحميل بيانات التسجيل بنجاح'
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Load Registration Data Error:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'حدث خطأ في تحميل البيانات: ' + error.message
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})