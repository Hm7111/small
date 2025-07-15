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
    const { email, password } = await req.json()
    
    // Default values if not provided
    const adminEmail = email || 'admin@charity.org'
    const adminPassword = password || 'Hm711473683@'

    console.log('Creating admin user with email:', adminEmail)

    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Check if the admin user already exists in auth.users
    const { data: { users: existingAuthUsers }, error: authListError } = await supabase.auth.admin.listUsers({
      filter: {
        email: adminEmail
      }
    })

    console.log('Existing auth users:', existingAuthUsers?.length || 0)

    let authUserId: string | null = null
    
    // Create auth user if it doesn't exist
    if (!existingAuthUsers || existingAuthUsers.length === 0) {
      // Create user in auth.users
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: adminEmail,
        password: adminPassword,
        email_confirm: true,
        user_metadata: {
          role: 'admin',
          full_name: 'مدير النظام'
        }
      })

      if (authError) {
        console.error('Error creating auth user:', authError)
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: `خطأ في إنشاء حساب المصادقة: ${authError.message}` 
          }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      authUserId = authData.user.id
      console.log('Created new auth user with ID:', authUserId)
    } else {
      authUserId = existingAuthUsers[0].id
      console.log('Found existing auth user with ID:', authUserId)
    }

    // Check if admin user exists in public.users
    const { data: existingUser, error: userCheckError } = await supabase
      .from('users')
      .select('id')
      .eq('email', adminEmail)
      .single()

    if (userCheckError && userCheckError.code !== 'PGRST116') {
      console.error('Error checking existing user:', userCheckError)
    }

    let publicUserId: string | null = null

    if (!existingUser) {
      // Create user in public.users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .insert({
          id: authUserId, // Use the auth user ID
          full_name: 'مدير النظام',
          email: adminEmail,
          phone: '+966500000000',
          role: 'admin',
          is_active: true
        })
        .select('id')
        .single()

      if (userError) {
        console.error('Error creating user in public.users:', userError)
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: `خطأ في إنشاء المستخدم في قاعدة البيانات: ${userError.message}` 
          }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      publicUserId = userData.id
      console.log('Created user in public.users with ID:', publicUserId)
    } else {
      publicUserId = existingUser.id
      console.log('Found existing user in public.users with ID:', publicUserId)

      // Update user to ensure it has admin role
      await supabase
        .from('users')
        .update({
          role: 'admin',
          is_active: true,
          full_name: 'مدير النظام',
          phone: '+966500000000',
          updated_at: new Date().toISOString()
        })
        .eq('id', publicUserId)

      console.log('Updated existing user to ensure admin role')
    }

    // Check if there are services referencing a non-existent admin
    const { data: orphanedServices, error: serviceCheckError } = await supabase
      .from('services')
      .select('id, created_by')
      .is('created_by', null)

    if (serviceCheckError) {
      console.error('Error checking orphaned services:', serviceCheckError)
    } else if (orphanedServices && orphanedServices.length > 0) {
      // Update orphaned services to use the new admin ID
      const { error: serviceUpdateError } = await supabase
        .from('services')
        .update({ created_by: publicUserId })
        .is('created_by', null)

      if (serviceUpdateError) {
        console.error('Error updating orphaned services:', serviceUpdateError)
      } else {
        console.log(`Updated ${orphanedServices.length} orphaned services to use new admin ID`)
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'تم إنشاء حساب الإدارة بنجاح',
        userId: publicUserId,
        authUserId: authUserId
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Create Admin User Error:', error)
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