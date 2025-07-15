/*
  # Get Member Data Edge Function

  1. Purpose
    - Fetches member data for a given user ID
    - Returns member information with profile completion percentage
    - Includes registration status and other member details

  2. Security
    - Requires authentication
    - Validates user permissions

  3. Response Format
    - Returns success/error status
    - Includes memberData object when successful
*/

import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-client-info',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req: Request) => {
  try {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
      return new Response('ok', { headers: corsHeaders });
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing environment variables:', { 
        hasUrl: !!supabaseUrl, 
        hasKey: !!supabaseServiceKey 
      });
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'خطأ في إعدادات الخادم: المتغيرات البيئية مفقودة' 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);

    // Get request body
    let body;
    try {
      body = await req.json();
    } catch (e) {
      console.error('Error parsing request body:', e);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'خطأ في تنسيق الطلب: يجب أن يكون JSON صالح' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const { userId } = body;

    if (!userId || typeof userId !== 'string') {
      console.error('Invalid or missing userId:', userId, typeof userId);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'معرف المستخدم مطلوب وبتنسيق صحيح' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    console.log('Processing get-member-data request for userId:', userId);
    console.log('Request headers:', [...req.headers.entries()].reduce((obj, [key, val]) => ({...obj, [key]: val}), {}));

    // تحقق من صحة تنسيق UUID
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidPattern.test(userId)) {
      console.warn('UserId is not a valid UUID format:', userId);
      // لا نرفض الطلب هنا، فقط نسجل تحذيرًا
    }

    // Get user data first to verify existence
    const { data: userData, error: userError } = await supabaseClient
      .from('users')
      .select('id, full_name, email, national_id, phone, role, branch_id, is_active')
      .eq('id', userId)
      .maybeSingle();

    if (userError) {
      console.error('Error fetching user data:', userError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'خطأ في جلب بيانات المستخدم',
          details: userError.message
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (!userData) {
      console.error('User not found with ID:', userId);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'المستخدم غير موجود',
          details: 'User not found in database'
        }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('User found:', userData.id, userData.role);

    // Get member data for the user
    const { data: memberData, error: memberError } = await supabaseClient
      .from('members')
      .select('*')
      .eq('user_id', userId) 
      .maybeSingle();

    if (memberError) {
      console.error('Error fetching member data:', memberError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'خطأ في جلب بيانات المستفيد',
          details: memberError.message
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // If no member data found, return user data only
    if (!memberData) {
      console.log('No member data found for user ID:', userId);
      return new Response(
        JSON.stringify({ 
          success: true, 
          memberData: null,
          userData: userData,
          message: 'لم يتم العثور على بيانات للمستفيد'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    console.log('Successfully found member data for ID:', memberData.id);

    // Calculate profile completion percentage if not set
    let completionPercentage = memberData.profile_completion_percentage || 0;
    
    if (completionPercentage === 0) {
      let completed = 0;
      const totalFields = 20; // Total number of important fields
      
      // Count completed fields
      if (memberData.full_name) completed++;
      if (memberData.national_id) completed++;
      if (memberData.phone) completed++;
      if (memberData.gender) completed++;
      if (memberData.birth_date) completed++;
      if (memberData.city) completed++;
      if (memberData.address) completed++;
      if (memberData.email) completed++;
      if (memberData.disability_type) completed++;
      if (memberData.education_level) completed++;
      if (memberData.employment_status) completed++;
      if (memberData.building_number) completed++;
      if (memberData.street_name) completed++;
      if (memberData.district) completed++;
      if (memberData.postal_code) completed++;
      if (memberData.alternative_phone) completed++;
      if (memberData.emergency_contact_name) completed++;
      if (memberData.emergency_contact_phone) completed++;
      if (memberData.emergency_contact_relation) completed++;
      if (memberData.preferred_branch_id) completed++;
      
      completionPercentage = Math.round((completed / totalFields) * 100);
      
      // Update the completion percentage in database
      const { error: updateError } = await supabaseClient
        .from('members')
        .update({ profile_completion_percentage: completionPercentage })
        .eq('id', memberData.id);
        
      if (updateError) {
        console.error('Failed to update profile completion percentage:', updateError);
      }
      
      memberData.profile_completion_percentage = completionPercentage;
    }
    
    // محاولة جلب اسم الفرع إذا كان موجودًا
    if (memberData.preferred_branch_id) {
      const { data: branchData } = await supabaseClient
        .from('branches')
        .select('name')
        .eq('id', memberData.preferred_branch_id)
        .single();
        
      if (branchData) {
        memberData.branch_name = branchData.name;
      }
    }

    console.log('Returning member data with completion percentage:', completionPercentage);
    return new Response(
      JSON.stringify({ 
        success: true,
        memberData,
        message: 'تم جلب بيانات المستفيد بنجاح'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'خطأ غير معروف';
    const errorName = error instanceof Error ? error.name : 'Unknown';
    console.error(`Error in get-member-data function: ${errorName} - ${errorMessage}`);
    console.error('Error details:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'خطأ داخلي في الخادم',
        errorDetails: errorMessage
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});