
-- helper timestamp fn
CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS trigger
LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TABLE public.doctors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE,
  name text NOT NULL,
  email text NOT NULL UNIQUE,
  qualification text NOT NULL DEFAULT '',
  specialization text NOT NULL DEFAULT '',
  experience_years int NOT NULL DEFAULT 0,
  registration_number text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  profile_image text,
  bio text NOT NULL DEFAULT '',
  availability text NOT NULL DEFAULT 'Mon - Sat, 9:00 AM - 6:00 PM',
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.doctors TO anon;
GRANT SELECT, UPDATE ON public.doctors TO authenticated;
GRANT ALL ON public.doctors TO service_role;
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Doctors are public" ON public.doctors FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Doctor updates own profile" ON public.doctors FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE TRIGGER doctors_updated BEFORE UPDATE ON public.doctors FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.current_doctor_id() RETURNS uuid
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT id FROM public.doctors WHERE user_id = auth.uid() LIMIT 1;
$$;
GRANT EXECUTE ON FUNCTION public.current_doctor_id() TO authenticated;

CREATE TABLE public.patients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  phone text NOT NULL,
  email text,
  age int,
  gender text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.patients TO authenticated;
GRANT ALL ON public.patients TO service_role;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER patients_updated BEFORE UPDATE ON public.patients FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE SEQUENCE public.appointment_code_seq START 124;
CREATE SEQUENCE public.prescription_code_seq START 452;
CREATE SEQUENCE public.patient_code_seq START 1001;

CREATE TABLE public.appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  doctor_id uuid NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
  service text NOT NULL DEFAULT 'General Dentistry',
  appointment_date date NOT NULL DEFAULT current_date,
  appointment_time text NOT NULL,
  appointment_type text NOT NULL DEFAULT 'New Consultation',
  reason text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'Waiting',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE ON public.appointments TO authenticated;
GRANT ALL ON public.appointments TO service_role;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Doctor reads own appointments" ON public.appointments FOR SELECT TO authenticated
  USING (doctor_id = public.current_doctor_id());
CREATE POLICY "Doctor updates own appointments" ON public.appointments FOR UPDATE TO authenticated
  USING (doctor_id = public.current_doctor_id()) WITH CHECK (doctor_id = public.current_doctor_id());
CREATE TRIGGER appointments_updated BEFORE UPDATE ON public.appointments FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE POLICY "Doctor reads own patients" ON public.patients FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.appointments a WHERE a.patient_id = patients.id AND a.doctor_id = public.current_doctor_id()));

CREATE TABLE public.problems (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.problems TO anon, authenticated;
GRANT ALL ON public.problems TO service_role;
ALTER TABLE public.problems ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Problems are public reference data" ON public.problems FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.medicines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  generic_name text NOT NULL DEFAULT '',
  strength text NOT NULL DEFAULT '',
  form text NOT NULL DEFAULT 'Tablet',
  default_dosage text NOT NULL DEFAULT '1 tablet',
  default_frequency text NOT NULL DEFAULT 'Twice daily',
  default_duration text NOT NULL DEFAULT '3 days',
  default_instructions text NOT NULL DEFAULT 'Take after food.',
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.medicines TO anon, authenticated;
GRANT ALL ON public.medicines TO service_role;
ALTER TABLE public.medicines ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Medicines are public reference data" ON public.medicines FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.problem_medicines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  problem_id uuid NOT NULL REFERENCES public.problems(id) ON DELETE CASCADE,
  medicine_id uuid NOT NULL REFERENCES public.medicines(id) ON DELETE CASCADE,
  note text NOT NULL DEFAULT '',
  UNIQUE (problem_id, medicine_id)
);
GRANT SELECT ON public.problem_medicines TO anon, authenticated;
GRANT ALL ON public.problem_medicines TO service_role;
ALTER TABLE public.problem_medicines ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Mappings are public reference data" ON public.problem_medicines FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.consultations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id uuid NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
  doctor_id uuid NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
  patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  problem text NOT NULL DEFAULT '',
  symptoms text NOT NULL DEFAULT '',
  clinical_observation text NOT NULL DEFAULT '',
  pain_level int,
  affected_area text NOT NULL DEFAULT '',
  tooth_number text NOT NULL DEFAULT '',
  doctor_notes text NOT NULL DEFAULT '',
  diagnosis text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'draft',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.consultations TO authenticated;
GRANT ALL ON public.consultations TO service_role;
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Doctor manages own consultations" ON public.consultations FOR ALL TO authenticated
  USING (doctor_id = public.current_doctor_id()) WITH CHECK (doctor_id = public.current_doctor_id());
CREATE TRIGGER consultations_updated BEFORE UPDATE ON public.consultations FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.prescriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE DEFAULT ('RX-' || to_char(now(),'YYYY') || '-' || lpad(nextval('public.prescription_code_seq')::text, 5, '0')),
  consultation_id uuid NOT NULL REFERENCES public.consultations(id) ON DELETE CASCADE,
  appointment_id uuid NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
  patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  doctor_id uuid NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
  problem text NOT NULL DEFAULT '',
  diagnosis text NOT NULL DEFAULT '',
  doctor_notes text NOT NULL DEFAULT '',
  follow_up_date date,
  status text NOT NULL DEFAULT 'Issued',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.prescriptions TO authenticated;
GRANT ALL ON public.prescriptions TO service_role;
GRANT USAGE ON SEQUENCE public.prescription_code_seq TO authenticated;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Doctor manages own prescriptions" ON public.prescriptions FOR ALL TO authenticated
  USING (doctor_id = public.current_doctor_id()) WITH CHECK (doctor_id = public.current_doctor_id());
CREATE TRIGGER prescriptions_updated BEFORE UPDATE ON public.prescriptions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.prescription_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prescription_id uuid NOT NULL REFERENCES public.prescriptions(id) ON DELETE CASCADE,
  medicine_id uuid REFERENCES public.medicines(id) ON DELETE SET NULL,
  medicine_name text NOT NULL,
  strength text NOT NULL DEFAULT '',
  dosage text NOT NULL DEFAULT '',
  frequency text NOT NULL DEFAULT '',
  duration text NOT NULL DEFAULT '',
  instructions text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.prescription_items TO authenticated;
GRANT ALL ON public.prescription_items TO service_role;
ALTER TABLE public.prescription_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Doctor manages own prescription items" ON public.prescription_items FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.prescriptions p WHERE p.id = prescription_id AND p.doctor_id = public.current_doctor_id()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.prescriptions p WHERE p.id = prescription_id AND p.doctor_id = public.current_doctor_id()));

-- Public booking entry point (visitors cannot read appointment data)
CREATE OR REPLACE FUNCTION public.book_appointment(
  p_name text, p_phone text, p_email text, p_age int, p_gender text,
  p_doctor_id uuid, p_service text, p_date date, p_time text, p_type text, p_reason text
) RETURNS TABLE (appointment_code text, patient_code text)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_patient public.patients%ROWTYPE; v_code text;
BEGIN
  IF coalesce(trim(p_name),'') = '' OR coalesce(trim(p_phone),'') = '' THEN
    RAISE EXCEPTION 'Name and phone are required';
  END IF;
  IF length(p_name) > 120 OR length(p_phone) > 20 OR coalesce(length(p_reason),0) > 1000 THEN
    RAISE EXCEPTION 'Input too long';
  END IF;

  SELECT * INTO v_patient FROM public.patients WHERE phone = trim(p_phone) LIMIT 1;
  IF v_patient.id IS NULL THEN
    INSERT INTO public.patients (code, name, phone, email, age, gender)
    VALUES ('PT-' || lpad(nextval('public.patient_code_seq')::text, 5, '0'),
            trim(p_name), trim(p_phone), nullif(trim(coalesce(p_email,'')),''), p_age, p_gender)
    RETURNING * INTO v_patient;
  ELSE
    UPDATE public.patients SET name = trim(p_name), email = coalesce(nullif(trim(coalesce(p_email,'')),''), email),
      age = coalesce(p_age, age), gender = coalesce(p_gender, gender)
    WHERE id = v_patient.id;
  END IF;

  v_code := 'SC-' || to_char(now(),'YYYY') || '-' || lpad(nextval('public.appointment_code_seq')::text, 5, '0');
  INSERT INTO public.appointments (code, patient_id, doctor_id, service, appointment_date, appointment_time, appointment_type, reason)
  VALUES (v_code, v_patient.id, p_doctor_id, p_service, p_date, p_time, p_type, coalesce(p_reason,''));

  RETURN QUERY SELECT v_code, v_patient.code;
END; $$;
GRANT EXECUTE ON FUNCTION public.book_appointment(text,text,text,int,text,uuid,text,date,text,text,text) TO anon, authenticated;

-- Doctor claims their seeded profile after signing in with their hospital email
CREATE OR REPLACE FUNCTION public.link_doctor_account() RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_email text; v_id uuid;
BEGIN
  SELECT lower(email) INTO v_email FROM auth.users WHERE id = auth.uid();
  IF v_email IS NULL THEN RETURN NULL; END IF;
  SELECT id INTO v_id FROM public.doctors WHERE user_id = auth.uid();
  IF v_id IS NOT NULL THEN RETURN v_id; END IF;
  UPDATE public.doctors SET user_id = auth.uid()
   WHERE lower(email) = v_email AND user_id IS NULL RETURNING id INTO v_id;
  RETURN v_id;
END; $$;
GRANT EXECUTE ON FUNCTION public.link_doctor_account() TO authenticated;

-- ===== Demo seed data (Demo / Clinical Review Required) =====
INSERT INTO public.doctors (name, email, qualification, specialization, experience_years, registration_number, phone, bio, availability) VALUES
('Dr. Anaya Sharma','anaya@smilecare.com','BDS, MDS','Senior Dental Surgeon',8,'DCI-2018-4471','+91 98765 43211','Specialist in restorative and cosmetic dentistry with a gentle, patient-first approach.','Mon - Sat, 9:00 AM - 6:00 PM'),
('Dr. Rohan Iyer','rohan@smilecare.com','BDS, MDS','Implantologist',12,'DCI-2014-2210','+91 98765 43212','Focused on advanced dental implants and full-mouth rehabilitation.','Mon - Fri, 10:00 AM - 7:00 PM'),
('Dr. Meera Kapoor','meera@smilecare.com','BDS, MDS','Orthodontist',9,'DCI-2017-8890','+91 98765 43213','Braces, clear aligners and smile alignment for teens and adults.','Tue - Sat, 9:30 AM - 5:30 PM'),
('Dr. Arjun Nair','arjun@smilecare.com','BDS, MDS','Endodontist',10,'DCI-2016-3345','+91 98765 43214','Painless root canal therapy using rotary endodontics.','Mon - Sat, 9:00 AM - 5:00 PM'),
('Dr. Sara Fernandes','sara@smilecare.com','BDS','Pediatric Dentist',6,'DCI-2020-1123','+91 98765 43215','Making dental visits calm and friendly for children.','Mon - Fri, 9:00 AM - 4:00 PM'),
('Dr. Vikram Desai','vikram@smilecare.com','BDS, MDS','Oral & Maxillofacial Surgeon',14,'DCI-2012-5567','+91 98765 43216','Wisdom tooth removal and complex oral surgical procedures.','Mon - Sat, 11:00 AM - 7:00 PM');

INSERT INTO public.problems (name, description) VALUES
('Dental Caries','Tooth decay affecting enamel and dentine.'),
('Tooth Sensitivity','Sharp discomfort triggered by hot, cold or sweet stimuli.'),
('Gingivitis','Reversible inflammation of the gum margin.'),
('Periodontitis','Inflammation involving the supporting structures of the teeth.'),
('Toothache','Generalised dental pain pending diagnosis.'),
('Dental Infection','Localised odontogenic infection or abscess.'),
('Mouth Ulcer','Painful oral mucosal ulceration.'),
('Gum Pain','Localised gingival pain or swelling.'),
('Post Extraction Pain','Pain following a dental extraction.'),
('Wisdom Tooth Pain','Pericoronitis or impaction-related pain.');

INSERT INTO public.medicines (name, generic_name, strength, form, default_dosage, default_frequency, default_duration, default_instructions) VALUES
('Ibuprofen','Ibuprofen','400 mg','Tablet','1 tablet','Twice daily','3 days','Take after food.'),
('Paracetamol','Acetaminophen','500 mg','Tablet','1 tablet','Three times daily','3 days','Take after food.'),
('Amoxicillin','Amoxicillin','500 mg','Capsule','1 capsule','Three times daily','5 days','Complete the full course.'),
('Amoxicillin + Clavulanate','Co-amoxiclav','625 mg','Tablet','1 tablet','Twice daily','5 days','Complete the full course.'),
('Metronidazole','Metronidazole','400 mg','Tablet','1 tablet','Three times daily','5 days','Avoid alcohol during the course.'),
('Chlorhexidine Mouthwash','Chlorhexidine gluconate','0.2%','Mouthwash','10 ml rinse','Twice daily','7 days','Rinse for 30 seconds; do not swallow.'),
('Potassium Nitrate Toothpaste','Potassium nitrate','5%','Toothpaste','Pea-sized amount','Twice daily','14 days','Brush gently; avoid rinsing immediately.'),
('Benzocaine Oral Gel','Benzocaine','20%','Gel','Thin layer','Up to three times daily','5 days','Apply locally to the affected area.'),
('Fluoride Varnish','Sodium fluoride','5%','Varnish','Single application','As advised','Single visit','Applied in clinic by the dental team.'),
('Warm Saline Rinse','Sodium chloride','0.9%','Rinse','1 glass rinse','Three times daily','5 days','Use lukewarm water after meals.');

INSERT INTO public.problem_medicines (problem_id, medicine_id)
SELECT p.id, m.id FROM public.problems p JOIN public.medicines m ON true
WHERE (p.name = 'Dental Caries' AND m.name IN ('Ibuprofen','Paracetamol','Fluoride Varnish'))
   OR (p.name = 'Tooth Sensitivity' AND m.name IN ('Potassium Nitrate Toothpaste','Fluoride Varnish'))
   OR (p.name = 'Gingivitis' AND m.name IN ('Chlorhexidine Mouthwash','Warm Saline Rinse','Ibuprofen'))
   OR (p.name = 'Periodontitis' AND m.name IN ('Chlorhexidine Mouthwash','Metronidazole','Ibuprofen'))
   OR (p.name = 'Toothache' AND m.name IN ('Ibuprofen','Paracetamol','Benzocaine Oral Gel'))
   OR (p.name = 'Dental Infection' AND m.name IN ('Amoxicillin','Amoxicillin + Clavulanate','Metronidazole','Ibuprofen'))
   OR (p.name = 'Mouth Ulcer' AND m.name IN ('Benzocaine Oral Gel','Chlorhexidine Mouthwash','Warm Saline Rinse'))
   OR (p.name = 'Gum Pain' AND m.name IN ('Ibuprofen','Chlorhexidine Mouthwash','Warm Saline Rinse'))
   OR (p.name = 'Post Extraction Pain' AND m.name IN ('Paracetamol','Ibuprofen','Warm Saline Rinse'))
   OR (p.name = 'Wisdom Tooth Pain' AND m.name IN ('Ibuprofen','Amoxicillin','Chlorhexidine Mouthwash'));

INSERT INTO public.patients (code, name, phone, email, age, gender) VALUES
('PT-00001','Rahul Mehta','+91 90000 10001','rahul.mehta@example.com',32,'Male'),
('PT-00002','Priya Sen','+91 90000 10002','priya.sen@example.com',27,'Female'),
('PT-00003','Imran Qureshi','+91 90000 10003','imran.q@example.com',41,'Male'),
('PT-00004','Neha Gupta','+91 90000 10004','neha.g@example.com',35,'Female'),
('PT-00005','Kabir Rao','+91 90000 10005','kabir.rao@example.com',19,'Male');

INSERT INTO public.appointments (code, patient_id, doctor_id, service, appointment_date, appointment_time, appointment_type, reason, status)
SELECT v.code, pt.id, d.id, v.service, current_date, v.t, v.atype, v.reason, v.status
FROM (VALUES
  ('SC-2026-00101','PT-00001','General Dentistry','09:30 AM','New Consultation','Pain in the lower right molar while chewing.','Waiting'),
  ('SC-2026-00102','PT-00002','Cosmetic Dentistry','10:15 AM','Follow-up','Review after whitening treatment.','Completed'),
  ('SC-2026-00103','PT-00003','Root Canal Treatment','11:00 AM','Emergency','Severe throbbing pain and swelling.','Waiting'),
  ('SC-2026-00104','PT-00004','Orthodontics','12:00 PM','Follow-up','Aligner tray change and review.','Completed'),
  ('SC-2026-00105','PT-00005','Oral Surgery','04:30 PM','New Consultation','Wisdom tooth discomfort on the left side.','Waiting')
) AS v(code, pcode, service, t, atype, reason, status)
JOIN public.patients pt ON pt.code = v.pcode
JOIN public.doctors d ON d.email = 'anaya@smilecare.com';
