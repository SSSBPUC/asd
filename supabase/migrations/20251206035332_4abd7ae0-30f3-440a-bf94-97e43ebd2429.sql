-- Create table to track admission form rate limits
CREATE TABLE public.admission_rate_limits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  identifier TEXT NOT NULL,
  submission_count INTEGER NOT NULL DEFAULT 1,
  window_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for fast lookups
CREATE INDEX idx_rate_limits_identifier_window ON public.admission_rate_limits(identifier, window_start);

-- Enable RLS
ALTER TABLE public.admission_rate_limits ENABLE ROW LEVEL SECURITY;

-- Allow edge function (service role) to manage rate limits
CREATE POLICY "Service role can manage rate limits"
ON public.admission_rate_limits
FOR ALL
USING (true)
WITH CHECK (true);

-- Function to clean up old rate limit entries (older than 1 hour)
CREATE OR REPLACE FUNCTION public.cleanup_old_rate_limits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.admission_rate_limits 
  WHERE window_start < now() - INTERVAL '1 hour';
END;
$$;