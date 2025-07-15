import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
}

interface SaveDraftRequest {
  userId: string;
  stepData: any;
  stepName: string;
  completedSteps: number[];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { userId, stepData, stepName, completedSteps }: SaveDraftRequest = await req.json()

    console.log('Save Draft Request:', { userId, stepName, completedSteps })

    // Validate input
    if (!userId || !stepData || !stepName) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'معرف المستخدم وبيانات الخطوة واسم الخطوة مطلوبان' 
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

    // Get member record
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

    // Prepare member update data based on step
    const memberUpdateData: any = {
      updated_at: new Date().toISOString()
    }

    // Map step data to member fields
    switch (stepName) {
      case 'personalInfo':
        if (stepData.fullName) memberUpdateData.full_name = stepData.fullName
        if (stepData.gender) memberUpdateData.gender = stepData.gender
        if (stepData.dateOfBirth) memberUpdateData.birth_date = stepData.dateOfBirth
        if (stepData.age) memberUpdateData.age = stepData.age
        if (stepData.disabilityType) memberUpdateData.disability_type = stepData.disabilityType
        if (stepData.disabilityDetails) memberUpdateData.disability_details = stepData.disabilityDetails
        if (stepData.disabilityCardNumber) memberUpdateData.disability_card_number = stepData.disabilityCardNumber
        break

      case 'professionalInfo':
        if (stepData.educationLevel) memberUpdateData.education_level = stepData.educationLevel
        if (stepData.employmentStatus) memberUpdateData.employment_status = stepData.employmentStatus
        if (stepData.jobTitle) memberUpdateData.job_title = stepData.jobTitle
        if (stepData.employer) memberUpdateData.employer = stepData.employer
        if (stepData.monthlyIncome !== undefined) memberUpdateData.monthly_income = stepData.monthlyIncome
        break

      case 'addressInfo':
        if (stepData.buildingNumber) memberUpdateData.building_number = stepData.buildingNumber
        if (stepData.streetName) memberUpdateData.street_name = stepData.streetName
        if (stepData.district) memberUpdateData.district = stepData.district
        if (stepData.city) memberUpdateData.city = stepData.city
        if (stepData.postalCode) memberUpdateData.postal_code = stepData.postalCode
        if (stepData.additionalNumber) memberUpdateData.additional_number = stepData.additionalNumber
        if (stepData.address) memberUpdateData.address = stepData.address
        break

      case 'contactInfo':
        if (stepData.phone) memberUpdateData.phone = stepData.phone
        if (stepData.alternativePhone) memberUpdateData.alternative_phone = stepData.alternativePhone
        if (stepData.email) memberUpdateData.email = stepData.email
        if (stepData.emergencyContactName) memberUpdateData.emergency_contact_name = stepData.emergencyContactName
        if (stepData.emergencyContactPhone) memberUpdateData.emergency_contact_phone = stepData.emergencyContactPhone
        if (stepData.emergencyContactRelation) memberUpdateData.emergency_contact_relation = stepData.emergencyContactRelation
        break

      case 'branchSelection':
        if (stepData.preferredBranchId) memberUpdateData.preferred_branch_id = stepData.preferredBranchId
        break
    }

    // Calculate completion percentage based on completed steps
    const totalSteps = 7
    const completionPercentage = Math.round((completedSteps.length / totalSteps) * 100)
    memberUpdateData.profile_completion_percentage = completionPercentage

    // Update registration status based on completion
    if (completionPercentage === 100) {
      memberUpdateData.registration_status = 'pending_documents'
    } else if (completionPercentage > 0) {
      memberUpdateData.registration_status = 'profile_incomplete'
    }

    console.log('Updating member with draft data:', memberUpdateData)

    // Update member record
    const { data: updatedMember, error: updateError } = await supabase
      .from('members')
      .update(memberUpdateData)
      .eq('id', member.id)
      .select()
      .single()

    if (updateError) {
      console.error('Member update error:', updateError)
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'خطأ في حفظ المسودة: ' + updateError.message
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Update workflow step
    const workflowStepNames = {
      personalInfo: 'personal_info_completed',
      professionalInfo: 'professional_info_completed',
      addressInfo: 'address_info_completed',
      contactInfo: 'contact_info_completed',
      branchSelection: 'branch_selected',
      documentUpload: 'documents_uploaded'
    }

    const workflowStepName = workflowStepNames[stepName as keyof typeof workflowStepNames]
    if (workflowStepName) {
      await supabase
        .from('registration_workflow')
        .upsert({
          member_id: member.id,
          step_name: workflowStepName,
          step_status: 'completed',
          completed_at: new Date().toISOString(),
          performed_by: userId,
          step_data: stepData
        }, {
          onConflict: 'member_id,step_name'
        })
    }

    console.log('Draft saved successfully')

    return new Response(
      JSON.stringify({ 
        success: true, 
        member: updatedMember,
        message: 'تم حفظ المسودة بنجاح'
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Save Draft Error:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'حدث خطأ في حفظ المسودة: ' + error.message
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})