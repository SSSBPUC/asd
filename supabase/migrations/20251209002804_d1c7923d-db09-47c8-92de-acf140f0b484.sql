-- Create staff table for managing admin, lecturers, and non-teaching staff
CREATE TABLE public.staff (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  designation TEXT NOT NULL,
  department TEXT,
  staff_type TEXT NOT NULL CHECK (staff_type IN ('admin', 'lecturer', 'non_teaching')),
  email TEXT,
  phone TEXT,
  qualification TEXT,
  image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;

-- Public can view active staff
CREATE POLICY "Anyone can view active staff" 
ON public.staff 
FOR SELECT 
USING (is_active = true);

-- Admins can do everything
CREATE POLICY "Admins can manage staff" 
ON public.staff 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_staff_updated_at
BEFORE UPDATE ON public.staff
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();