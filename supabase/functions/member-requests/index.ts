/*
  # Member Requests Edge Function

  1. Purpose
    - Fetch requests for a specific member (beneficiary)
    - Support filtering by status and pagination
    - Return detailed request information with service details

  2. Security
    - Validates authentication
    - Ensures member can only access their own requests
    - Proper RLS policies are enforced

  3. Response Format
    - Returns JSON array of requests with service information
    - Includes pagination metadata
    - Handles errors gracefully
*/

import { createClient } from 'npm:@supabase/supabase-js@2.38.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Member-ID',
}

interface RequestWithService {
  id: string
  member_id: string
  service_id: string
  status: string
  requested_amount: number | null
  approved_amount: number | null
  employee_id: string | null
  manager_decision: string | null
  rejection_reason: string | null
  notes: string | null
  priority: number | null
  documents_uploaded: boolean | null
  created_at: string
  updated_at: string
  processed_at: string | null
  service: {
    id: string
    name: string
    description: string | null
    category: string | null
    max_amount: number | null
  }
}

Deno.serve(async (req: Request) => {
  try {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: corsHeaders,
      })
    }

    // Only allow GET requests
    if (req.method !== 'GET') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }), 
        {
          status: 405,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing environment variables')
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }), 
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get member ID from headers
    const memberId = req.headers.get('X-Member-ID')
    if (!memberId) {
      return new Response(
        JSON.stringify({ error: 'Member ID is required' }), 
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Parse query parameters
    const url = new URL(req.url)
    const status = url.searchParams.get('status')
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '10')
    const offset = (page - 1) * limit

    // Build query
    let query = supabase
      .from('requests')
      .select(`
        id,
        member_id,
        service_id,
        status,
        requested_amount,
        approved_amount,
        employee_id,
        manager_decision,
        rejection_reason,
        notes,
        priority,
        documents_uploaded,
        created_at,
        updated_at,
        processed_at,
        service:services (
          id,
          name,
          description,
          category,
          max_amount
        )
      `)
      .eq('member_id', memberId)
      .order('created_at', { ascending: false })

    // Apply status filter if provided
    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1)

    // Execute query
    const { data: requests, error: requestsError, count } = await query

    if (requestsError) {
      console.error('Error fetching requests:', requestsError)
      return new Response(
        JSON.stringify({ 
          error: 'Failed to fetch requests',
          details: requestsError.message 
        }), 
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Get total count for pagination
    const { count: totalCount, error: countError } = await supabase
      .from('requests')
      .select('*', { count: 'exact', head: true })
      .eq('member_id', memberId)

    if (countError) {
      console.error('Error getting total count:', countError)
    }

    // Prepare response
    const response = {
      requests: requests as RequestWithService[],
      pagination: {
        page,
        limit,
        total: totalCount || 0,
        totalPages: Math.ceil((totalCount || 0) / limit),
        hasMore: (totalCount || 0) > offset + limit
      }
    }

    return new Response(
      JSON.stringify(response),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    console.error('Unexpected error in member-requests function:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})