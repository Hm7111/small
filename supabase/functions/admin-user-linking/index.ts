import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { auth_user_id } = await req.json()
    
    if (!auth_user_id) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'معرف المستخدم في نظام المصادقة مطلوب' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Admin User Linking Request. Auth User ID:', auth_user_id)

    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Check if auth user exists
    const { data: { user: authUser }, error: authUserError } = await supabase.auth.admin.getUserById(auth_user_id)
    
    if (authUserError || !authUser) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'لم يتم العثور على المستخدم في نظام المصادقة' 
        }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }
    
    console.log('Auth user found:', authUser.email)

    // Check if user exists in public.users
    const { data: publicUser, error: publicUserError } = await supabase
      .from('users')
      .select('*')
      .eq('id', auth_user_id)
      .single()
    
    // Public user exists, update if needed
    if (publicUser) {
      console.log('Public user found:', publicUser.id)
      
      // Check if needs update
      if (publicUser.role !== 'admin' || publicUser.email !== 'admin@charity.org' || !publicUser.is_active) {
        console.log('Updating existing public user to admin role')
        
        const { data: updatedUser, error: updateError } = await supabase
          .from('users')
          .update({
            role: 'admin',
            email: 'admin@charity.org',
            full_name: 'مدير النظام',
            is_active: true,
            updated_at: new Date().toISOString()
          })
          .eq('id', auth_user_id)
          .select()
          .single()
        
        if (updateError) {
          console.error('Error updating public user:', updateError)
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: 'خطأ في تحديث المستخدم في قاعدة البيانات' 
            }),
            { 
              status: 500, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }
        
        console.log('Public user updated successfully')
      } else {
        console.log('Public user already has admin role, no update needed')
      }
    } 
    // Public user doesn't exist, create it
    else if (publicUserError && publicUserError.code === 'PGRST116') {
      console.log('Public user not found, creating new admin user')
      
      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert({
          id: auth_user_id,
          full_name: 'مدير النظام',
          email: 'admin@charity.org',
          phone: '+966500000000',
          role: 'admin',
          is_active: true
        })
        .select()
        .single()
      
      if (insertError) {
        console.error('Error creating public user:', insertError)
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'خطأ في إنشاء المستخدم في قاعدة البيانات' 
          }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }
      
      console.log('Public admin user created successfully')
    } 
    // Other error
    else {
      console.error('Error checking public user:', publicUserError)
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'خطأ في التحقق من وجود المستخدم في قاعدة البيانات' 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Update auth user metadata to include role
    const { error: updateMetadataError } = await supabase.auth.admin.updateUserById(
      auth_user_id,
      { 
        user_metadata: { 
          role: 'admin',
          full_name: 'مدير النظام'
        },
        app_metadata: {
          role: 'admin'
        }
      }
    )
    
    if (updateMetadataError) {
      console.error('Error updating auth user metadata:', updateMetadataError)
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'خطأ في تحديث بيانات المستخدم في نظام المصادقة' 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }
    
    console.log('Auth user metadata updated successfully')

    // Fix any services referencing NULL created_by
    const { data: serviceCount, error: countError } = await supabase
      .from('services')
      .select('id', { count: 'exact' })
      .is('created_by', null)
      
    if (!countError && serviceCount && serviceCount > 0) {
      console.log('Found', serviceCount, 'services with NULL created_by, updating them')
      
      const { error: updateServicesError } = await supabase
        .from('services')
        .update({ created_by: auth_user_id })
        .is('created_by', null)
      
      if (updateServicesError) {
        console.error('Error updating services:', updateServicesError)
      } else {
        console.log('Updated services successfully')
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'تم ربط حساب المدير بنجاح',
        userId: auth_user_id
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Admin User Linking Error:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: `حدث خطأ غير متوقع: ${error.message}` 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})