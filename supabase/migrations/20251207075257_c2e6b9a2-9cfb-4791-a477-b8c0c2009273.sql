-- Fix profiles table policies to require authenticated role
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

CREATE POLICY "Users can insert own profile" 
ON public.profiles 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" 
ON public.profiles 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can view own profile" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

-- Fix admission_submissions policies to require authenticated role for admin access
DROP POLICY IF EXISTS "Admins can update submissions" ON public.admission_submissions;
DROP POLICY IF EXISTS "Admins can view all submissions" ON public.admission_submissions;

CREATE POLICY "Admins can update submissions" 
ON public.admission_submissions 
FOR UPDATE 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can view all submissions" 
ON public.admission_submissions 
FOR SELECT 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Fix admission_rate_limits policy - restrict to service role only
DROP POLICY IF EXISTS "Service role can manage rate limits" ON public.admission_rate_limits;

-- Create a more restrictive policy that only works with service role
-- The service role bypasses RLS, so we can make this policy very restrictive
-- No public access at all - only service role (which bypasses RLS) can access
CREATE POLICY "No public access to rate limits" 
ON public.admission_rate_limits 
FOR ALL 
TO authenticated
USING (false)
WITH CHECK (false);