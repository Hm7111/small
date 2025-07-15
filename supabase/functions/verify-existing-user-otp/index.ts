import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'npm:@supabase/supabase-js@2'
import { randomBytes, createHash } from 'node:crypto'

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
}

interface VerifyExistingUserOTPRequest {
  nationalId: string;
  otpCode: string;
  sessionId?: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { nationalId, otpCode, sessionId }: VerifyExistingUserOTPRequest = await req.json()
    console.log('Verify existing user OTP request:', { nationalId, otpCode, sessionId })

    // Validate input
    if (!nationalId || !otpCode) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'رقم الهوية ورمز التحقق مطلوبان',
          errorCode: 'MISSING_FIELDS'
        }),
        {
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Validate OTP format
    if (!/^[0-9]{4}$/.test(otpCode)) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'رمز التحقق يجب أن يكون 4 أرقام',
          errorCode: 'INVALID_OTP_FORMAT'
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

    // Retrieve OTP record
    console.log('Retrieving OTP record for nationalId:', nationalId, 'sessionId:', sessionId)

    // Build query for OTP record
    let query = supabase
      .from('otp_codes_temp')
      .select('*')
      .eq('national_id', nationalId)
      .eq('is_verified', false) // Only get unused OTPs

    // Add sessionId to query if provided
    if (sessionId) {
      query = query.eq('session_id', sessionId)
    }

    // Execute query
    const { data: otpRecord, error: otpError } = await query.single()

    // Log detailed information about the query result
    console.log('OTP query result:', { 
      found: !!otpRecord, 
      error: otpError ? `${otpError.code}: ${otpError.message}` : null,
      sessionIdUsed: !!sessionId
    })

    // Check if OTP record exists
    if (otpError || !otpRecord) {
      console.error("OTP record not found or error:", otpError)
      return new Response(
        JSON.stringify({
          success: false,
          error: 'رمز التحقق غير موجود أو انتهت صلاحيته. يرجى طلب رمز جديد',
          errorCode: 'OTP_NOT_FOUND',
          details: otpError ? otpError.message : 'No OTP record found'
        }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if OTP is already verified (double-check for race conditions)
    if (otpRecord.is_verified) {
      console.log('OTP already verified - preventing reuse')
      return new Response(
        JSON.stringify({
          success: false,
          error: 'رمز التحقق مُستخدم مسبقاً. يرجى طلب رمز جديد',
          errorCode: 'OTP_ALREADY_USED'
        }),
        { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // Check if OTP is expired
    if (new Date(otpRecord.expires_at) < new Date()) {
      console.log('OTP expired')
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'انتهت صلاحية رمز التحقق. يرجى طلب رمز جديد',
          errorCode: 'OTP_EXPIRED'
        }),
        { 
          status: 410, // Gone
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }
    
    // Verify OTP code
    if (otpRecord.otp_code !== otpCode) {
      console.log("Invalid OTP provided")
      await supabase
        .from('otp_codes_temp')
        .update({ verification_attempts: otpRecord.verification_attempts + 1 })
        .eq('id', otpRecord.id)
        
      return new Response(
        JSON.stringify({
          success: false,
          error: 'رمز التحقق غير صحيح',
          errorCode: 'INVALID_OTP'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // Mark OTP as verified (atomic operation to prevent race conditions)
    const { error: verifyError } = await supabase
      .from('otp_codes_temp')
      .update({ is_verified: true })
      .eq('id', otpRecord.id)
      .eq('is_verified', false) // Only update if not already verified

    if (verifyError) {
      console.error('Error marking OTP as verified:', verifyError)
      return new Response(
        JSON.stringify({
          success: false,
          error: 'خطأ في تحديث حالة رمز التحقق',
          errorCode: 'OTP_UPDATE_ERROR'
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get user from database
    let existingUser;
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, national_id, phone, role, full_name, email, branch_id, is_active, created_at, updated_at')
        .eq('national_id', nationalId)
        .single()
      
      if (error) {
        console.error('Error fetching user:', error)
        throw error // Throw error if user not found in public.users
      }
      existingUser = data
      console.log('User retrieved from public.users successfully:', existingUser.id)
    } catch (userError) {
      console.error('Error fetching user:', userError)
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'لم يتم العثور على المستخدم',
          errorCode: 'USER_NOT_FOUND'
        }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // CRITICAL STEP: Verify user exists in Supabase Auth (GoTrue)
    let authUser;
    try {
      console.log('Attempting to get user from Supabase Auth (GoTrue) with ID:', existingUser.id)
      const { data: gotrueUser, error: gotrueError } = await supabase.auth.admin.getUserById(existingUser.id)
      
      // If user doesn't exist in auth.users, create them
      if (gotrueError || !gotrueUser.user) {
        console.error('User not found in Supabase Auth (GoTrue):', gotrueError)
        console.log('Creating user in Supabase Auth (GoTrue)...')
        
        // Generate a secure random password for the user
        const generatedPasswordBytes = randomBytes(16)
        const generatedPassword = generatedPasswordBytes.toString('base64')
        
        // Create email if not available
        const userEmail = existingUser.email || `${nationalId}@placeholder.com`
        
        // Create user in auth.users
        const { data: newAuthUser, error: createAuthError } = await supabase.auth.admin.createUser({
          email: userEmail,
          password: generatedPassword,
          email_confirm: true,
          phone_confirm: true,
          user_metadata: {
            national_id: nationalId,
            full_name: existingUser.full_name,
            role: existingUser.role
          },
          // CRITICAL: Use the same UUID as in public.users
          id: existingUser.id
        })
        
        if (createAuthError) {
          console.error('Error creating user in Supabase Auth:', createAuthError)
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: 'فشل في إنشاء المستخدم في نظام المصادقة',
              errorCode: 'AUTH_USER_CREATION_ERROR',
              details: createAuthError.message
            }),
            { 
              status: 500, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }
        
        authUser = newAuthUser.user
        console.log('User created in Supabase Auth (GoTrue):', authUser.id)
        
        // Store the password hash for future sign-ins
        const passwordHash = createHash('sha256').update(generatedPassword).digest('hex')
        
        await supabase
          .from('user_passwords')
          .upsert({
            user_id: authUser.id,
            password_hash: passwordHash,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'user_id'
          })
          
        console.log('Password hash stored for future sign-ins')
      } else {
        authUser = gotrueUser.user
        console.log('User found in Supabase Auth (GoTrue):', authUser.id)
      }
    } catch (e) {
      console.error('Unexpected error during GoTrue user lookup or creation:', e)
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'خطأ داخلي أثناء التحقق من المستخدم في نظام المصادقة.',
          errorCode: 'AUTH_LOOKUP_ERROR',
          details: e instanceof Error ? e.message : 'Unknown error'
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Create a session for the user using the admin API
    let session; // Declare session variable
    try {
      // Generate a secure random password for the user
      const generatedPasswordBytes = randomBytes(16);
      const generatedPassword = generatedPasswordBytes.toString('base64');

      // إذا كان المستخدم موجود في auth.users، حدث كلمة المرور أولاً
      if (authUser) {
        console.log('Updating password for existing auth user');
        const { error: updateError } = await supabase.auth.admin.updateUserById(authUser.id, {
          password: generatedPassword
        });
        
        if (updateError) {
          console.error('Error updating user password:', updateError);
          // لا نعيد خطأ هنا، نستمر بمحاولة تسجيل الدخول
        } else {
          console.log('User password updated successfully');
        }
      }
      
      // Sign in with email/password
      console.log('Attempting to sign in user with password');
      
      // Use the existing user's email or create a placeholder
      const userEmail = existingUser.email || `${existingUser.national_id || existingUser.phone}@placeholder.com`;
      
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: userEmail,
        password: generatedPassword
      });
      
      // If sign in failed (likely because the user exists in public.users but not in auth.users)
      if (signInError) {
        console.log('Sign in failed. Attempting to create auth user first:', signInError.message);
        
        // لاحظ: هذا الجزء سيعمل فقط إذا لم يكن المستخدم موجودًا في auth.users أصلاً
        // وإلا، كنا قد حدثنا كلمة المرور أعلاه
        
        // Create user in auth.users with the same UUID as in public.users
        const { data: authUserData, error: createAuthError } = await supabase.auth.admin.createUser({
          email: userEmail,
          password: generatedPassword,
          email_confirm: true,
          phone_confirm: true,
          user_metadata: {
            national_id: existingUser.national_id,
            full_name: existingUser.full_name,
            role: existingUser.role
          },
          // CRITICAL: Use the same UUID as in public.users
          id: existingUser.id
        });
        
        if (createAuthError) {
          console.error('Error creating auth user:', createAuthError);
          return new Response(
            JSON.stringify({
              success: false,
              error: 'فشل في إنشاء المستخدم في نظام المصادقة: ' + createAuthError.message,
              errorCode: 'AUTH_USER_CREATION_ERROR'
            }),
            {
              status: 500,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          );
        }
        
        // Now try sign in again
        const { data: signInData, error: secondSignInError } = await supabase.auth.signInWithPassword({
          email: userEmail,
          password: generatedPassword
        });
        
        if (secondSignInError) {
          console.error('Error signing in after creating auth user:', secondSignInError);
          return new Response(
            JSON.stringify({
              success: false,
              error: 'فشل في تسجيل الدخول بعد إنشاء المستخدم: ' + secondSignInError.message,
              errorCode: 'SIGN_IN_ERROR'
            }),
            {
              status: 500,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          );
        }
        
        session = signInData.session;
      } else {
        session = data.session;
      }
      
      console.log('Session created successfully for user:', existingUser.id)
    } catch (sessionError) {
      console.error('Exception in session creation (catch block):', sessionError)
      console.error('Error type:', typeof sessionError)
      console.error('Error stringified:', JSON.stringify(sessionError, Object.getOwnPropertyNames(sessionError)))
      
      const errorMessage = sessionError instanceof Error 
        ? sessionError.message 
        : 'خطأ غير معروف في إنشاء الجلسة'
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: errorMessage.includes('User not found') || errorMessage.includes('user_not_found')
            ? 'المستخدم غير موجود في نظام المصادقة. يرجى المحاولة مرة أخرى'
            : `حدث خطأ في إنشاء جلسة المصادقة: ${errorMessage}`,
          errorCode: 'SESSION_CREATION_EXCEPTION',
          errorDetails: sessionError instanceof Error ? {
            name: sessionError.name,
            message: sessionError.message,
            stack: sessionError.stack
          } : sessionError
        }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }
    
    // Check if account is active (from public.users)
    if (!existingUser.is_active) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'حسابك غير نشط. يرجى التواصل مع الإدارة',
          errorCode: 'ACCOUNT_INACTIVE'
        }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get member data for the user (if applicable)
    const { data: memberData, error: memberError } = await supabase
      .from('members')
      .select('*')
      .eq('user_id', existingUser.id)
      .maybeSingle()

    if (memberError && memberError.code !== 'PGRST116') {
      console.error('Error fetching member data (non-critical):', memberError)
    }
   
    console.log('Member data status:', memberData ? 'found' : 'not found')

    // Update last login timestamp
    await supabase
      .from('users')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', existingUser.id)
   
    // Combine user and member data
    const userData = {
      ...existingUser,
      member: memberData || null
    }
    
    console.log('Authentication successful - returning user and session data')

    return new Response(
      JSON.stringify({
        success: true, 
        user: userData,
        message: "تم التحقق بنجاح",
        session: session
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Verify OTP Error (Main Catch Block):', error.message)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'حدث خطأ في التحقق: ' + error.message,
        errorCode: 'GENERAL_ERROR'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})