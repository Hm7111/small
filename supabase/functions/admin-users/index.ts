import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
}

interface AdminUsersRequest {
  action: 'list' | 'create' | 'update' | 'delete' | 'toggle_status';
  userId?: string;
  userData?: any;
  newStatus?: boolean;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { action, userId, userData, newStatus }: AdminUsersRequest = await req.json()

    console.log('Admin Users Request:', { action, userId })

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    switch (action) {
      case 'list':
        // Get all users with branch information
        const { data: users, error: usersError } = await supabase
          .from('users')
          .select(`
            id, full_name, email, national_id, phone, role, branch_id, is_active, created_at, updated_at,
            branches:branch_id (
              name
            )
          `)
          .order('created_at', { ascending: false })

        if (usersError) {
          throw usersError
        }

        // Format the response
        const formattedUsers = users?.map(user => ({
          ...user,
          branch_name: user.branches?.name || null,
          branches: undefined // Remove the nested object
        })) || []

        return new Response(
          JSON.stringify({ 
            success: true, 
            users: formattedUsers
          }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )

      case 'toggle_status':
        if (!userId || newStatus === undefined) {
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: 'معرف المستخدم والحالة الجديدة مطلوبان' 
            }),
            { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }

        const { data: updatedUser, error: updateError } = await supabase
          .from('users')
          .update({ 
            is_active: newStatus,
            updated_at: new Date().toISOString()
          })
          .eq('id', userId)
          .select()
          .single()

        if (updateError) {
          throw updateError
        }

        return new Response(
          JSON.stringify({ 
            success: true, 
            user: updatedUser,
            message: `تم ${newStatus ? 'تفعيل' : 'إلغاء تفعيل'} المستخدم بنجاح`
          }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )

      case 'create':
        if (!userData) {
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: 'بيانات المستخدم مطلوبة' 
            }),
            { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }
        
        // التحقق من عدم وجود تكرار في البريد الإلكتروني أو رقم الهوية
        if (userData.email) {
          const { data: existingEmail } = await supabase
            .from('users')
            .select('id')
            .eq('email', userData.email)
            .single()
            
          if (existingEmail) {
            return new Response(
              JSON.stringify({ 
                success: false, 
                error: 'البريد الإلكتروني مستخدم بالفعل' 
              }),
              { 
                status: 400, 
                headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
              }
            )
          }
        }
        
        if (userData.national_id) {
          const { data: existingNationalId } = await supabase
            .from('users')
            .select('id')
            .eq('national_id', userData.national_id)
            .single()
            
          if (existingNationalId) {
            return new Response(
              JSON.stringify({ 
                success: false, 
                error: 'رقم الهوية الوطنية مستخدم بالفعل' 
              }),
              { 
                status: 400, 
                headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
              }
            )
          }
        }
        
        // إنشاء المستخدم الجديد
        const { data: newUser, error: createError } = await supabase
          .from('users')
          .insert({
            full_name: userData.full_name,
            email: userData.email,
            national_id: userData.national_id,
            phone: userData.phone,
            role: userData.role,
            branch_id: userData.branch_id,
            is_active: userData.is_active ?? true
          })
          .select()
          .single()

        if (createError) {
          console.error('User creation error:', createError)
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: 'حدث خطأ في إنشاء المستخدم: ' + createError.message
            }),
            { 
              status: 500, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }

        return new Response(
          JSON.stringify({ 
            success: true, 
            user: newUser,
            message: 'تم إنشاء المستخدم بنجاح'
          }),
          { 
            status: 201, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )

      case 'update':
        // TODO: Implement user update
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'تحديث المستخدمين قيد التطوير' 
          }),
          { 
            status: 501, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )

      case 'delete':
        // TODO: Implement user deletion (soft delete)
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'حذف المستخدمين قيد التطوير' 
          }),
          { 
            status: 501, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )

      default:
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'عملية غير مدعومة' 
          }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
    }

  } catch (error) {
    console.error('Admin Users Error:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'حدث خطأ في العملية: ' + error.message
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})