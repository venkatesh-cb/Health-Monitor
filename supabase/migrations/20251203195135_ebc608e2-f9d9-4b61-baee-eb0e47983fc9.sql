-- Create extra_info table for additional patient details
CREATE TABLE public.extra_info (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  report_id uuid NULL,
  patient_id uuid NULL,
  phone text NULL,
  email text NULL,
  address text NULL,
  emergency_contact text NULL,
  blood_group text NULL,
  allergies text NULL,
  notes text NULL,
  created_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT extra_info_pkey PRIMARY KEY (id),
  CONSTRAINT extra_info_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
  CONSTRAINT extra_info_report_id_fkey FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE public.extra_info ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (no auth required for this app)
CREATE POLICY "Allow all operations on extra_info" ON public.extra_info FOR ALL USING (true) WITH CHECK (true);