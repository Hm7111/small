import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
}

interface SubmitRegistrationRequest {
  userId: string;
  registrationData: {
    personalInfo: any;
    professionalInfo: any;
    addressInfo: any;
    contactInfo: any;
    branchSelection: any;
    documentUpload: any;
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { userId, registrationData }: SubmitRegistrationRequest = await req.json()

    console.log('Submit Registration Request:', { userId, registrationData })

    // Validate input
    if (!userId || !registrationData) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'معرف المستخدم وبيانات التسجيل مطلوبان' 
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

    console.log('Supabase client initialized')

    // Get existing member record
    const { data: existingMember, error: memberError } = await supabase
      .from('members')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (memberError || !existingMember) {
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

    console.log('Found existing member:', existingMember.id)

    // Prepare member update data
    const memberUpdateData: any = {
      updated_at: new Date().toISOString()
    }

    // Personal Info
    if (registrationData.personalInfo) {
      const personalInfo = registrationData.personalInfo
      if (personalInfo.fullName) memberUpdateData.full_name = personalInfo.fullName
      if (personalInfo.gender) memberUpdateData.gender = personalInfo.gender
      if (personalInfo.dateOfBirth) memberUpdateData.birth_date = personalInfo.dateOfBirth
      if (personalInfo.age) memberUpdateData.age = personalInfo.age
      if (personalInfo.disabilityType) memberUpdateData.disability_type = personalInfo.disabilityType
      if (personalInfo.disabilityDetails) memberUpdateData.disability_details = personalInfo.disabilityDetails
      if (personalInfo.disabilityCardNumber) memberUpdateData.disability_card_number = personalInfo.disabilityCardNumber
    }

    // Professional Info
    if (registrationData.professionalInfo) {
      const professionalInfo = registrationData.professionalInfo
      if (professionalInfo.educationLevel) memberUpdateData.education_level = professionalInfo.educationLevel
      if (professionalInfo.employmentStatus) memberUpdateData.employment_status = professionalInfo.employmentStatus
      if (professionalInfo.jobTitle) memberUpdateData.job_title = professionalInfo.jobTitle
      if (professionalInfo.employer) memberUpdateData.employer = professionalInfo.employer
      if (professionalInfo.monthlyIncome) memberUpdateData.monthly_income = professionalInfo.monthlyIncome
    }

    // Address Info
    if (registrationData.addressInfo) {
      const addressInfo = registrationData.addressInfo
      if (addressInfo.buildingNumber) memberUpdateData.building_number = addressInfo.buildingNumber
      if (addressInfo.streetName) memberUpdateData.street_name = addressInfo.streetName
      if (addressInfo.district) memberUpdateData.district = addressInfo.district
      if (addressInfo.city) memberUpdateData.city = addressInfo.city
      if (addressInfo.postalCode) memberUpdateData.postal_code = addressInfo.postalCode
      if (addressInfo.additionalNumber) memberUpdateData.additional_number = addressInfo.additionalNumber
      if (addressInfo.address) memberUpdateData.address = addressInfo.address
    }

    // Contact Info
    if (registrationData.contactInfo) {
      const contactInfo = registrationData.contactInfo
      if (contactInfo.phone) memberUpdateData.phone = contactInfo.phone
      if (contactInfo.alternativePhone) memberUpdateData.alternative_phone = contactInfo.alternativePhone
      if (contactInfo.email) memberUpdateData.email = contactInfo.email
      if (contactInfo.emergencyContactName) memberUpdateData.emergency_contact_name = contactInfo.emergencyContactName
      if (contactInfo.emergencyContactPhone) memberUpdateData.emergency_contact_phone = contactInfo.emergencyContactPhone
      if (contactInfo.emergencyContactRelation) memberUpdateData.emergency_contact_relation = contactInfo.emergencyContactRelation
    }

    // Branch Selection
    if (registrationData.branchSelection) {
      const branchSelection = registrationData.branchSelection
      if (branchSelection.preferredBranchId) memberUpdateData.preferred_branch_id = branchSelection.preferredBranchId
    }

    // Update registration status and completion percentage
    memberUpdateData.registration_status = 'pending_review'
    memberUpdateData.profile_completion_percentage = 100

    console.log('Updating member with data:', memberUpdateData)

    // Update member record
    const { data: updatedMember, error: updateError } = await supabase
      .from('members')
      .update(memberUpdateData)
      .eq('id', existingMember.id)
      .select()
      .single()

    if (updateError) {
      console.error('Member update error:', updateError)
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'خطأ في تحديث بيانات المستفيد: ' + updateError.message
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Member updated successfully')

    // Update workflow steps to mark as completed
    const workflowSteps = [
      'personal_info_completed',
      'professional_info_completed', 
      'address_info_completed',
      'contact_info_completed',
      'branch_selected',
      'documents_uploaded',
      'profile_submitted'
    ]

    for (const step of workflowSteps) {
      await supabase
        .from('registration_workflow')
        .upsert({
          member_id: existingMember.id,
          step_name: step,
          step_status: 'completed',
          completed_at: new Date().toISOString(),
          performed_by: userId
        }, {
          onConflict: 'member_id,step_name'
        })
    }

    console.log('Workflow steps updated')

    // Also update the user table with the latest name if provided
    if (registrationData.personalInfo?.fullName) {
      await supabase
        .from('users')
        .update({ 
          full_name: registrationData.personalInfo.fullName,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
    }

    console.log('Registration submission completed successfully')

    return new Response(
      JSON.stringify({ 
        success: true, 
        member: updatedMember,
        requestId: updatedMember.id.slice(-8).toUpperCase(),
        message: 'تم إرسال طلب التسجيل بنجاح'
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Submit Registration Error:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'حدث خطأ في إرسال البيانات: ' + error.message
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})