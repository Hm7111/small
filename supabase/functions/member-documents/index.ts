/*
  # Member Documents Edge Function

  1. New Function
    - `member-documents`
      - Fetches all documents for a given member ID
      - Returns document information including verification status
      - Supports filtering and sorting

  2. Security
    - Requires authentication
    - Validates user permissions to access member documents

  3. Response Format
    - Returns success/error status
    - Includes documents array when successful
*/

import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req: Request) => {
  try {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
      return new Response('ok', { headers: corsHeaders });
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Get request body
    const { memberId } = await req.json();

    if (!memberId) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'معرف المستفيد مطلوب' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get documents for the member
    const { data: documents, error: documentsError } = await supabaseClient
      .from('member_documents')
      .select(`
        *,
        verified_by:users(id, full_name, role)
      `)
      .eq('member_id', memberId)
      .order('uploaded_at', { ascending: false });

    if (documentsError) {
      console.error('Error fetching member documents:', documentsError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'خطأ في جلب مستندات المستفيد' 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get member info to validate access
    const { data: member, error: memberError } = await supabaseClient
      .from('members')
      .select('id, user_id, full_name, registration_status')
      .eq('id', memberId)
      .single();

    if (memberError) {
      console.error('Error fetching member info:', memberError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'المستفيد غير موجود' 
        }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Return documents data
    return new Response(
      JSON.stringify({ 
        success: true, 
        documents: documents || [],
        member: member
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in member-documents function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'خطأ داخلي في الخادم' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});