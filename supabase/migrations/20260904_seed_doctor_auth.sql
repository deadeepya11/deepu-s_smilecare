-- ============================================================
-- Seed Supabase Auth accounts for existing doctors.
-- Run this ONLY (in Supabase SQL Editor) if you already applied
-- 20260903_availability_integrity_signup.sql successfully.
--
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