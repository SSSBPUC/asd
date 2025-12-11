-- Create table for staff/student login credentials (managed by admin)
CREATE TABLE public.portal_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  user_type TEXT NOT NULL CHECK (user_type IN ('staff', 'student')),
  full_name TEXT NOT NULL,
  email TEXT,
  department TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.portal_users ENABLE ROW LEVEL SECURITY;

-- Only admins can manage portal users
CREATE POLICY "Admins can manage portal users"
ON public.portal_users
FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Public can read active portal users for login verification (but not password)
-- We'll handle password verification in edge function

-- Create trigger for updated_at
CREATE TRIGGER update_portal_users_updated_at
BEFORE UPDATE ON public.portal_users
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();