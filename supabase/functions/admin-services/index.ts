import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
}

interface AdminServicesRequest {
  action: 'list' | 'create' | 'update' | 'delete' | 'toggle_status' | 'check_has_requests';
  serviceId?: string;
  serviceData?: any;
  newStatus?: boolean;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Check for required environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing required environment variables:', {
        hasUrl: !!supabaseUrl,
        hasServiceKey: !!supabaseServiceKey,
        url: supabaseUrl,
        key: supabaseServiceKey ? 'present' : 'missing'
      })
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Server configuration error: Missing required environment variables'
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get authorization token
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Authorization header is required'
        }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Initialize Supabase client with service key for admin operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // We'll use the service role client for all operations
    // This is safe because we're in a trusted server environment (Edge Function)

    const { action, serviceId, serviceData, newStatus }: AdminServicesRequest = await req.json()

    console.log('Admin Services Request:', { action, serviceId })

    switch (action) {
      case 'list':
        // Get all services with creator information and request counts
        const { data: services, error: servicesError } = await supabase
          .from('services')
          .select(`
            id, name, description, requirements, category, max_amount, duration_days, 
            created_by, is_active, created_at, updated_at,
            reapplication_period_months, is_one_time_only,
            creator:created_by (
              full_name
            )
          `)
          .is('deleted_at', null) // استبعاد الخدمات المحذوفة
          .order('created_at', { ascending: false })

        if (servicesError) {
          throw servicesError
        }

        // Get request counts for each service
        const serviceIds = services?.map(s => s.id) || []
        
        const { data: requestCounts, error: requestError } = await supabase
          .from('requests')
          .select('service_id')
          .in('service_id', serviceIds)

        // Count requests per service
        const requestCountMap = (requestCounts || []).reduce((acc, req) => {
          acc[req.service_id] = (acc[req.service_id] || 0) + 1
          return acc
        }, {} as Record<string, number>)

        // Format the response
        const formattedServices = services?.map(service => ({
          ...service,
          creator_name: service.creator?.full_name || null,
          requests_count: requestCountMap[service.id] || 0,
          creator: undefined // Remove the nested object
        })) || []

        return new Response(
          JSON.stringify({ 
            success: true, 
            services: formattedServices
          }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )

      case 'toggle_status':
        if (!serviceId || newStatus === undefined) {
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: 'معرف الخدمة والحالة الجديدة مطلوبان' 
            }),
            { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }

        const { data: updatedService, error: updateError } = await supabase
          .from('services')
          .update({ 
            is_active: newStatus,
            updated_at: new Date().toISOString()
          })
          .eq('id', serviceId)
          .select()
          .single()

        if (updateError) {
          throw updateError
        }

        return new Response(
          JSON.stringify({ 
            success: true, 
            service: updatedService,
            message: `تم ${newStatus ? 'تفعيل' : 'إلغاء تفعيل'} الخدمة بنجاح`
          }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )

      case 'create':
        if (!serviceData) {
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: 'بيانات الخدمة مطلوبة' 
            }),
            { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }
        
        // Get admin user ID from the database
        const { data: adminUser, error: adminError } = await supabase
          .from('users')
          .select('id')
          .eq('role', 'admin')
          .limit(1)
          .single()
        
        if (adminError || !adminUser) {
          console.error('Admin user not found:', adminError)
          // Create a fallback admin ID
          const adminId = '00000000-0000-0000-0000-000000000000'
          
          // إنشاء الخدمة الجديدة
          const { data: newService, error: createError } = await supabase
            .from('services')
            .insert({
              name: serviceData.name,
              description: serviceData.description,
              requirements: serviceData.requirements,
              category: serviceData.category,
              max_amount: serviceData.max_amount,
              duration_days: serviceData.duration_days,
              created_by: adminId,
              is_active: serviceData.is_active ?? true,
              required_documents: serviceData.required_documents || null,
              reapplication_period_months: serviceData.reapplication_period_months || null,
              is_one_time_only: serviceData.is_one_time_only || false
            })
            .select()
            .single()
            
          if (createError) {
            console.error('Service creation error:', createError)
            return new Response(
              JSON.stringify({ 
                success: false, 
                error: 'حدث خطأ في إنشاء الخدمة: ' + createError.message
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
              service: newService,
              message: 'تم إنشاء الخدمة بنجاح'
            }),
            { 
              status: 201, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }
        
        // إنشاء الخدمة الجديدة
        const { data: newService, error: createError } = await supabase
          .from('services')
          .insert({
            name: serviceData.name,
            description: serviceData.description,
            requirements: serviceData.requirements,
            category: serviceData.category,
            max_amount: serviceData.max_amount,
            duration_days: serviceData.duration_days,
            created_by: adminUser.id,
            is_active: serviceData.is_active ?? true,
            required_documents: serviceData.required_documents || null,
            reapplication_period_months: serviceData.reapplication_period_months || null,
            is_one_time_only: serviceData.is_one_time_only || false
          })
          .select()
          .single()

        if (createError) {
          console.error('Service creation error:', createError)
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: 'حدث خطأ في إنشاء الخدمة: ' + createError.message
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
            service: newService,
            message: 'تم إنشاء الخدمة بنجاح'
          }),
          { 
            status: 201, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )

      case 'update':
        if (!serviceId || !serviceData) {
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: 'معرف الخدمة وبيانات الخدمة مطلوبان' 
            }),
            { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }

        // Update service
        const { data: updatedServiceData, error: updateServiceError } = await supabase
          .from('services')
          .update({
            name: serviceData.name,
            description: serviceData.description,
            requirements: serviceData.requirements,
            category: serviceData.category,
            max_amount: serviceData.max_amount,
            duration_days: serviceData.duration_days,
            is_active: serviceData.is_active,
            required_documents: serviceData.required_documents,
            reapplication_period_months: serviceData.reapplication_period_months,
            is_one_time_only: serviceData.is_one_time_only,
            updated_at: new Date().toISOString()
          })
          .eq('id', serviceId)
          .select()
          .single()

        if (updateServiceError) {
          console.error('Service update error:', updateServiceError)
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: 'حدث خطأ في تحديث الخدمة: ' + updateServiceError.message
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
            service: updatedServiceData,
            message: 'تم تحديث الخدمة بنجاح'
          }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )

      case 'delete':
        if (!serviceId) {
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: 'معرف الخدمة مطلوب' 
            }),
            { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }

        // Check if service has any requests
        const { count: requestCount } = await supabase
          .from('requests')
          .select('id', { count: 'exact' })
          .eq('service_id', serviceId)
        
        // If service has requests, don't delete it - return an error
        if (requestCount && requestCount > 0) {
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: 'لا يمكن حذف الخدمة لارتباطها بطلبات سابقة',
              hasRequests: true,
              requestCount
            }),
            { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }
        
        // Perform soft delete by setting deleted_at
        const { data: deletedService, error: deleteError } = await supabase
          .from('services')
          .update({ 
            deleted_at: new Date().toISOString(),
            is_active: false,
            updated_at: new Date().toISOString()
          })
          .eq('id', serviceId)
          .select()
          .single()
        
        if (deleteError) {
          console.error('Service deletion error:', deleteError)
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: 'حدث خطأ في حذف الخدمة: ' + deleteError.message
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
            service: deletedService,
            message: 'تم حذف الخدمة بنجاح'
          }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )

      case 'check_has_requests':
        if (!serviceId) {
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: 'معرف الخدمة مطلوب' 
            }),
            { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }

        // Check if service has any requests
        const { count: hasRequestsCount } = await supabase
          .from('requests')
          .select('id', { count: 'exact' })
          .eq('service_id', serviceId)
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            hasRequests: hasRequestsCount ? hasRequestsCount > 0 : false,
            requestCount: hasRequestsCount || 0
          }),
          { 
            status: 200, 
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
    console.error('Admin Services Error:', error)
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