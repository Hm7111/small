import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'npm:@supabase/supabase-js@2'
import { randomBytes, createHash } from 'node:crypto'

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
}

interface VerifyOTPRequest {
  phoneNumber: string;
  nationalId: string;
  fullName?: string;
  otpCode: string;
  sessionId: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { phoneNumber, nationalId, fullName, otpCode, sessionId }: VerifyOTPRequest = await req.json()

    console.log('Verify OTP Request:', { phoneNumber, nationalId, fullName, otpCode, sessionId })

    // Validate input
    if (!phoneNumber || !nationalId || !otpCode) {
      console.log('Missing required fields')
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'رقم الجوال ورقم الهوية ورمز التحقق مطلوبان' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Validate OTP format
    if (!/^[0-9]{4}$/.test(otpCode)) {
      console.log('Invalid OTP format:', otpCode)
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'رمز التحقق يجب أن يكون 4 أرقام' 
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
    
    // Format phone number
    let formattedPhone = phoneNumber.replace(/\s|-/g, '')
    if (formattedPhone.startsWith('05')) {
      formattedPhone = formattedPhone
    } else if (formattedPhone.startsWith('+966')) {
      formattedPhone = '0' + formattedPhone.substring(4)
    } else if (formattedPhone.startsWith('966')) {
      formattedPhone = '0' + formattedPhone.substring(3)
    } else if (formattedPhone.startsWith('5') && formattedPhone.length === 9) {
      formattedPhone = '0' + formattedPhone
    }

    // Retrieve OTP record
    const { data: otpRecord, error: otpError } = await supabase
      .from('otp_codes_temp')
      .select('*')
      .eq('session_id', sessionId)
      .eq('national_id', nationalId)
      .eq('is_verified', false)
      .single()

    if (otpError) {
      console.error('Error retrieving OTP:', otpError)
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'لم يتم العثور على جلسة التحقق أو انتهت صلاحيتها'
        }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('OTP record found, checking expiration and verification status')

    // Check if OTP is expired
    if (new Date(otpRecord.expires_at) < new Date()) {
      console.log('OTP expired')
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'انتهت صلاحية رمز التحقق. يرجى طلب رمز جديد'
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Check if OTP is valid
    if (otpRecord.otp_code !== otpCode) {
      // Update verification attempts
      await supabase
        .from('otp_codes_temp')
        .update({ verification_attempts: otpRecord.verification_attempts + 1 })
        .eq('id', otpRecord.id)

      console.log('Invalid OTP')
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'رمز التحقق غير صحيح'
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('OTP verified successfully, proceeding with user creation')

    // Mark OTP as verified
    await supabase
      .from('otp_codes_temp')
      .update({ is_verified: true })
      .eq('id', otpRecord.id)

    // Generate a secure random password for the user
    const generatedPasswordBytes = randomBytes(16);
    const generatedPassword = generatedPasswordBytes.toString('base64');
    
    // Hash the password for storage
    const passwordHash = createHash('sha256').update(generatedPassword).digest('hex');

    // Check if user already exists in auth.users
    let authUser;
    try {
      // Try to find existing auth user by phone number
      const { data: existingAuthUsers, error: authQueryError } = await supabase.auth.admin.listUsers({
        filter: {
          phone: otpRecord.phone_number
        }
      });

      if (!authQueryError && existingAuthUsers && existingAuthUsers.users.length > 0) {
        authUser = existingAuthUsers.users[0];
        console.log('Existing auth user found:', authUser.id);
      } else {
        console.log('No existing auth user found, creating new one');
        
        // Create a new auth user
        const { data: newAuthUser, error: createAuthError } = await supabase.auth.admin.createUser({
          phone: otpRecord.phone_number,
          password: generatedPassword,
          email_confirm: true,
          phone_confirm: true,
          user_metadata: {
            national_id: nationalId,
            full_name: fullName || ''
          }
        });
        
        if (createAuthError) {
          console.error('Error creating auth user:', createAuthError);
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: 'فشل إنشاء حساب المستخدم: ' + createAuthError.message
            }),
            { 
              status: 500, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }
        
        authUser = newAuthUser.user;
        console.log('New auth user created:', authUser.id);
      }
    } catch (authError) {
      console.error('Auth operation error:', authError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'حدث خطأ في عمليات المصادقة: ' + authError.message
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Store the password hash for future sign-ins
    await supabase
      .from('user_passwords')
      .upsert({
        user_id: authUser.id,
        password_hash: passwordHash,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      });

    // Create user in public.users table
    const { data: newUser, error: userError } = await supabase
      .from('users')
      .upsert({
        id: authUser.id, // Use the auth.user id
        national_id: nationalId,
        phone: formattedPhone,
        full_name: fullName || '',
        role: 'beneficiary',
        is_active: true
      }, {
        onConflict: 'id'
      })
      .select('*')
      .single();

    if (userError) {
      console.error('User creation/update error:', userError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'خطأ في إنشاء حساب المستخدم: ' + userError.message
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('User created/updated successfully:', newUser.id);

    // Create or update member record
    const { data: newMember, error: memberError } = await supabase
      .from('members')
      .upsert({
        user_id: newUser.id,
        national_id: nationalId,
        phone: formattedPhone,
        full_name: fullName || '',
        gender: 'male', // Default, will be updated later
        city: '', // Will be filled in registration
        registration_status: 'profile_incomplete',
        profile_completion_percentage: 5, // Just started
        status: 'active'
      }, {
        onConflict: 'user_id'
      })
      .select('*')
      .single();

    if (memberError) {
      console.error('Member creation/update error:', memberError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'خطأ في إنشاء ملف المستفيد: ' + memberError.message
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Member created/updated successfully:', newMember.id);

    // Create registration workflow steps if new member
    if (otpRecord.is_new_user) {
      // Create workflow steps
      const workflowSteps = [
        'registration_started',
        'personal_info_completed',
        'professional_info_completed',
        'address_info_completed',
        'contact_info_completed',
        'branch_selected',
        'documents_uploaded'
      ];

      const workflowInserts = workflowSteps.map((step, index) => ({
        member_id: newMember.id,
        step_name: step,
        step_status: index === 0 ? 'in_progress' : 'pending',
        started_at: index === 0 ? new Date().toISOString() : null,
        performed_by: index === 0 ? newUser.id : null
      }));

      const { error: workflowError } = await supabase
        .from('registration_workflow')
        .upsert(workflowInserts);

      if (workflowError) {
        console.error('Workflow creation error:', workflowError);
        // Don't fail the whole process, just log the error
      } else {
        console.log('Workflow steps created successfully');
      }
    }

    // Sign in the user
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      phone: otpRecord.phone_number,
      password: generatedPassword
    });

    if (signInError) {
      console.error('Sign in error:', signInError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'حدث خطأ أثناء تسجيل الدخول: ' + signInError.message
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Add member data to user object
    const userWithMember = {
      ...newUser,
      member: newMember
    };

    console.log('Registration completed successfully for user:', newUser.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        user: userWithMember,
        member: newMember,
        session: signInData.session,
        isNewUser: otpRecord.is_new_user,
        message: 'تم التحقق وإنشاء الحساب بنجاح'
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Verify OTP Error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'حدث خطأ في التحقق: ' + error.message
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});