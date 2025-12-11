-- Add CHECK constraints for server-side validation on admission_submissions

-- Student name: 2-100 characters
ALTER TABLE public.admission_submissions
ADD CONSTRAINT chk_student_name_length 
CHECK (char_length(trim(student_name)) >= 2 AND char_length(student_name) <= 100);

-- Email: basic format validation and length
ALTER TABLE public.admission_submissions
ADD CONSTRAINT chk_email_format 
CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' AND char_length(email) <= 255);

-- Contact number: 10-15 digits/characters
ALTER TABLE public.admission_submissions
ADD CONSTRAINT chk_contact_number_format 
CHECK (contact_number ~ '^[0-9+\-\s]{10,15}$');

-- Parent name: 2-100 characters
ALTER TABLE public.admission_submissions
ADD CONSTRAINT chk_parent_name_length 
CHECK (char_length(trim(parent_name)) >= 2 AND char_length(parent_name) <= 100);

-- Parent contact: 10-15 digits/characters
ALTER TABLE public.admission_submissions
ADD CONSTRAINT chk_parent_contact_format 
CHECK (parent_contact ~ '^[0-9+\-\s]{10,15}$');

-- Address: 10-500 characters
ALTER TABLE public.admission_submissions
ADD CONSTRAINT chk_address_length 
CHECK (char_length(trim(address)) >= 10 AND char_length(address) <= 500);

-- Previous school: 2-200 characters
ALTER TABLE public.admission_submissions
ADD CONSTRAINT chk_previous_school_length 
CHECK (char_length(trim(previous_school)) >= 2 AND char_length(previous_school) <= 200);

-- SSLC result: 1-50 characters
ALTER TABLE public.admission_submissions
ADD CONSTRAINT chk_sslc_result_length 
CHECK (char_length(trim(sslc_result)) >= 1 AND char_length(sslc_result) <= 50);

-- Gender: valid values only
ALTER TABLE public.admission_submissions
ADD CONSTRAINT chk_gender_valid 
CHECK (gender IN ('male', 'female', 'other'));

-- Stream: not empty
ALTER TABLE public.admission_submissions
ADD CONSTRAINT chk_stream_not_empty 
CHECK (char_length(trim(stream)) >= 1);

-- Preferred language: valid values only
ALTER TABLE public.admission_submissions
ADD CONSTRAINT chk_preferred_language_valid 
CHECK (preferred_language IN ('kannada', 'hindi', 'sanskrit'));

-- Status: valid values only
ALTER TABLE public.admission_submissions
ADD CONSTRAINT chk_status_valid 
CHECK (status IN ('pending', 'approved', 'rejected', 'under_review'));