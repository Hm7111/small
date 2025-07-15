import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const { action, query, limit = 10 } = await req.json()

    if (action !== 'search') {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid action' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const results: any[] = []

    // البحث في المستفيدين بالهوية الوطنية أو رقم الجوال - البحث في جدول users
    if (query && query.length >= 3) {
      // البحث في جدول users أولاً
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select(`
          id,
          national_id,
          full_name,
          phone,
          email,
          role
        `)
        .or(`national_id.ilike.%${query}%,phone.ilike.%${query}%,full_name.ilike.%${query}%`)
        .eq('role', 'beneficiary')
        .limit(5)

      if (!usersError && users) {
        users.forEach(user => {
          results.push({
            type: 'beneficiary',
            id: user.id,
            title: user.full_name,
            subtitle: `هوية: ${user.national_id} | جوال: ${user.phone}`,
            status: 'active',
            highlight: query,
            branch_name: 'غير محدد'
          })
        })
      }

      // البحث أيضاً في جدول members إذا لزم الأمر
      if (results.length < 5) {
        const { data: members, error: membersError } = await supabase
          .from('members')
          .select(`
            id,
            national_id,
            full_name,
            phone,
            status
          `)
          .or(`national_id.ilike.%${query}%,phone.ilike.%${query}%,full_name.ilike.%${query}%`)
          .limit(5 - results.length)

        if (!membersError && members) {
          members.forEach(member => {
            // تجنب التكرار
            if (!results.find(r => r.subtitle.includes(member.national_id))) {
              results.push({
                type: 'beneficiary',
                id: member.id,
                title: member.full_name,
                subtitle: `هوية: ${member.national_id} | جوال: ${member.phone}`,
                status: member.status,
                highlight: query,
                branch_name: 'غير محدد'
              })
            }
          })
        }
      }

      // البحث في الطلبات برقم المعاملة
      const { data: requests, error: requestsError } = await supabase
        .from('requests')
        .select(`
          id,
          status,
          requested_amount,
          services (name, category),
          members (full_name, national_id, phone)
        `)
        .ilike('id', `%${query}%`)
        .limit(3)

      if (!requestsError && requests) {
        requests.forEach((request: any) => {
          results.push({
            type: 'service_request',
            id: request.id,
            title: request.services?.name || 'خدمة غير محددة',
            subtitle: `رقم المعاملة: ${request.id.slice(-8)} | ${request.members?.full_name}`,
            status: request.status,
            highlight: query,
            requested_amount: request.requested_amount
          })
        })
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: results.slice(0, limit)
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in admin-quick-search:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'حدث خطأ في البحث السريع'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
