import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
}

interface SendExistingUserOTPRequest {
  nationalId: string;
}

interface MsegatSendResponse {
  code: string | number;
  message: string;
  id: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { nationalId }: SendExistingUserOTPRequest = await req.json()

    // تبسيط logging للإنتاج
    console.log('Send OTP for existing user:', nationalId)

    // Validate input
    if (!nationalId) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'رقم الهوية الوطنية مطلوب' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Clean and validate national ID format
    const cleanNationalId = nationalId.toString().trim()

    const nationalIdRegex = /^[0-9]{10}$/
    if (!nationalIdRegex.test(cleanNationalId)) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'رقم الهوية الوطنية يجب أن يكون 10 أرقام فقط' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase configuration')
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'خطأ في إعدادات النظام'
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Search for user with comprehensive logging
    const { data: existingUser, error: userError } = await supabase
      .from('users')
      .select('id, national_id, phone, role, full_name, email, created_at, is_active, updated_at')
      .eq('national_id', cleanNationalId)
      .single()

    // Handle database errors
    if (userError) {
      console.error('❌ Database error:', userError)
      
      // If no rows found, user doesn't exist
      if (userError.code === 'PGRST116') {
        console.log('User not found:', cleanNationalId)
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: `لا يوجد حساب مسجل برقم الهوية ${cleanNationalId}. يرجى التسجيل كمستفيد جديد أو التحقق من رقم الهوية`,
            userNotFound: true,
            searchedId: cleanNationalId
          }),
          { 
            status: 404, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      // Other database errors
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'حدث خطأ في قاعدة البيانات. يرجى المحاولة مرة أخرى',
          details: userError.message
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (!existingUser) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `لا يوجد حساب مسجل برقم الهوية ${cleanNationalId}. يرجى التسجيل كمستفيد جديد`,
          userNotFound: true,
          searchedId: cleanNationalId
        }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('User found:', existingUser.id)

    // التحقق من أن الحساب نشط
    if (!existingUser.is_active) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'حسابك غير نشط. يرجى التواصل مع الإدارة لتفعيل حسابك'
        }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // التحقق من وجود رقم الجوال
    if (!existingUser.phone) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'رقم الجوال غير مسجل في حسابك. يرجى التواصل مع الإدارة لتحديث بياناتك'
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Format phone number for international format
    let formattedPhone = existingUser.phone.toString().replace(/\s|-/g, '')

    if (formattedPhone.startsWith('05')) {
      formattedPhone = '966' + formattedPhone.substring(1)
    } else if (formattedPhone.startsWith('+966')) {
      formattedPhone = formattedPhone.substring(1)
    } else if (formattedPhone.startsWith('966')) {
      // Already in correct format
    } else if (formattedPhone.startsWith('5') && formattedPhone.length === 9) {
      formattedPhone = '966' + formattedPhone
    }

    // Validate phone number format
    if (!/^966[5][0-9]{8}$/.test(formattedPhone)) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'رقم الجوال المسجل في حسابك غير صحيح. يرجى التواصل مع الإدارة'
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Generate a random 4-digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString()
    
    // Generate session ID
    const sessionId = Date.now() + Math.floor(Math.random() * 1000)

    // Calculate OTP expiration (5 minutes)
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 5);

    // Try to send real OTP via Msegat if credentials are available
    const userName = Deno.env.get('MSEGAT_USERNAME')
    const apiKey = Deno.env.get('MSEGAT_API_KEY')
    const userSender = Deno.env.get('MSEGAT_USER_SENDER') || 'OTP'

    let otpSentViaService = false
    let msegatSessionId = sessionId

    if (userName && apiKey) {
      try {
        console.log('Sending OTP via Msegat')
        
        const message = `رمز التحقق الخاص بك هو: ${otp}. صالح لمدة 5 دقائق.`;
        
        const msegatResponse = await fetch('https://www.msegat.com/gw/sendsms.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userName: userName,
            numbers: formattedPhone,
            userSender: userSender,
            apiKey: apiKey,
            msg: message
          })
        })

        const msegatResult: MsegatSendResponse = await msegatResponse.json()

        if (msegatResult.code === '1' || msegatResult.code === 1 || msegatResult.message === 'Success') {
          otpSentViaService = true
          if (typeof msegatResult.id === 'number') {
            msegatSessionId = msegatResult.id
          }
        } else {
          console.log('Msegat API failed:', msegatResult.message)
          // Will fall back to simulation
        }
      } catch (error) {
        console.error('Msegat API error:', error.message)
        // Will fall back to simulation
      }
    }

    // Store OTP in database
    const { data: otpRecord, error: otpError } = await supabase
      .from('otp_codes_temp')
      .insert({
        national_id: nationalId,
        phone_number: formattedPhone,
        otp_code: otp,
        session_id: msegatSessionId,
        expires_at: expiresAt.toISOString(),
        is_new_user: false,
        user_agent: req.headers.get('user-agent') || null,
        ip_address: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || null
      })
      .select()
      .single()

    if (otpError) {
      console.error('Error storing OTP:', otpError)
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'حدث خطأ في تخزين رمز التحقق'
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Return success response
    const responseMessage = otpSentViaService 
      ? `تم إرسال رمز التحقق بنجاح إلى رقم الجوال ${existingUser.phone}`
      : `تم إنشاء رمز التحقق (تجريبي - الرمز هو: ${otp})`

    console.log('OTP sent:', otpSentViaService ? 'via SMS' : 'simulation')

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: responseMessage,
        sessionId: msegatSessionId,
        userId: existingUser.id,
        expiresIn: 300, // 5 minutes in seconds
        sentViaService: otpSentViaService,
        userInfo: {
          name: existingUser.full_name,
          phone: existingUser.phone,
          role: existingUser.role,
          registrationDate: existingUser.created_at
        }
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Send OTP Error:', error.message)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'حدث خطأ في الخدمة. يرجى المحاولة مرة أخرى',
        details: error.message
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})