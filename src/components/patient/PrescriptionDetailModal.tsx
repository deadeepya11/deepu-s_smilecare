import { useEffect, type ReactNode } from "react";
import { Calendar, Mail, MapPin, Phone, Printer, ShieldCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  CLINIC_CONTACT,
  PATIENT_ADDRESS,
  PATIENT_DOCTOR,
  PATIENT,
  type PatientPrescription,
  type PatientMedication,
} from "@/lib/patient-data";

type PrescriptionDetailModalProps = {
  prescription: PatientPrescription;
  onClose: () => void;
};

export function PrescriptionDetailModal({ prescription, onClose }: PrescriptionDetailModalProps) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Trap focus to the dialog body
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    return () => previous?.focus?.();
  }, []);

  const handlePrint = () => window.print();

  return (
    <div
      className="prescription-print-mode fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 backdrop-blur-xs sm:p-6 animate-fade-up print:animate-none print:p-0 print:bg-white print:static print:items-start"
      role="dialog"
      aria-modal="true"
      aria-label={`Prescription ${prescription.code}`}
    >
      <div className="relative flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-border/80 bg-white shadow-2xl print:max-h-none print:rounded-none print:border-none print:shadow-none">
        {/* Top bar (hidden on print) */}
        <div className="flex items-center justify-between border-b border-border/80 bg-secondary/40 px-5 py-3.5 print:hidden">
          <div>
            <h3 className="text-sm font-extrabold text-foreground">Prescription</h3>
            <p className="font-mono text-xs font-semibold text-primary">{prescription.code}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handlePrint}
              size="sm"
              className="gradient-cta rounded-full px-4 text-xs font-semibold text-white shadow-soft h-8 gap-1.5 cursor-pointer"
            >
              <Printer className="size-3.5" />
              Print
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="rounded-full size-8 p-0 text-muted-foreground"
              aria-label="Close prescription"
            >
              <X className="size-4" />
            </Button>
          </div>
        </div>

        {/* Scrollable document body */}
        <div className="flex-1 overflow-y-auto bg-white p-5 text-slate-900 sm:p-8 print:overflow-visible print:p-8">
          <div className="mx-auto max-w-2xl space-y-5 font-sans">
            {/* Letterhead */}
            <div className="flex flex-col justify-between gap-3 border-b-2 border-primary/80 pb-4 sm:flex-row sm:items-center">
              <div className="flex items-center gap-2.5">
                <span className="grid size-10 place-items-center rounded-xl bg-blue-600 text-lg font-black text-white">
                  S
                </span>
                <div>
                  <h2 className="text-lg font-black uppercase leading-tight tracking-tight text-blue-900">
                    SmileCare Dental Hospital
                  </h2>
                  <p className="text-[0.7rem] font-bold uppercase tracking-wider text-blue-600">
                    Centre for Advanced Dentistry
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-start gap-0.5 text-[0.68rem] text-slate-600 sm:items-end">
                <span className="flex items-center gap-1">
                  <Phone className="size-3 text-blue-600" /> {CLINIC_CONTACT.phone}
                </span>
                <span className="flex items-center gap-1">
                  <Mail className="size-3 text-blue-600" /> {CLINIC_CONTACT.email}
                </span>
                <span className="font-mono text-slate-500">Reg: NABH/KA/DENT-2024-884</span>
              </div>
            </div>

            {/* Prescription title */}
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-black uppercase tracking-wide text-slate-900">
                Prescription
              </h1>
              <Badge className="bg-success/15 px-3 py-1 text-xs font-bold uppercase text-success border-success/30">
                {prescription.status}
              </Badge>
            </div>

            {/* Doctor + Patient */}
            <div className="grid grid-cols-1 gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs sm:grid-cols-2">
              <div className="space-y-1 border-b border-slate-200 pb-3 sm:border-b-0 sm:border-r sm:pb-0 sm:pr-4">
                <p className="text-[0.62rem] font-bold uppercase tracking-wider text-blue-700">
                  Attending Doctor
                </p>
                <p className="text-sm font-extrabold text-slate-900">{PATIENT_DOCTOR.name}</p>
                <p className="font-semibold text-slate-700">
                  {PATIENT_DOCTOR.qualification} • {PATIENT_DOCTOR.specialization}
                </p>
                <p className="font-mono text-[0.68rem] text-slate-500">
                  DCI Reg No: {PATIENT_DOCTOR.registration_number}
                </p>
              </div>
              <div className="space-y-1 sm:pl-2">
                <p className="text-[0.62rem] font-bold uppercase tracking-wider text-blue-700">
                  Patient
                </p>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-extrabold text-slate-900">{PATIENT.name}</p>
                  <span className="rounded-md bg-blue-100 px-2 py-0.5 font-mono text-[0.68rem] font-bold text-blue-800">
                    {PATIENT.id}
                  </span>
                </div>
                <p className="text-slate-700">
                  {PATIENT.age} Yrs • {PATIENT.gender} • {PATIENT.phone}
                </p>
                <p className="flex items-center gap-1 text-[0.68rem] text-slate-500">
                  <MapPin className="size-3 text-blue-600" /> {PATIENT_ADDRESS}
                </p>
              </div>
            </div>

            {/* Diagnosis */}
            <div className="rounded-2xl border border-slate-200 p-4">
              <p className="text-[0.62rem] font-bold uppercase tracking-wider text-slate-500">
                Diagnosis — {prescription.problem}
              </p>
              <p className="mt-1 text-sm font-medium text-slate-800">{prescription.diagnosis}</p>
            </div>

            {/* Medication table */}
            <MedicationTable items={prescription.medicines} />

            {/* Instructions + Follow-up */}
            <div className="grid grid-cols-1 gap-4 text-xs sm:grid-cols-3">
              <div className="space-y-1.5 rounded-2xl border border-slate-200 bg-slate-50 p-3.5 sm:col-span-2">
                <p className="text-[0.62rem] font-bold uppercase tracking-wider text-slate-700">
                  Doctor's Instructions & Notes
                </p>
                <p className="text-[0.72rem] leading-relaxed text-slate-700">
                  {prescription.doctor_notes}
                </p>
              </div>
              <div className="flex flex-col justify-center rounded-2xl border border-blue-200 bg-blue-50/60 p-3.5 text-center">
                <p className="text-[0.62rem] font-bold uppercase tracking-wider text-blue-900">
                  Follow-up Date
                </p>
                <p className="mt-1 flex items-center justify-center gap-1 text-sm font-extrabold text-blue-700">
                  <Calendar className="size-3.5" /> {prescription.follow_up_date}
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex flex-col items-center justify-between gap-4 border-t-2 border-slate-200 pt-4 text-xs sm:flex-row sm:items-center">
              <div className="space-y-1 text-center sm:text-left">
                <p className="flex items-center justify-center gap-1.5 font-bold text-blue-900 sm:justify-start">
                  <ShieldCheck className="size-4 text-blue-600" /> Generated by SmileCare Dental
                  Hospital
                </p>
                <p className="font-mono text-[0.65rem] text-slate-500">
                  RX Code: {prescription.code} • Issued on: {prescription.date_issued}
                </p>
              </div>
              <div className="text-center sm:text-right">
                <div className="font-serif text-base italic font-bold text-blue-950">
                  {PATIENT_DOCTOR.name}
                </div>
                <div className="mx-auto w-32 border-t border-slate-400 sm:ml-auto" />
                <p className="text-[0.65rem] font-semibold text-slate-900">Doctor's Signature</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MedicationTable({ items }: { items: PatientMedication[] }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="font-serif text-2xl font-black italic text-blue-900">℞</span>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
          Prescribed Medications
        </h3>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-slate-300">
        <table className="w-full border-collapse text-left text-xs">
          <thead className="bg-slate-100 text-[0.65rem] font-bold uppercase tracking-wider text-slate-700">
            <tr className="border-b border-slate-300">
              <th className="px-3 py-2">#</th>
              <th className="px-3 py-2">Medicine & Strength</th>
              <th className="px-3 py-2">Dosage</th>
              <th className="px-3 py-2">Frequency</th>
              <th className="px-3 py-2">Duration</th>
              <th className="px-3 py-2">Instructions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {items.map((item, idx) => (
              <tr key={item.id} className={idx % 2 === 1 ? "bg-slate-50/60" : "bg-white"}>
                <td className="px-3 py-2.5 font-mono text-[0.7rem] font-bold text-slate-500">
                  {idx + 1}
                </td>
                <td className="px-3 py-2.5 font-bold text-slate-900">
                  {item.medicine_name}
                  {item.strength && (
                    <span className="block text-[0.68rem] font-normal text-blue-700">
                      {item.strength}
                    </span>
                  )}
                  {item.generic_name && item.generic_name !== item.medicine_name && (
                    <span className="block text-[0.62rem] font-normal italic text-slate-400">
                      {item.generic_name}
                    </span>
                  )}
                </td>
                <td className="px-3 py-2.5 font-medium text-slate-800">{item.dosage}</td>
                <td className="px-3 py-2.5 font-medium text-slate-800">{item.frequency}</td>
                <td className="px-3 py-2.5 font-medium text-slate-800">{item.duration}</td>
                <td className="px-3 py-2.5 text-[0.7rem] italic text-slate-600">
                  {item.instructions}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function DetailRow({
  icon,
  label,
  children,
}: {
  icon: ReactNode;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-border/70 bg-background p-3">
      <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </span>
      <div>
        <p className="text-[0.62rem] font-bold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <div className="text-sm font-semibold text-foreground">{children}</div>
      </div>
    </div>
  );
}
