import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'npm:@supabase/supabase-js@2'
import { randomBytes, createHash } from 'node:crypto'

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
}

interface SendOTPRequest {
  phoneNumber: string;
  nationalId: string;
  fullName?: string;
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
    const { phoneNumber, nationalId, fullName }: SendOTPRequest = await req.json()

    console.log('Send OTP Request for new user:', { phoneNumber, nationalId, fullName })

    // Validate input
    if (!phoneNumber || !nationalId) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'رقم الجوال ورقم الهوية مطلوبان' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Validate Saudi phone number format
    const phoneRegex = /^((\+966)|0)?5[0-9]{8}$/
    if (!phoneRegex.test(phoneNumber.replace(/\s|-/g, ''))) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'رقم الجوال غير صحيح' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Validate national ID format
    const nationalIdRegex = /^[0-9]{10}$/
    if (!nationalIdRegex.test(nationalId)) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'رقم الهوية الوطنية يجب أن يكون 10 أرقام' 
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

    console.log('Checking if user already exists...')

    // التحقق من وجود المستخدم مسبقاً بالهوية الوطنية أو رقم الجوال
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id, national_id, phone, full_name, created_at')
      .or(`national_id.eq.${nationalId},phone.eq.${phoneNumber.replace(/\s|-/g, '')}`)
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking existing user:', checkError)
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'خطأ في التحقق من بيانات المستخدم' 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (existingUser) {
      console.log('User already exists:', existingUser.id)
      
      // إذا كان المستخدم موجود، إرجاع رسالة واضحة
      let errorMessage = 'يوجد حساب مسجل مسبقاً بهذه البيانات'
      
      if (existingUser.national_id === nationalId) {
        errorMessage = 'يوجد حساب مسجل مسبقاً برقم الهوية هذا. يرجى تسجيل الدخول كمستفيد موجود'
      } else if (existingUser.phone === phoneNumber.replace(/\s|-/g, '')) {
        errorMessage = 'يوجد حساب مسجل مسبقاً برقم الجوال هذا. يرجى تسجيل الدخول كمستفيد موجود'
      }

      return new Response(
        JSON.stringify({ 
          success: false, 
          error: errorMessage,
          userExists: true,
          existingUser: {
            nationalId: existingUser.national_id,
            phone: existingUser.phone,
            name: existingUser.full_name,
            registrationDate: existingUser.created_at
          }
        }),
        { 
          status: 409, // Conflict status
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('User does not exist, proceeding with OTP')

    // Generate a random 4-digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    
    // Format phone number for international format
    let formattedPhone = phoneNumber.replace(/\s|-/g, '')
    if (formattedPhone.startsWith('05')) {
      formattedPhone = '966' + formattedPhone.substring(1)
    } else if (formattedPhone.startsWith('+966')) {
      formattedPhone = formattedPhone.substring(1)
    } else if (formattedPhone.startsWith('966')) {
      // Already in correct format
    } else if (formattedPhone.startsWith('5') && formattedPhone.length === 9) {
      formattedPhone = '966' + formattedPhone
    }

    console.log('Formatted phone for OTP:', formattedPhone)

    // Calculate OTP expiration (5 minutes)
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 5);

    let msegatSessionId = Date.now() + Math.floor(Math.random() * 10000);
    let otpSentViaService = false;
    
    // Try to send real OTP via Msegat if credentials are available
    const userName = Deno.env.get('MSEGAT_USERNAME')
    const apiKey = Deno.env.get('MSEGAT_API_KEY')
    const userSender = Deno.env.get('MSEGAT_USER_SENDER') || 'OTP'

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

        console.log('Msegat response:', msegatResult);

        if (msegatResult.code === '1' || msegatResult.code === 1 || msegatResult.message === 'Success') {
          otpSentViaService = true;
          if (typeof msegatResult.id === 'number') {
            msegatSessionId = msegatResult.id;
          }
        } else {
          console.log('Msegat API failed:', msegatResult.message);
          // Will fall back to simulation
        }
      } catch (error) {
        console.error('Msegat API error:', error.message);
        // Will fall back to simulation
      }
    } else {
      console.log('Msegat credentials not available, using simulation mode')
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
        is_new_user: true,
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
      ? `تم إرسال رمز التحقق بنجاح إلى رقم الجوال ${phoneNumber}`
      : `تم إنشاء رمز التحقق (تجريبي - الرمز هو: ${otp})`

    console.log('OTP process completed successfully')

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: responseMessage,
        sessionId: msegatSessionId,
        expiresIn: 300, // 5 minutes in seconds
        sentViaService: otpSentViaService,
        isNewUser: true
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Send OTP Error:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'حدث خطأ في الخدمة: ' + error.message
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})