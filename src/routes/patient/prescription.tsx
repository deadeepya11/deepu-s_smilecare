import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CalendarClock,
  CheckCircle2,
  Clock,
  FileText,
  Mail,
  MapPin,
  Phone,
  Pill,
  Printer,
  Stethoscope,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { PatientPortalLayout } from "@/components/patient/PatientPortalLayout";
import { PrescriptionDetailModal } from "@/components/patient/PrescriptionDetailModal";
import { TreatmentTimeline } from "@/components/patient/TreatmentTimeline";
import {
  CLINIC_CONTACT,
  PATIENT,
  PATIENT_DOCTOR,
  PATIENT_PRESCRIPTION,
  UPCOMING_APPOINTMENT,
  type PatientMedication,
} from "@/lib/patient-data";

export const Route = createFileRoute("/patient/prescription")({
  component: PatientPrescriptionPage,
});

function useMockLoading(delay = 700) {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), delay);
    return () => clearTimeout(t);
  }, [delay]);
  return loading;
}

function LoadingState() {
  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-card">
        <div className="h-6 w-48 animate-pulse rounded-lg bg-secondary sm:w-72" />
        <div className="mt-3 h-4 w-64 animate-pulse rounded-lg bg-secondary sm:w-96" />
        <div className="mt-5 h-px bg-border" />
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="h-16 animate-pulse rounded-2xl bg-secondary/60" />
          <div className="h-16 animate-pulse rounded-2xl bg-secondary/60" />
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="h-64 animate-pulse rounded-3xl bg-card shadow-card" />
          <div className="h-80 animate-pulse rounded-3xl bg-card shadow-card" />
        </div>
        <div className="h-72 animate-pulse rounded-3xl bg-card shadow-card" />
      </div>
    </div>
  );
}

function StatItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border/70 bg-background p-3.5">
      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-[0.62rem] font-bold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p className="truncate text-sm font-bold text-foreground">{value}</p>
      </div>
    </div>
  );
}

function MedicationCard({ item, index }: { item: PatientMedication; index: number }) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border/80 bg-background p-4 shadow-xs transition-shadow hover:shadow-soft sm:flex-row sm:items-center">
      <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 text-primary">
        <Pill className="size-6" />
      </div>
      <div className="flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[0.62rem] font-bold text-muted-foreground">#{index + 1}</span>
          <h4 className="text-base font-bold text-foreground">{item.medicine_name}</h4>
          <Badge
            variant="outline"
            className="bg-background text-[0.65rem] font-semibold text-primary"
          >
            {item.strength}
          </Badge>
        </div>
        {item.generic_name && item.generic_name !== item.medicine_name && (
          <p className="text-[0.7rem] italic text-muted-foreground">{item.generic_name}</p>
        )}
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="size-3 text-primary/70" /> Dosage:{" "}
            <strong className="text-foreground">{item.dosage}</strong>
          </span>
          <span className="flex items-center gap-1">
            <Clock className="size-3 text-primary/70" /> Freq:{" "}
            <strong className="text-foreground">{item.frequency}</strong>
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="size-3 text-primary/70" /> For:{" "}
            <strong className="text-foreground">{item.duration}</strong>
          </span>
        </div>
      </div>
      <div className="w-full rounded-xl border border-border/60 bg-secondary/40 p-3 text-xs sm:w-1/3">
        <p className="flex items-start gap-1.5 font-medium text-foreground/80">
          <AlertCircle className="mt-0.5 size-3.5 shrink-0 text-amber-500" />
          <span>{item.instructions}</span>
        </p>
      </div>
    </div>
  );
}

function MedicationTableRow({ item, index }: { item: PatientMedication; index: number }) {
  return (
    <tr className="border-b border-border/60 last:border-0">
      <td className="px-4 py-3.5">
        <p className="font-bold text-foreground">{item.medicine_name}</p>
        <p className="text-[0.65rem] text-muted-foreground">{item.strength}</p>
      </td>
      <td className="px-4 py-3.5 text-foreground">{item.dosage}</td>
      <td className="px-4 py-3.5 text-foreground">{item.frequency}</td>
      <td className="px-4 py-3.5 text-foreground">{item.duration}</td>
      <td className="px-4 py-3.5 text-muted-foreground italic">{item.instructions}</td>
    </tr>
  );
}

function PatientPrescriptionPage() {
  const loading = useMockLoading();
  const [showDetail, setShowDetail] = useState(false);
  const rx = PATIENT_PRESCRIPTION;

  const handlePrint = () => {
    setShowDetail(true);
    // Wait a tick for the modal to mount, then open the browser print dialog.
    // print CSS hides all portal chrome and prints the prescription document only.
    window.setTimeout(() => window.print(), 300);
  };

  return (
    <PatientPortalLayout>
      <div className="patient-portal-page mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {loading ? (
          <LoadingState />
        ) : (
          <div className="space-y-6 animate-fade-up">
            {/* Breadcrumb */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <Link
                to="/patient/dashboard"
                className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-background px-3 py-1.5 font-semibold text-muted-foreground transition-colors hover:text-primary"
              >
                <ArrowLeft className="size-3.5" />
                Dashboard
              </Link>
              <span>/</span>
              <span className="font-semibold text-foreground">Prescription</span>
            </div>

            {/* Welcome header */}
            <div className="flex flex-col justify-between gap-4 rounded-3xl border border-border/80 bg-white p-6 shadow-card sm:p-8 lg:flex-row lg:items-center">
              <div>
                <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
                  Hello, {PATIENT.displayName} <span aria-hidden="true">👋</span>
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Here is your latest dental prescription and treatment plan.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:max-w-xl">
                <StatItem
                  icon={<User className="size-4" />}
                  label="Patient ID"
                  value={PATIENT.id}
                />
                <StatItem
                  icon={<CalendarClock className="size-4" />}
                  label="Last Visit"
                  value="Sep 2, 2026"
                />
                <StatItem
                  icon={<Stethoscope className="size-4" />}
                  label="Specialty"
                  value={PATIENT_DOCTOR.specialization}
                />
                <StatItem
                  icon={<CheckCircle2 className="size-4" />}
                  label="Status"
                  value={rx.status}
                />
              </div>
            </div>

            {/* Prescription summary card */}
            <section
              aria-label="Prescription summary"
              className="relative overflow-hidden rounded-3xl border border-border/80 bg-white p-6 shadow-card sm:p-7"
            >
              <div
                className="pointer-events-none absolute -right-6 -top-6 opacity-[0.04]"
                aria-hidden="true"
              >
                <FileText className="size-44" />
              </div>
              <div className="relative">
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                  <div>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-success/30 bg-success/10 px-3 py-1 text-[0.65rem] font-bold uppercase tracking-wider text-success">
                      <CheckCircle2 className="size-3" /> {rx.status}
                    </span>
                    <h2 className="mt-3 text-xl font-extrabold text-foreground">Prescription</h2>
                    <p className="mt-1 font-mono text-sm font-semibold text-primary">{rx.code}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      onClick={handlePrint}
                      className="gradient-cta rounded-full px-5 text-xs font-semibold text-white shadow-soft h-9 gap-1.5 cursor-pointer"
                    >
                      <Printer className="size-3.5" />
                      Print / Download
                    </Button>
                    <Button
                      onClick={() => setShowDetail(true)}
                      variant="outline"
                      className="rounded-full px-5 text-xs font-semibold h-9 border-primary/25 text-primary hover:bg-primary/5 gap-1.5"
                    >
                      <FileText className="size-3.5" />
                      View Prescription
                    </Button>
                  </div>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-border/70 bg-secondary/30 p-4">
                    <p className="text-[0.62rem] font-bold uppercase tracking-wider text-muted-foreground">
                      Doctor
                    </p>
                    <p className="mt-0.5 text-sm font-bold text-foreground">
                      {PATIENT_DOCTOR.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {PATIENT_DOCTOR.qualification} • {PATIENT_DOCTOR.specialization}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-border/70 bg-secondary/30 p-4">
                    <p className="text-[0.62rem] font-bold uppercase tracking-wider text-muted-foreground">
                      Clinic
                    </p>
                    <p className="mt-0.5 text-sm font-bold text-foreground">
                      SmileCare Dental Hospital
                    </p>
                    <p className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="size-3 text-primary" /> Issued {rx.date_issued}
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-border/70 p-4">
                    <p className="text-[0.62rem] font-bold uppercase tracking-wider text-muted-foreground">
                      Patient Name
                    </p>
                    <p className="mt-0.5 text-sm font-bold text-foreground">{PATIENT.name}</p>
                  </div>
                  <div className="rounded-2xl border border-border/70 p-4">
                    <p className="text-[0.62rem] font-bold uppercase tracking-wider text-muted-foreground">
                      Patient ID
                    </p>
                    <p className="mt-0.5 font-mono text-sm font-bold text-primary">{PATIENT.id}</p>
                  </div>
                </div>
              </div>
            </section>

            <div className="grid gap-6 lg:grid-cols-3">
              {/* Left column */}
              <div className="space-y-6 lg:col-span-2">
                {/* Medications */}
                <section
                  aria-label="Your Medications"
                  className="rounded-3xl border border-border/80 bg-white p-6 shadow-card sm:p-7"
                >
                  <div className="mb-5">
                    <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
                      <Pill className="size-5 text-primary" /> Your Medications
                    </h2>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Follow your dentist's instructions carefully.
                    </p>
                  </div>

                  {/* Desktop table */}
                  <div className="hidden overflow-hidden rounded-2xl border border-border/80 md:block">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-secondary/50 text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground">
                        <tr>
                          <th className="px-4 py-3">Medicine & Strength</th>
                          <th className="px-4 py-3">Dosage</th>
                          <th className="px-4 py-3">Frequency</th>
                          <th className="px-4 py-3">Duration</th>
                          <th className="px-4 py-3">Instructions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-background">
                        {rx.medicines.map((med, i) => (
                          <MedicationTableRow key={med.id} item={med} index={i} />
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile stacked cards */}
                  <div className="space-y-4 md:hidden">
                    {rx.medicines.map((med, i) => (
                      <MedicationCard key={med.id} item={med} index={i} />
                    ))}
                  </div>
                </section>

                {/* Doctor's instructions */}
                <section
                  aria-label="Doctor's Instructions"
                  className="rounded-3xl border border-border/80 bg-white p-6 shadow-card sm:p-7"
                >
                  <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
                    <Stethoscope className="size-5 text-primary" /> Doctor's Instructions
                  </h2>
                  <p className="mt-3 rounded-2xl border border-primary/15 bg-primary/5 p-4 text-sm leading-relaxed text-foreground/90">
                    {rx.doctor_notes}
                  </p>

                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <div className="flex items-start gap-3 rounded-2xl border border-border/70 bg-secondary/30 p-4">
                      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                        <Calendar className="size-4" />
                      </span>
                      <div>
                        <p className="text-[0.62rem] font-bold uppercase tracking-wider text-muted-foreground">
                          Follow-up Date
                        </p>
                        <p className="text-sm font-bold text-foreground">{rx.follow_up_date}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 rounded-2xl border border-border/70 bg-secondary/30 p-4">
                      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                        <MapPin className="size-4" />
                      </span>
                      <div>
                        <p className="text-[0.62rem] font-bold uppercase tracking-wider text-muted-foreground">
                          Clinic Contact
                        </p>
                        <p className="text-sm font-bold text-foreground">{CLINIC_CONTACT.phone}</p>
                        <p className="text-xs text-muted-foreground">{CLINIC_CONTACT.email}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex items-start gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4">
                    <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-amber-500/15 text-amber-600">
                      <AlertCircle className="size-4" />
                    </span>
                    <div>
                      <p className="text-[0.62rem] font-bold uppercase tracking-wider text-amber-700">
                        Emergency Contact
                      </p>
                      <p className="text-sm font-bold text-foreground">
                        {CLINIC_CONTACT.emergency}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Available 24/7 for dental emergencies.
                      </p>
                    </div>
                  </div>
                </section>

                {/* Treatment timeline */}
                <TreatmentTimeline />
              </div>

              {/* Right column */}
              <div className="space-y-6">
                {/* Follow-up */}
                <section
                  aria-label="Your Follow-up"
                  className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 to-primary/5 p-6 shadow-card"
                >
                  <div
                    className="pointer-events-none absolute -right-4 -top-4 opacity-10"
                    aria-hidden="true"
                  >
                    <Calendar className="size-24 text-primary" />
                  </div>
                  <div className="relative">
                    <div className="mx-auto grid size-11 place-items-center rounded-2xl bg-white text-primary shadow-xs">
                      <CalendarClock className="size-5" />
                    </div>
                    <h2 className="mt-4 text-center text-base font-bold text-foreground">
                      Your Follow-up
                    </h2>
                    <div className="mt-4 rounded-2xl border-y border-primary/10 py-3 text-center">
                      <p className="text-xs text-muted-foreground">Scheduled for</p>
                      <p className="text-lg font-extrabold text-primary">
                        {UPCOMING_APPOINTMENT.date}
                      </p>
                      <p className="mt-0.5 flex items-center justify-center gap-1 text-xs font-semibold text-foreground">
                        <Clock className="size-3.5 text-primary" /> {UPCOMING_APPOINTMENT.time}
                      </p>
                    </div>
                    <div className="mt-4 space-y-2 text-xs text-foreground/80">
                      <p className="flex items-center gap-2">
                        <User className="size-3.5 text-primary" /> {UPCOMING_APPOINTMENT.doctor}
                      </p>
                      <p className="flex items-center gap-2">
                        <Stethoscope className="size-3.5 text-primary" /> Reason:{" "}
                        <strong className="text-foreground">{UPCOMING_APPOINTMENT.reason}</strong>
                      </p>
                    </div>
                    <Button
                      onClick={() =>
                        toast.success("Appointment details", {
                          description: `${UPCOMING_APPOINTMENT.code} • ${UPCOMING_APPOINTMENT.date} at ${UPCOMING_APPOINTMENT.time}`,
                        })
                      }
                      className="mt-5 w-full gradient-cta rounded-full py-3 text-xs font-semibold text-white shadow-soft hover:shadow-glow"
                    >
                      View Appointment
                    </Button>
                  </div>
                </section>

                {/* Contact / help */}
                <section className="rounded-3xl border border-border/80 bg-white p-6 shadow-card">
                  <h2 className="flex items-center gap-2 text-sm font-bold text-foreground">
                    <AlertCircle className="size-4 text-primary" /> Need Help?
                  </h2>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    Questions about your prescription or medications? Our care team is here to help.
                  </p>
                  <div className="mt-4 space-y-2">
                    <a
                      href={`tel:${CLINIC_CONTACT.phone.replace(/\s+/g, "")}`}
                      className="flex items-center gap-2 rounded-xl border border-border/80 px-4 py-3 text-xs font-semibold text-foreground transition-colors hover:bg-secondary"
                    >
                      <Phone className="size-3.5 text-primary" /> Call {CLINIC_CONTACT.phone}
                    </a>
                    <a
                      href={`mailto:${CLINIC_CONTACT.email}`}
                      className="flex items-center gap-2 rounded-xl border border-border/80 px-4 py-3 text-xs font-semibold text-foreground transition-colors hover:bg-secondary"
                    >
                      <Mail className="size-3.5 text-primary" /> {CLINIC_CONTACT.email}
                    </a>
                  </div>
                </section>
              </div>
            </div>
          </div>
        )}
      </div>

      {showDetail && (
        <PrescriptionDetailModal prescription={rx} onClose={() => setShowDetail(false)} />
      )}
    </PatientPortalLayout>
  );
}
