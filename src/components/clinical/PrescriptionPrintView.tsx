import React from "react";
import {
  Printer,
  Download,
  X,
  Stethoscope,
  ShieldCheck,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export type PrescriptionPrintProps = {
  doctor: {
    name: string;
    qualification: string;
    specialization: string;
    registration_number: string;
    phone?: string;
    email?: string;
  };
  patient: {
    code: string;
    name: string;
    age: number | null;
    gender: string | null;
    phone: string;
    email: string | null;
  } | null;
  appointment: {
    code: string;
    appointment_date: string;
    appointment_time: string;
    service: string;
    reason: string;
  };
  consultation: {
    problem: string;
    diagnosis: string;
    clinical_observation: string;
    doctor_notes: string;
    affected_area?: string;
    tooth_number?: string;
    pain_level?: number | null;
  };
  prescription: {
    code: string;
    status: string;
    follow_up_date: string | null;
    created_at?: string;
  };
  items: Array<{
    medicine_name: string;
    strength: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions: string;
  }>;
  onClose: () => void;
};

export function PrescriptionPrintView({
  doctor,
  patient,
  appointment,
  consultation,
  prescription,
  items,
  onClose,
}: PrescriptionPrintProps) {
  const handlePrint = () => {
    window.print();
  };

  const currentDate = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="prescription-print-mode-clinical fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-2 sm:p-4 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white print:static print:inset-auto">
      {/* Modal Container */}
      <div className="relative w-full max-w-4xl rounded-3xl border border-border/80 bg-background shadow-2xl overflow-hidden flex flex-col max-h-[92vh] print:max-h-none print:border-none print:shadow-none print:rounded-none">
        {/* Modal Top Bar (Hidden in Print) */}
        <div className="flex items-center justify-between border-b border-border/80 bg-secondary/40 px-6 py-3.5 print:hidden">
          <div className="flex items-center gap-2">
            <span className="grid size-8 place-items-center rounded-xl bg-primary/10 text-primary">
              <Printer className="size-4" />
            </span>
            <div>
              <h3 className="text-sm font-extrabold text-foreground">
                Official Clinical Prescription Preview
              </h3>
              <p className="text-[0.68rem] text-muted-foreground">
                Prescription #{prescription.code} • Ready for Print & PDF Export
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={handlePrint}
              size="sm"
              className="gradient-cta rounded-full px-5 text-xs font-semibold text-white shadow-soft gap-1.5 h-8 cursor-pointer"
            >
              <Printer className="size-3.5" />
              <span>Print / Download PDF</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="rounded-full size-8 p-0 text-muted-foreground hover:text-foreground"
            >
              <X className="size-4" />
            </Button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-10 print:p-8 print:overflow-visible bg-white text-slate-900 selection:bg-blue-100">
          <div className="max-w-3xl mx-auto space-y-6 print:space-y-4 font-sans">
            {/* 1. CLINIC LETTERHEAD HEADER */}
            <div className="border-b-2 border-primary/80 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <div className="grid size-9 place-items-center rounded-xl bg-blue-600 text-white font-black text-lg">
                    S
                  </div>
                  <div>
                    <h1 className="text-2xl font-black tracking-tight text-blue-900 uppercase">
                      SmileCare Dental Hospital
                    </h1>
                    <p className="text-[0.72rem] font-bold tracking-wider text-blue-600 uppercase">
                      Centre for Advanced Dentistry & Implantology
                    </p>
                  </div>
                </div>
                <p className="mt-2 text-[0.72rem] text-slate-600 flex items-center gap-1.5">
                  <MapPin className="size-3 text-blue-600 shrink-0" />
                  128 Healthcare Avenue, Medical Enclave, Bengaluru, KA 560034
                </p>
              </div>

              <div className="text-left sm:text-right text-[0.72rem] text-slate-600 space-y-0.5">
                <p className="font-bold text-slate-900 flex items-center sm:justify-end gap-1">
                  <Phone className="size-3 text-blue-600" /> +91 (080) 4567 8900
                </p>
                <p className="flex items-center sm:justify-end gap-1">
                  <Mail className="size-3 text-blue-600" /> care@smilecare.com
                </p>
                <p className="text-[0.68rem] text-slate-500 font-mono">
                  Reg: NABH/KA/DENT-2024-884
                </p>
              </div>
            </div>

            {/* 2. DOCTOR & PATIENT DETAILS GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 rounded-2xl p-4 border border-slate-200 text-xs">
              {/* Doctor Details */}
              <div className="space-y-1 border-b sm:border-b-0 sm:border-r border-slate-200 pb-3 sm:pb-0 sm:pr-4">
                <p className="text-[0.68rem] font-bold text-blue-700 uppercase tracking-wider">
                  Attending Doctor
                </p>
                <p className="text-sm font-extrabold text-slate-900">{doctor.name}</p>
                <p className="text-slate-700 font-semibold">
                  {doctor.qualification} • {doctor.specialization}
                </p>
                <p className="text-[0.7rem] text-slate-500 font-mono">
                  DCI Reg No: {doctor.registration_number}
                </p>
              </div>

              {/* Patient Details */}
              <div className="space-y-1 sm:pl-2">
                <p className="text-[0.68rem] font-bold text-blue-700 uppercase tracking-wider">
                  Patient Information
                </p>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-extrabold text-slate-900">
                    {patient?.name || "Patient"}
                  </p>
                  <span className="font-mono text-[0.68rem] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-md">
                    {patient?.code || "N/A"}
                  </span>
                </div>
                <p className="text-slate-700">
                  {patient?.age ? `${patient.age} Yrs` : "Age N/A"} •{" "}
                  {patient?.gender || "Gender N/A"} • Phone: {patient?.phone || "N/A"}
                </p>
                <p className="text-[0.7rem] text-slate-500">
                  Visit Date:{" "}
                  <strong>
                    {appointment.appointment_date} ({appointment.appointment_time})
                  </strong>
                </p>
              </div>
            </div>

            {/* 3. CLINICAL DIAGNOSIS & OBSERVATION */}
            <div className="border border-slate-200 rounded-2xl p-4 bg-white space-y-2 text-xs">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-[0.68rem] font-bold text-slate-500 uppercase">
                    Primary Problem:
                  </span>
                  <span className="font-extrabold text-blue-900 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                    {consultation.problem || "Dental Examination"}
                  </span>
                </div>

                {consultation.tooth_number && (
                  <div className="flex items-center gap-1.5 text-[0.7rem]">
                    <span className="text-slate-500">Tooth/Region:</span>
                    <strong className="text-slate-800 font-mono">
                      {consultation.tooth_number}
                    </strong>
                    {consultation.affected_area && (
                      <span className="text-slate-500">({consultation.affected_area})</span>
                    )}
                  </div>
                )}
              </div>

              {consultation.diagnosis && (
                <div>
                  <span className="text-[0.68rem] font-bold text-slate-500 uppercase">
                    Clinical Diagnosis:
                  </span>
                  <p className="text-slate-800 font-medium mt-0.5">{consultation.diagnosis}</p>
                </div>
              )}

              {consultation.clinical_observation && (
                <div>
                  <span className="text-[0.68rem] font-bold text-slate-500 uppercase">
                    Findings & Examination:
                  </span>
                  <p className="text-slate-600 text-[0.72rem] mt-0.5">
                    {consultation.clinical_observation}
                  </p>
                </div>
              )}
            </div>

            {/* 4. MEDICATION PRESCRIPTION TABLE (Rx) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-serif italic font-black text-2xl text-blue-900">℞</span>
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Prescribed Medications
                  </h3>
                </div>
                <span className="text-[0.68rem] font-mono text-slate-500">
                  {items.length} {items.length === 1 ? "Medicine" : "Medicines"}
                </span>
              </div>

              <div className="overflow-hidden rounded-2xl border border-slate-300">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300 text-[0.68rem] uppercase">
                    <tr>
                      <th className="py-2.5 px-3">#</th>
                      <th className="py-2.5 px-3">Medicine & Strength</th>
                      <th className="py-2.5 px-3">Dosage</th>
                      <th className="py-2.5 px-3">Frequency</th>
                      <th className="py-2.5 px-3">Duration</th>
                      <th className="py-2.5 px-3">Instructions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-slate-800">
                    {items.map((item, idx) => (
                      <tr key={idx} className={idx % 2 === 1 ? "bg-slate-50/50" : "bg-white"}>
                        <td className="py-3 px-3 font-mono text-[0.7rem] text-slate-500 font-bold">
                          {idx + 1}
                        </td>
                        <td className="py-3 px-3 font-bold text-slate-900">
                          {item.medicine_name}
                          {item.strength && (
                            <span className="block text-[0.68rem] font-normal text-blue-700">
                              {item.strength}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 font-medium">{item.dosage}</td>
                        <td className="py-3 px-3 font-medium">{item.frequency}</td>
                        <td className="py-3 px-3 font-medium">{item.duration}</td>
                        <td className="py-3 px-3 text-slate-600 text-[0.7rem] italic">
                          {item.instructions || "As directed"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 5. DOCTOR ADVICE & FOLLOW-UP INSTRUCTIONS */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-xs">
              <div className="sm:col-span-2 rounded-2xl border border-slate-200 p-3.5 bg-slate-50 space-y-1">
                <p className="text-[0.68rem] font-bold text-slate-700 uppercase">
                  Doctor Advice & Treatment Notes
                </p>
                <p className="text-slate-700 text-[0.72rem] leading-relaxed">
                  {consultation.doctor_notes ||
                    "Maintain proper oral hygiene. Avoid hot/spicy food for 24 hours. Take medications after meals."}
                </p>
              </div>

              <div className="rounded-2xl border border-blue-200 p-3.5 bg-blue-50/50 text-center flex flex-col justify-center">
                <p className="text-[0.68rem] font-bold text-blue-900 uppercase">Follow-up Date</p>
                <p className="text-sm font-extrabold text-blue-700 mt-1">
                  {prescription.follow_up_date
                    ? new Date(prescription.follow_up_date).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    : "As Needed / 7 Days"}
                </p>
                <p className="text-[0.65rem] text-slate-500 mt-0.5">
                  Please bring this slip during follow-up
                </p>
              </div>
            </div>

            {/* 6. SIGNATURE & VERIFICATION FOOTER */}
            <div className="pt-6 border-t-2 border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs">
              <div className="space-y-1 text-center sm:text-left">
                <div className="flex items-center gap-1.5 text-blue-900 font-bold text-[0.72rem]">
                  <ShieldCheck className="size-4 text-blue-600" />
                  <span>Digitally Verified Medical Document</span>
                </div>
                <p className="text-[0.65rem] text-slate-500 font-mono">
                  RX Code: <strong>{prescription.code}</strong> • Issued on: {currentDate}
                </p>
                <p className="text-[0.6rem] text-slate-400">
                  SmileCare Telehealth & In-Clinic Electronic Health Record System
                </p>
              </div>

              {/* Doctor Signature Block */}
              <div className="text-center sm:text-right space-y-1">
                <div className="font-serif italic text-lg text-blue-950 font-bold tracking-wider">
                  {doctor.name}
                </div>
                <div className="w-36 border-t border-slate-400 mx-auto sm:ml-auto" />
                <p className="text-[0.7rem] font-bold text-slate-900">{doctor.name}</p>
                <p className="text-[0.65rem] text-slate-500">
                  {doctor.qualification} (Reg: {doctor.registration_number})
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
