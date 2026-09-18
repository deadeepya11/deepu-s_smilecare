-- Add RPC for Patient Portal securely retrieving their prescription details

CREATE OR REPLACE FUNCTION public.get_patient_prescription(
  p_patient_code text,
  p_appointment_code text
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'patient', jsonb_build_object(
      'id', pt.id,
      'code', pt.code,
      'name', pt.name,
      'phone', pt.phone,
      'age', pt.age,
      'gender', pt.gender
    ),
    'appointment', jsonb_build_object(
      'id', a.id,
      'code', a.code,
      'appointment_date', a.appointment_date,
      'appointment_time', a.appointment_time,
      'service', a.service
    ),
    'doctor', jsonb_build_object(
      'id', d.id,
      'name', d.name,
      'specialization', d.specialization,
      'qualification', d.qualification,
      'registration_number', d.registration_number,
      'email', d.email,
      'phone', d.phone
    ),
    'prescription', jsonb_build_object(
      'id', pr.id,
      'code', pr.code,
      'status', pr.status,
      'follow_up_date', pr.follow_up_date,
      'problem', pr.problem,
      'diagnosis', pr.diagnosis,
      'doctor_notes', pr.doctor_notes,
      'created_at', pr.created_at
    ),
    'consultation', jsonb_build_object(
      'clinical_observation', c.clinical_observation,
      'affected_area', c.affected_area,
      'tooth_number', c.tooth_number,
      'pain_level', c.pain_level
    ),
    'items', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'id', pi.id,
        'medicine_name', pi.medicine_name,
        'strength', pi.strength,
        'dosage', pi.dosage,
        'frequency', pi.frequency,
        'duration', pi.duration,
        'instructions', pi.instructions
      ))
      FROM public.prescription_items pi
      WHERE pi.prescription_id = pr.id
    ), '[]'::jsonb)
  )
  INTO v_result
  FROM public.patients pt
  JOIN public.appointments a ON a.patient_id = pt.id
  JOIN public.doctors d ON a.doctor_id = d.id
  JOIN public.prescriptions pr ON pr.appointment_id = a.id
  JOIN public.consultations c ON pr.consultation_id = c.id
  WHERE pt.code = p_patient_code
    AND a.code = p_appointment_code
    AND pr.status = 'Issued'
  LIMIT 1;

  RETURN v_result;
END; $$;

GRANT EXECUTE ON FUNCTION public.get_patient_prescription(text, text) TO anon, authenticated;
