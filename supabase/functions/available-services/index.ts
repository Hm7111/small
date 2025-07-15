/*
  # Available Services Edge Function

  1. New Function
    - `available-services`
      - Fetches all active services available for beneficiaries
      - Returns service information including requirements and limits
      - Supports filtering by category

  2. Security
    - Requires authentication
    - Returns only active services

  3. Response Format
    - Returns success/error status
    - Includes services array when successful
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

    // Get request body (optional filters)
    const body = await req.json().catch(() => ({}));
    const { category, memberId } = body;

    // Build query for services
    let query = supabaseClient
      .from('services')
      .select(`
        *,
        created_by:users(id, full_name, role)
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    // Add category filter if provided
    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    const { data: services, error: servicesError } = await query;

    if (servicesError) {
      console.error('Error fetching services:', servicesError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'خطأ في جلب الخدمات المتاحة' 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // If memberId provided, get member info to customize services
    let memberInfo = null;
    if (memberId) {
      const { data: member } = await supabaseClient
        .from('members')
        .select('id, disability_type, employment_status, education_level, age')
        .eq('id', memberId)
        .single();
      
      memberInfo = member;
    }

    // Filter or customize services based on member profile if needed
    let filteredServices = services || [];

    // Add eligibility information based on member profile
    if (memberInfo) {
      filteredServices = filteredServices.map(service => ({
        ...service,
        // Add eligibility check based on service requirements and member profile
        eligible: checkServiceEligibility(service, memberInfo)
      }));
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        services: filteredServices,
        memberInfo
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in available-services function:', error);
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

// Helper function to check service eligibility
function checkServiceEligibility(service: any, member: any): boolean {
  // Basic eligibility - can be expanded based on specific requirements
  
  // Age-based services
  if (service.name.includes('أيتام') && member.age && member.age >= 18) {
    return false; // Orphan services typically for minors
  }
  
  // Disability-specific services
  if (service.name.includes('الأجهزة التعويضية') && !member.disability_type) {
    return false; // Assistive devices require disability
  }
  
  // Employment-based services
  if (service.name.includes('التوظيف') && member.employment_status === 'employed') {
    return false; // Employment services for unemployed
  }
  
  // Education-based services
  if (service.name.includes('تعليمي') && 
      member.education_level && 
      ['bachelor', 'master', 'phd'].includes(member.education_level)) {
    return false; // Educational support typically for lower education levels
  }
  
  // Default to eligible
  return true;
}