import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Rate limit configuration
const MAX_SUBMISSIONS_PER_HOUR = 3;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get client identifier (IP address from headers or use email as fallback)
    const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
                     req.headers.get('x-real-ip') || 
                     'unknown';
    
    const body = await req.json();
    const { formData } = body;

    if (!formData) {
      console.error('No form data provided');
      return new Response(
        JSON.stringify({ error: 'No form data provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Use combination of IP and email for rate limiting identifier
    const identifier = `${clientIP}_${formData.email}`;
    const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MS);

    // Log masked identifier to avoid PII exposure in logs
    const maskedIdentifier = identifier.substring(0, 8) + '***';
    console.log(`Rate limit check for: ${maskedIdentifier}`);

    // Clean up old rate limit entries
    await supabase.rpc('cleanup_old_rate_limits');

    // Check current rate limit status
    const { data: existingEntry, error: fetchError } = await supabase
      .from('admission_rate_limits')
      .select('*')
      .eq('identifier', identifier)
      .gte('window_start', windowStart.toISOString())
      .order('window_start', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (fetchError) {
      console.error('Error checking rate limit:', fetchError);
      // Don't block submission on rate limit check failure
    }

    if (existingEntry) {
      console.log(`Existing entry found: ${existingEntry.submission_count} submissions`);
      
      if (existingEntry.submission_count >= MAX_SUBMISSIONS_PER_HOUR) {
        const resetTime = new Date(new Date(existingEntry.window_start).getTime() + RATE_LIMIT_WINDOW_MS);
        const minutesRemaining = Math.ceil((resetTime.getTime() - Date.now()) / (1000 * 60));
        
        console.log(`Rate limit exceeded. Reset in ${minutesRemaining} minutes`);
        
        return new Response(
          JSON.stringify({ 
            error: 'Too many submissions', 
            message: `You have exceeded the submission limit. Please try again in ${minutesRemaining} minutes.`,
            rateLimited: true
          }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Increment submission count
      const { error: updateError } = await supabase
        .from('admission_rate_limits')
        .update({ submission_count: existingEntry.submission_count + 1 })
        .eq('id', existingEntry.id);

      if (updateError) {
        console.error('Error updating rate limit:', updateError);
      }
    } else {
      // Create new rate limit entry
      const { error: insertRateError } = await supabase
        .from('admission_rate_limits')
        .insert({ identifier, submission_count: 1 });

      if (insertRateError) {
        console.error('Error inserting rate limit:', insertRateError);
      }
    }

    // Submit the admission form
    const { data, error } = await supabase
      .from('admission_submissions')
      .insert({
        student_name: formData.studentName,
        date_of_birth: formData.dateOfBirth,
        gender: formData.gender,
        contact_number: formData.contactNumber,
        email: formData.email,
        address: formData.address,
        parent_name: formData.parentName,
        parent_contact: formData.parentContact,
        stream: formData.stream,
        previous_school: formData.previousSchool,
        sslc_result: formData.sslcResult,
        preferred_language: formData.preferredLanguage,
      })
      .select()
      .single();

    if (error) {
      console.error('Error inserting admission:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to submit application', details: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Admission submitted successfully:', data.id);

    return new Response(
      JSON.stringify({ success: true, id: data.id }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
