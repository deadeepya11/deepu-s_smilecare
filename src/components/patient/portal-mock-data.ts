// ============================================================================
// SmileCare Patient Portal — Mock Data
// ----------------------------------------------------------------------------
// MOCK DATA — FRONTEND ONLY
// Replace with Supabase integration in a future phase.
// Do NOT connect this data to any backend, database, or API.
// ============================================================================

export type PortalTimeBadge = "Morning" | "Afternoon" | "Night";

export type PortalMedication = {
  id: string;
  medicine_name: string;
  strength: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  time_badges: PortalTimeBadge[];
};

export type PortalDoctor = {
  name: string;
  qualification: string;
  specialization: string;
  registration_number: string;
};

export type PortalPatient = {
  name: string;
  code: string;
  age: number;
  gender: string;
  phone: string;
  email: string;
};

export type PortalAppointment = {
  code: string;
  date: string;
  time: string;
  type: string;
  service: string;
};

export type PortalClinicalSummary = {
  chief_complaint: string;
  problem: string;
  diagnosis: string;
  affected_area: string;
  pain_level: number;
  doctor_notes: string;
};

export type PortalPrescription = {
  code: string;
  status: string;
  issued_date: string;
  follow_up_date: string;
};

export type PortalMockData = {
  patient: PortalPatient;
  appointment: PortalAppointment;
  doctor: PortalDoctor;
  prescription: PortalPrescription;
  clinical_summary: PortalClinicalSummary;
  medications: PortalMedication[];
};

// ---------------------------------------------------------------------------
// MOCK DATA OBJECT
// ---------------------------------------------------------------------------

export const MOCK_PRESCRIPTION_DATA: PortalMockData = {
  patient: {
    name: "Deadeepya",
    code: "PT-00001",
    age: 21,
    gender: "Female",
    phone: "+91 98765 43210",
    email: "deadeepya@example.com",
  },
  appointment: {
    code: "SC-2026-00042",
    date: "02 September 2026",
    time: "10:30 AM",
    type: "New Consultation",
    service: "General Dentistry",
  },
  doctor: {
    name: "Dr. Ananya Rao",
    qualification: "BDS, MDS",
    specialization: "General Dentist",
    registration_number: "DCI-2019-6642",
  },
  prescription: {
    code: "RX-2026-00042",
    status: "Issued",
    issued_date: "02 September 2026",
    follow_up_date: "16 September 2026",
  },
  clinical_summary: {
    chief_complaint: "Dental pain and sensitivity",
    problem: "Dental Infection",
    diagnosis: "Localized dental infection with associated inflammation",
    affected_area: "Lower right molar",
    pain_level: 6,
    doctor_notes:
      "Maintain good oral hygiene and complete the prescribed medication course.",
  },
  medications: [
    {
      id: "mock-med-1",
      medicine_name: "Amoxicillin",
      strength: "500 mg",
      dosage: "1 capsule",
      frequency: "Twice daily",
      duration: "5 days",
      instructions: "Take after food with water.",
      time_badges: ["Morning", "Night"],
    },
    {
      id: "mock-med-2",
      medicine_name: "Ibuprofen",
      strength: "400 mg",
      dosage: "1 tablet",
      frequency: "Three times daily",
      duration: "3 days",
      instructions: "Take after food. Do not exceed the prescribed dose.",
      time_badges: ["Morning", "Afternoon", "Night"],
    },
  ],
};
