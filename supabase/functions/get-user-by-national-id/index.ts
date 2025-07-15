import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
}

interface GetUserRequest {
  nationalId: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { nationalId }: GetUserRequest = await req.json()

    console.log('Get User Request:', { nationalId })

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

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    console.log('Searching for user with national_id:', nationalId)

    // Get user with member data
    const { data: user, error: userError } = await supabase
      .from('users')
      .select(`
        id, national_id, phone, role, full_name, email, branch_id, is_active, created_at, updated_at
      `)
      .eq('national_id', nationalId)
      .single()

    console.log('User search result:', { user, userError })

    if (userError) {
      console.error('Database error:', userError)
      
      if (userError.code === 'PGRST116') {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'المستخدم غير موجود' 
          }),
          { 
            status: 404, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'حدث خطأ في قاعدة البيانات: ' + userError.message
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (!user) {
      console.log('No user found')
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'المستخدم غير موجود' 
        }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('User found, getting member data...')

    // Get member data separately
    const { data: member, error: memberError } = await supabase
      .from('members')
      .select(`
        id, full_name, gender, birth_date, age, city, address, email, status, notes,
        disability_type, disability_details, disability_card_number,
        education_level, employment_status, job_title, employer, monthly_income,
        building_number, street_name, district, postal_code, additional_number,
        alternative_phone, emergency_contact_name, emergency_contact_phone, emergency_contact_relation,
        preferred_branch_id, registration_status, profile_completion_percentage,
        created_at, updated_at
      `)
      .eq('user_id', user.id)
      .single()

    console.log('Member search result:', { member, memberError })

    // Add member data to user object (even if null)
    const userWithMember = {
      ...user,
      member: member || null
    }

    if (memberError && memberError.code !== 'PGRST116') {
      console.error('Member query error:', memberError)
      // Continue without member data rather than failing
    }

    console.log('Returning user data successfully')

    return new Response(
      JSON.stringify({ 
        success: true, 
        user: userWithMember
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Get User Error:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'حدث خطأ في جلب بيانات المستخدم: ' + error.message
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})