-- =============================================================================
-- SmileFlow Consult — Availability + Appointment Integrity + Doctor Signup
-- Applies on top of the existing schema (doctors, patients, appointments, ...).
-- Safe, additive migration. Does not drop or alter existing data.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 0. EXTENSION
-- The overlap EXCLUDE constraint below uses GiST with uuid equality. That
-- requires the btree_gist extension (provides B-tree-equivalent GiST operator
-- classes for uuid/int/etc.). Idempotent and safe to run repeatedly.
-- -----------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- -----------------------------------------------------------------------------
-- 1. DOCTOR AVAILABILITY
-- Recurring weekly availability records per doctor. A slot is valid when the
-- appointment date's day-of-week matches and the time falls within [start,end).
-- Requires `btree_gist` (created above) for the GiST EXCLUDE constraint.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.doctor_availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id uuid NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
  day_of_week int NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),          -- 0=Sun..6=Sat
  start_time text NOT NULL,                                               -- 24h "HH:MM"
  end_time text NOT NULL,                                                 -- 24h "HH:MM"
  start_minute int GENERATED ALWAYS AS (
    split_part(start_time, ':', 1)::int * 60 + split_part(start_time, ':', 2)::int
  ) STORED,
  end_minute int GENERATED ALWAYS AS (
    split_part(end_time, ':', 1)::int * 60 + split_part(end_time, ':', 2)::int
  ) STORED,
  status text NOT NULL DEFAULT 'active',                                  -- active | inactive
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT availability_valid_times CHECK (start_time < end_time)
);

-- Reconciliation: add generated columns if the table was created in a previous
-- (possibly partial) run without them. Safe to run repeatedly (IF NOT EXISTS).
ALTER TABLE public.doctor_availability
  ADD COLUMN IF NOT EXISTS start_minute int GENERATED ALWAYS AS (
    split_part(start_time, ':', 1)::int * 60 + split_part(start_time, ':', 2)::int
  ) STORED,
  ADD COLUMN IF NOT EXISTS end_minute int GENERATED ALWAYS AS (
    split_part(end_time, ':', 1)::int * 60 + split_part(end_time, ':', 2)::int
  ) STORED;

-- Prevent duplicate/overlapping recurring slots for the same doctor.
-- Uses an exclusion constraint over the day window so overlapping (or fully
-- contained / containing) ranges for the same doctor+day are rejected.
-- Uses int4range over precomputed minute offsets — fully IMMUTABLE, no
-- timestamp/timezone/cast expressions in the GiST index. All operators
-- (int4range constructor, range &&, uuid =, int4 =) are immutable.
ALTER TABLE public.doctor_availability
  DROP CONSTRAINT IF EXISTS doctor_avail_no_overlap;
ALTER TABLE public.doctor_availability
  ADD CONSTRAINT doctor_avail_no_overlap
  EXCLUDE USING gist (
    doctor_id WITH =,
    day_of_week WITH =,
    int4range(start_minute, end_minute, '[)') WITH &&
  );

DROP TRIGGER IF EXISTS doctor_availability_updated ON public.doctor_availability;
CREATE TRIGGER doctor_availability_updated
  BEFORE UPDATE ON public.doctor_availability
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- A doctor can only manage their own availability.
ALTER TABLE public.doctor_availability ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Doctor manages own availability" ON public.doctor_availability;
CREATE POLICY "Doctor manages own availability"
  ON public.doctor_availability
  FOR ALL TO authenticated
  USING (doctor_id = public.current_doctor_id())
  WITH CHECK (doctor_id = public.current_doctor_id());

-- Anyone (including anon booking) may read availability.
DROP POLICY IF EXISTS "Availability is readable" ON public.doctor_availability;
CREATE POLICY "Availability is readable"
  ON public.doctor_availability
  FOR SELECT TO anon, authenticated USING (true);

GRANT SELECT ON public.doctor_availability TO anon, authenticated;
GRANT ALL ON public.doctor_availability TO service_role;

CREATE INDEX IF NOT EXISTS idx_doctor_availability_doctor_day
  ON public.doctor_availability (doctor_id, day_of_week);

-- -----------------------------------------------------------------------------
-- 2. HELPER: is doctor available for doctor_id/date/time?
--    Returns true if an active availability window covers the requested time.
--    Falls back to true when the doctor has NO availability records (i.e. the
--    doctor is "always available" until they define a schedule).
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_doctor_available(
  p_doctor_id uuid, p_date date, p_time text
) RETURNS boolean
LANGUAGE sql STABLE SET search_path = public AS $$
  SELECT
    NOT EXISTS (SELECT 1 FROM public.doctor_availability WHERE doctor_id = p_doctor_id AND status = 'active')
    OR EXISTS (
      SELECT 1
      FROM public.doctor_availability da
      WHERE da.doctor_id = p_doctor_id
        AND da.status = 'active'
        AND da.day_of_week = extract(isodow from p_date::timestamp)::int % 7
        AND p_time::time >= da.start_time::time
        AND p_time::time  < da.end_time::time
    );
$$;
GRANT EXECUTE ON FUNCTION public.is_doctor_available(uuid, date, text) TO anon, authenticated;

-- -----------------------------------------------------------------------------
-- 3. REPLACE book_appointment with full integrity checks
--    - No booking in the past
--    - Must fall within a defined availability window (if any exists)
--    - No double booking for the same doctor/date/time
-- Uses a transaction + row lock on an "anchor" row for the doctor to serialize
-- concurrent bookings of the same slot (race-condition safe).
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.book_appointment(
  p_name text, p_phone text, p_email text, p_age int, p_gender text,
  p_doctor_id uuid, p_service text, p_date date, p_time text, p_type text, p_reason text
) RETURNS TABLE (appointment_code text, patient_code text)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_patient public.patients%ROWTYPE;
  v_code text;
BEGIN
  IF coalesce(trim(p_name),'') = '' OR coalesce(trim(p_phone),'') = '' THEN
    RAISE EXCEPTION 'Name and phone are required';
  END IF;
  IF length(p_name) > 120 OR length(p_phone) > 20 OR coalesce(length(p_reason),0) > 1000 OR length(p_time) > 20 THEN
    RAISE EXCEPTION 'Input too long';
  END IF;

  -- Integrity: date must not be in the past (and for today, the time must be in the future)
  IF p_date < current_date THEN
    RAISE EXCEPTION 'Appointment date cannot be in the past';
  END IF;
  IF p_date = current_date AND p_time::time <= localtime THEN
    RAISE EXCEPTION 'Appointment time has already passed for today';
  END IF;

  -- Integrity: doctor must exist and be active
  IF NOT EXISTS (SELECT 1 FROM public.doctors WHERE id = p_doctor_id AND status = 'active') THEN
    RAISE EXCEPTION 'Selected doctor is not available';
  END IF;

  -- Serialize concurrent bookings of the same doctor slot (race-condition guard):
  -- lock the doctor row (or an availability row as anchor) for this transaction.
  PERFORM 1 FROM public.doctors WHERE id = p_doctor_id FOR UPDATE;

  -- Integrity: must fall within doctor availability (if any is defined)
  IF NOT public.is_doctor_available(p_doctor_id, p_date, p_time) THEN
    RAISE EXCEPTION 'Selected time is outside the doctor''s availability';
  END IF;

  -- Integrity: no double booking for same doctor/date/time
  IF EXISTS (
    SELECT 1 FROM public.appointments
    WHERE doctor_id = p_doctor_id AND appointment_date = p_date AND appointment_time = p_time
      AND status IN ('Waiting','Scheduled','In Consultation','Confirmed')
  ) THEN
    RAISE EXCEPTION 'This time slot has already been booked. Please choose another time.';
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

-- -----------------------------------------------------------------------------
-- 4. get_available_slots(doctor_id, date)
--    Returns the list of bookable timeslots for a given doctor and date.
--    Respects the doctor's defined availability (or all standard clinic slots
--    when none are defined) and excludes slots already taken.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_available_slots(p_doctor_id uuid, p_date date)
RETURNS TABLE (slot text, available boolean)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_slot text;
  v_start time; v_end time;
  v_has_avail boolean;
  v_taken boolean;
  v_now time;
BEGIN
  IF p_date < current_date THEN
    RETURN;
  END IF;

  v_now := localtime;

  SELECT EXISTS (
    SELECT 1 FROM public.doctor_availability
    WHERE doctor_id = p_doctor_id AND status = 'active'
  ) INTO v_has_avail;

  IF v_has_avail THEN
    -- A doctor with a defined schedule: generate 30-min slots within their windows
    FOR v_slot IN
      SELECT to_char(generate_series(
        date '2000-01-01' + da.start_time::time,
        date '2000-01-01' + da.end_time::time - interval '1 minute',
        interval '30 minutes'
      ), 'HH12:MI AM')
      FROM public.doctor_availability da
      WHERE da.doctor_id = p_doctor_id AND da.status = 'active'
        AND da.day_of_week = extract(isodow from p_date::timestamp)::int % 7
      ORDER BY 1
    LOOP
      IF p_date = current_date AND v_slot::time <= v_now THEN
        CONTINUE;
      END IF;
      SELECT EXISTS (
        SELECT 1 FROM public.appointments
        WHERE doctor_id = p_doctor_id AND appointment_date = p_date
          AND appointment_time = v_slot AND status IN ('Waiting','Scheduled','In Consultation','Confirmed')
      ) INTO v_taken;
      slot := v_slot;
      available := NOT v_taken;
      RETURN NEXT;
    END LOOP;
  ELSE
    -- Doctor with no defined schedule: fall back to standard clinic slots
    FOR v_slot IN
      SELECT to_char(generate_series(
        date '2000-01-01' + time '09:00',
        date '2000-01-01' + time '21:00' - interval '1 minute',
        interval '30 minutes'
      ), 'HH12:MI AM')
    LOOP
      IF p_date = current_date AND v_slot::time <= v_now THEN
        CONTINUE;
      END IF;
      SELECT EXISTS (
        SELECT 1 FROM public.appointments
        WHERE doctor_id = p_doctor_id AND appointment_date = p_date
          AND appointment_time = v_slot AND status IN ('Waiting','Scheduled','In Consultation','Confirmed')
      ) INTO v_taken;
      slot := v_slot;
      available := NOT v_taken;
      RETURN NEXT;
    END LOOP;
  END IF;
END; $$;
GRANT EXECUTE ON FUNCTION public.get_available_slots(uuid, date) TO anon, authenticated;

-- -----------------------------------------------------------------------------
-- 5. DOCTOR SELF-REGISTRATION (profile creation)
--    The auth account is created client-side via supabase.auth.signUp() using
--    the publishable key (allowed by default). This function then creates the
--    linked doctor profile for the just-created authenticated user, enforcing
--    uniqueness on the doctor email and that the caller IS the new user.
--    The created doctor starts as 'active' so they can log in immediately.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.register_doctor_profile(
  p_name text, p_qualification text, p_specialization text,
  p_experience_years int, p_registration_number text, p_phone text, p_bio text
) RETURNS json
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_email text;
  v_doc_id uuid;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'You must be signed in to complete doctor registration';
  END IF;

  SELECT lower(email) INTO v_email FROM auth.users WHERE id = v_uid;
  IF v_email IS NULL THEN
    RAISE EXCEPTION 'No authenticated account found';
  END IF;

  IF length(trim(coalesce(p_name,''))) < 2 THEN
    RAISE EXCEPTION 'A valid full name is required';
  END IF;

  -- The caller's auth email must not already belong to another doctor
  IF EXISTS (SELECT 1 FROM public.doctors WHERE lower(email) = v_email AND user_id IS DISTINCT FROM v_uid) THEN
    RAISE EXCEPTION 'An account already exists for this doctor email';
  END IF;

  -- Idempotent: if a doctor profile already exists for this user, just return it
  SELECT id INTO v_doc_id FROM public.doctors WHERE user_id = v_uid LIMIT 1;
  IF v_doc_id IS NULL THEN
    INSERT INTO public.doctors (
      user_id, name, email, qualification, specialization,
      experience_years, registration_number, phone, bio, status
    ) VALUES (
      v_uid, trim(p_name), v_email, coalesce(coalesce(trim(p_qualification),''), ''),
      coalesce(coalesce(trim(p_specialization),''), ''),
      coalesce(p_experience_years, 0), coalesce(trim(p_registration_number), ''),
      coalesce(trim(p_phone), ''), coalesce(trim(p_bio), ''), 'active'
    )
    RETURNING id INTO v_doc_id;
  END IF;

  RETURN json_build_object('id', v_doc_id, 'email', v_email);
END; $$;
GRANT EXECUTE ON FUNCTION public.register_doctor_profile(text, text, text, int, text, text, text) TO authenticated;

-- ============================================================
-- Seed auth accounts for existing doctors so they can log in.
-- Default password for all seeded doctors: doctor123
-- Safe to re-run: skips doctors already linked to an auth user.
-- ============================================================
CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
  doc RECORD;
  auth_uid uuid;
BEGIN
  FOR doc IN
    SELECT id, email FROM public.doctors WHERE user_id IS NULL
  LOOP
    -- If an auth user with this email already exists, just link it
    IF EXISTS (
      SELECT 1 FROM auth.users WHERE lower(email) = lower(doc.email)
    ) THEN
      auth_uid := (SELECT id FROM auth.users WHERE lower(email) = lower(doc.email) LIMIT 1);

      UPDATE public.doctors
      SET user_id = auth_uid
      WHERE id = doc.id AND user_id IS NULL;

      INSERT INTO auth.identities (
        id, provider_id, user_id, identity_data, provider,
        last_sign_in_at, created_at, updated_at
      ) VALUES (
        auth_uid, auth_uid::text, auth_uid,
        jsonb_build_object(
          'sub', auth_uid,
          'email', lower(doc.email),
          'email_verified', true
        ),
        'email', now(), now(), now()
      )
      ON CONFLICT DO NOTHING;

      RAISE NOTICE 'Linked existing auth user to %', doc.email;
      CONTINUE;
    END IF;

    auth_uid := gen_random_uuid();

    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, created_at, updated_at,
      confirmation_token, recovery_token,
      email_change_token_new, email_change
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      auth_uid, 'authenticated', 'authenticated',
      lower(doc.email),
      crypt('doctor123', gen_salt('bf')),
      now(), now(), now(),
      '', '', '', ''
    );

    INSERT INTO auth.identities (
      id, provider_id, user_id, identity_data, provider,
      last_sign_in_at, created_at, updated_at
    ) VALUES (
      auth_uid, auth_uid::text, auth_uid,
      jsonb_build_object(
        'sub', auth_uid,
        'email', lower(doc.email),
        'email_verified', true
      ),
      'email', now(), now(), now()
    );

    UPDATE public.doctors SET user_id = auth_uid WHERE id = doc.id;
    RAISE NOTICE 'Created auth account for % (id: %)', doc.email, auth_uid;
  END LOOP;
END $$;
