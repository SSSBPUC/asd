-- Allow admins to delete submissions
CREATE POLICY "Admins can delete submissions"
ON public.admission_submissions
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));