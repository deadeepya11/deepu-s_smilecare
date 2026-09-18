// ============================================================================
// SmileCare — Patient Portal Mock Data
// ----------------------------------------------------------------------------
// FRONTEND-ONLY demonstration data. No Supabase queries, no backend calls.
// Replace with the `get_patient_prescription` RPC (or patient API) in a later
// phase. Keep this file free of any schema / migration / RLS dependencies.
// ============================================================================

export type PatientMedication = {
  id: string;
  medicine_name: string;
  generic_name: string | null;
  strength: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
};

export type PatientPrescription = {
  code: string;
  status: "ISSUED";
  date_issued: string;
  diagnosis: string;
  problem: string;
  doctor_notes: string;
  follow_up_date: string;
  medicines: PatientMedication[];
};

export type PatientAppointment = {
  id: string;
  code: string;
  doctor: string;
  qualification: string;
  specialization: string;
  date: string;
  time: string;
  appointment_type: string;
  service: string;
  reason: string;
  status: "Completed" | "Upcoming" | "Reschedule Requested";
};

export type TreatmentStep = {
  key: string;
  label: string;
  description: string;
  status: "completed" | "active" | "upcoming";
  date: string | null;
};

export type PatientProfile = {
  name: string;
  displayName: string;
  id: string;
  age: number;
  gender: string;
  phone: string;
  email: string;
};

export const PATIENT: PatientProfile = {
  name: "Ananya Reddy",
  displayName: "Ananya",
  id: "PT-00452",
  age: 24,
  gender: "Female",
  phone: "+91 98765 43210",
  email: "ananya@example.com",
};

export const PATIENT_DOCTOR = {
  name: "Dr. Priya Sharma",
  qualification: "BDS, MDS",
  specialization: "General Dentistry",
  registration_number: "DCI-2019-6642",
  phone: "+91 98765 43211",
  email: "priya@smilecare.com",
};

export const PATIENT_ADDRESS = "128 Healthcare Avenue, Medical Enclave, Bengaluru, KA 560034";

export const CLINIC_CONTACT = {
  phone: "+91 080 4567 8900",
  email: "care@smilecare.com",
  emergency: "+91 98450 11223",
};

export const PATIENT_PRESCRIPTION: PatientPrescription = {
  code: "RX-2026-00452",
  status: "ISSUED",
  date_issued: "September 2, 2026",
  diagnosis: "Localized dental infection with associated pain in the lower right quadrant.",
  problem: "Dental Infection",
  doctor_notes:
    "Maintain good oral hygiene and avoid very hot or cold foods for the next few days. Complete the full course of antibiotics even if symptoms improve. Contact the clinic if swelling or fever persists.",
  follow_up_date: "September 18, 2026",
  medicines: [
    {
      id: "med-1",
      medicine_name: "Amoxicillin",
      generic_name: "Amoxicillin Trihydrate",
      strength: "500 mg",
      dosage: "1 capsule",
      frequency: "Three times daily",
      duration: "5 days",
      instructions: "Take after food",
    },
    {
      id: "med-2",
      medicine_name: "Ibuprofen",
      generic_name: "Ibuprofen",
      strength: "400 mg",
      dosage: "1 tablet",
      frequency: "Twice daily",
      duration: "3 days",
      instructions: "Take after food",
    },
    {
      id: "med-3",
      medicine_name: "Chlorhexidine Mouthwash",
      generic_name: "Chlorhexidine Gluconate 0.12%",
      strength: "0.12%",
      dosage: "10 ml",
      frequency: "Twice daily",
      duration: "7 days",
      instructions: "Rinse for 30 seconds and do not swallow",
    },
  ],
};

export const UPCOMING_APPOINTMENT: PatientAppointment = {
  id: "apt-upcoming",
  code: "SC-2026-00231",
  doctor: PATIENT_DOCTOR.name,
  qualification: PATIENT_DOCTOR.qualification,
  specialization: PATIENT_DOCTOR.specialization,
  date: "September 18, 2026",
  time: "10:30 AM",
  appointment_type: "Follow-up",
  service: "General Dentistry",
  reason: "Post-treatment review of dental infection recovery.",
  status: "Upcoming",
};

export const PAST_APPOINTMENTS: PatientAppointment[] = [
  {
    id: "apt-past-1",
    code: "SC-2026-00124",
    doctor: PATIENT_DOCTOR.name,
    qualification: PATIENT_DOCTOR.qualification,
    specialization: PATIENT_DOCTOR.specialization,
    date: "September 2, 2026",
    time: "11:00 AM",
    appointment_type: "New Consultation",
    service: "General Dentistry",
    reason: "Toothache and mild swelling in lower right jaw.",
    status: "Completed",
  },
  {
    id: "apt-past-2",
    code: "SC-2026-00101",
    doctor: PATIENT_DOCTOR.name,
    qualification: PATIENT_DOCTOR.qualification,
    specialization: PATIENT_DOCTOR.specialization,
    date: "August 14, 2026",
    time: "4:30 PM",
    appointment_type: "Follow-up",
    service: "General Dentistry",
    reason: "Routine dental checkup and scaling.",
    status: "Completed",
  },
];

export const PRESCRIPTION_HISTORY: PatientPrescription[] = [
  {
    ...PATIENT_PRESCRIPTION,
    code: "RX-2026-00452",
    date_issued: "September 2, 2026",
  },
  {
    code: "RX-2026-00398",
    status: "ISSUED",
    date_issued: "August 14, 2026",
    diagnosis: "Mild gingival inflammation and plaque accumulation.",
    problem: "Gingivitis",
    doctor_notes:
      "Maintain proper brushing and flossing routine. Use the prescribed mouthwash twice daily and attend the scheduled follow-up.",
    follow_up_date: "September 2, 2026",
    medicines: [
      {
        id: "med-old-1",
        medicine_name: "Chlorhexidine Mouthwash",
        generic_name: "Chlorhexidine Gluconate 0.12%",
        strength: "0.12%",
        dosage: "10 ml",
        frequency: "Twice daily",
        duration: "7 days",
        instructions: "Rinse for 30 seconds and do not swallow",
      },
      {
        id: "med-old-2",
        medicine_name: "Ibuprofen",
        generic_name: "Ibuprofen",
        strength: "400 mg",
        dosage: "1 tablet",
        frequency: "As needed",
        duration: "2 days",
        instructions: "Take after food if pain occurs",
      },
    ],
  },
];

export const PATIENT_TIMELINE: TreatmentStep[] = [
  {
    key: "booked",
    label: "Appointment Booked",
    description: "New consultation confirmed",
    status: "completed",
    date: "August 28, 2026",
  },
  {
    key: "consultation",
    label: "Consultation",
    description: "Clinical examination completed",
    status: "completed",
    date: "September 2, 2026",
  },
  {
    key: "diagnosis",
    label: "Diagnosis",
    description: "Dental infection diagnosed",
    status: "completed",
    date: "September 2, 2026",
  },
  {
    key: "prescription",
    label: "Prescription Issued",
    description: "RX-2026-00452 issued",
    status: "completed",
    date: "September 2, 2026",
  },
  {
    key: "followup",
    label: "Follow-up",
    description: "Post-treatment review",
    status: "active",
    date: "September 18, 2026",
  },
];
