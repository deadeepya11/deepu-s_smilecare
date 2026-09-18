import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  CalendarClock,
  CalendarDays,
  Clock,
  Eye,
  FileText,
  HeartPulse,
  Phone,
  Pill,
  RefreshCw,
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
  PAST_APPOINTMENTS,
  PATIENT,
  PATIENT_DOCTOR,
  PATIENT_PRESCRIPTION,
  PRESCRIPTION_HISTORY,
  UPCOMING_APPOINTMENT,
  type PatientAppointment,
} from "@/lib/patient-data";

export const Route = createFileRoute("/patient/dashboard")({
  component: PatientDashboardPage,
});

function useMockLoading(delay = 650) {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), delay);
    return () => clearTimeout(t);
  }, [delay]);
  return loading;
}

function StatCard({
  icon,
  title,
  value,
  sub,
  tint,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  sub: string;
  tint: string;
}) {
  return (
    <div className="group rounded-3xl border border-border/80 bg-white p-5 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-soft">
      <div className="flex items-center justify-between">
        <span className={cn("grid size-11 place-items-center rounded-2xl", tint)}>{icon}</span>
        <ArrowRight className="size-4 text-muted-foreground/40 transition-transform group-hover:translate-x-0.5" />
      </div>
      <p className="mt-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
        {title}
      </p>
      <p className="mt-1 text-2xl font-extrabold tracking-tight text-foreground">{value}</p>
      <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>
    </div>
  );
}

function AppointmentCard({ appointment }: { appointment: PatientAppointment }) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 p-6 text-white shadow-soft">
      <div className="pointer-events-none absolute -right-10 -top-10 opacity-10" aria-hidden="true">
        <CalendarDays className="size-40" />
      </div>
      <div className="relative">
        <div className="flex items-center justify-between">
          <Badge className="border-white/25 bg-white/15 font-semibold text-white">
            {appointment.status}
          </Badge>
          <span className="font-mono text-xs text-white/80">{appointment.code}</span>
        </div>
        <h2 className="mt-4 text-xl font-extrabold">Upcoming Appointment</h2>
        <div className="mt-5 rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-xl bg-white/20">
              <User className="size-5" />
            </span>
            <div>
              <p className="text-sm font-bold">{appointment.doctor}</p>
              <p className="text-xs text-white/80">
                {appointment.qualification} • {appointment.specialization}
              </p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="size-4 text-white/70" />
              <span className="font-semibold">{appointment.date}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="size-4 text-white/70" />
              <span className="font-semibold">{appointment.time}</span>
            </div>
          </div>
          <p className="mt-3 border-t border-white/15 pt-3 text-xs text-white/80">
            {appointment.reason}
          </p>
        </div>
        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <Button
            onClick={() =>
              toast.info("Appointment details", {
                description: `${appointment.code} • ${appointment.service} • ${appointment.appointment_type}`,
              })
            }
            className="flex-1 rounded-full bg-white text-blue-700 shadow-soft hover:bg-blue-50 h-10 text-xs font-bold cursor-pointer"
          >
            <Eye className="size-3.5" /> View Details
          </Button>
          <Button
            onClick={() =>
              toast.success("Reschedule request sent", {
                description: "We'll confirm your new slot shortly.",
              })
            }
            variant="outline"
            className="flex-1 rounded-full border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white h-10 text-xs font-bold cursor-pointer"
          >
            <RefreshCw className="size-3.5" /> Reschedule
          </Button>
        </div>
      </div>
    </div>
  );
}

function PastAppointmentRow({ appointment }: { appointment: PatientAppointment }) {
  return (
    <li className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-background p-4 transition-colors hover:bg-secondary/40 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-secondary text-muted-foreground">
          <CalendarDays className="size-4" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-bold text-foreground">{appointment.service}</p>
          <p className="text-xs text-muted-foreground">
            {appointment.date} • {appointment.time} • {appointment.code}
          </p>
        </div>
      </div>
      <div className="flex items-center justify-between gap-3 sm:justify-end">
        <Badge className="bg-success/15 text-success border-success/30 font-semibold">
          {appointment.status}
        </Badge>
        <span className="text-xs text-muted-foreground">{appointment.doctor}</span>
      </div>
    </li>
  );
}

function PatientDashboardPage() {
  const loading = useMockLoading();
  const [viewRx, setViewRx] = useState<{ code: string } | null>(null);

  const activePrescription = PRESCRIPTION_HISTORY[0] ?? PATIENT_PRESCRIPTION;
  const viewableRx = viewRx
    ? (PRESCRIPTION_HISTORY.find((p) => p.code === viewRx.code) ?? PATIENT_PRESCRIPTION)
    : PATIENT_PRESCRIPTION;

  return (
    <PatientPortalLayout>
      <div className="patient-portal-page mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {loading ? (
          <div className="space-y-6 animate-pulse">
            <div className="h-24 rounded-3xl bg-card shadow-card" />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="h-40 rounded-3xl bg-card shadow-card" />
              ))}
            </div>
            <div className="h-72 rounded-3xl bg-card shadow-card" />
          </div>
        ) : (
          <div className="space-y-6 animate-fade-up">
            {/* Breadcrumb */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <Link
                to="/"
                className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-white px-3 py-1.5 font-semibold text-muted-foreground transition-colors hover:text-primary"
              >
                <ArrowLeft className="size-3.5" /> Public Site
              </Link>
              <span>/</span>
              <span className="font-semibold text-foreground">Patient Dashboard</span>
            </div>

            {/* Welcome */}
            <div className="rounded-3xl border border-border/80 bg-white p-6 shadow-card sm:p-8">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[0.65rem] font-bold uppercase tracking-wider text-primary">
                <HeartPulse className="size-3.5" /> Patient Portal
              </span>
              <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
                Good morning, {PATIENT.displayName} <span aria-hidden="true">👋</span>
              </h1>
              <p className="mt-1 max-w-xl text-sm text-muted-foreground">
                Manage your appointments, prescriptions and dental care in one place.
              </p>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                icon={<Calendar className="size-5 text-blue-600" />}
                tint="bg-blue-50"
                title="Upcoming Visit"
                value="Sep 18"
                sub="10:30 AM • Follow-up"
              />
              <StatCard
                icon={<Clock className="size-5 text-purple-600" />}
                tint="bg-purple-50"
                title="Last Visit"
                value="Sep 2"
                sub="New Consultation"
              />
              <StatCard
                icon={<Pill className="size-5 text-emerald-600" />}
                tint="bg-emerald-50"
                title="Active Prescription"
                value={activePrescription.code.replace("RX-2026-", "RX-")}
                sub={`${activePrescription.medicines.length} medicines`}
              />
              <StatCard
                icon={<CalendarClock className="size-5 text-amber-600" />}
                tint="bg-amber-50"
                title="Next Follow-up"
                value="Sep 18"
                sub="Post-treatment review"
              />
            </div>

            {/* Upcoming appointment */}
            <AppointmentCard appointment={UPCOMING_APPOINTMENT} />

            {/* Timeline */}
            <TreatmentTimeline />

            {/* Prescription history */}
            <section
              aria-label="Prescription History"
              className="rounded-3xl border border-border/80 bg-white p-6 shadow-card sm:p-7"
            >
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
                    <FileText className="size-5 text-primary" /> Prescription History
                  </h2>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Your past and current prescriptions.
                  </p>
                </div>
                <Link
                  to="/patient/prescription"
                  className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-background px-3.5 py-2 text-xs font-semibold text-primary transition-colors hover:bg-secondary"
                >
                  View Current <ArrowRight className="size-3.5" />
                </Link>
              </div>

              <ul className="grid gap-4 md:grid-cols-2">
                {PRESCRIPTION_HISTORY.map((rx) => (
                  <li
                    key={rx.code}
                    className="flex flex-col justify-between gap-4 rounded-2xl border border-border/80 bg-background p-4 shadow-xs transition-colors hover:border-primary/30"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-mono text-sm font-bold text-foreground">{rx.code}</p>
                        <p className="text-xs text-muted-foreground">Issued {rx.date_issued}</p>
                      </div>
                      <Badge className="bg-success/15 text-success border-success/30 font-semibold">
                        {rx.medicines.length} meds
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {PATIENT_DOCTOR.name} • {rx.problem}
                    </div>
                    <Button
                      onClick={() => setViewRx({ code: rx.code })}
                      variant="outline"
                      className="w-full rounded-full text-xs font-semibold border-primary/25 text-primary hover:bg-primary/5 h-9 gap-1.5"
                    >
                      <Eye className="size-3.5" /> View
                    </Button>
                  </li>
                ))}
              </ul>
            </section>

            {/* Past appointments */}
            <section
              aria-label="Past Appointments"
              className="rounded-3xl border border-border/80 bg-white p-6 shadow-card sm:p-7"
            >
              <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
                <CalendarDays className="size-5 text-primary" /> Past Appointments
              </h2>
              <ul className="mt-5 grid gap-3 md:grid-cols-2">
                {PAST_APPOINTMENTS.map((apt) => (
                  <PastAppointmentRow key={apt.id} appointment={apt} />
                ))}
              </ul>
            </section>

            {/* Care team / contact shortcut */}
            <section className="flex flex-col items-center justify-between gap-4 rounded-3xl border border-border/80 bg-white p-6 shadow-card sm:flex-row">
              <div className="flex items-center gap-3">
                <span className="grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 text-white">
                  <Stethoscope className="size-6" />
                </span>
                <div>
                  <p className="text-sm font-bold text-foreground">Your Dentist</p>
                  <p className="text-xs text-muted-foreground">
                    {PATIENT_DOCTOR.name} • {PATIENT_DOCTOR.specialization}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <a
                  href="tel:+919845011223"
                  className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-background px-4 py-2.5 text-xs font-semibold text-foreground transition-colors hover:bg-secondary"
                >
                  <Phone className="size-3.5 text-primary" /> Call
                </a>
                <Link
                  to="/appointment"
                  className="inline-flex items-center gap-1.5 rounded-full gradient-cta px-5 py-2.5 text-xs font-semibold text-white shadow-soft hover:shadow-glow"
                >
                  <Calendar className="size-3.5" /> Book Appointment
                </Link>
              </div>
            </section>
          </div>
        )}
      </div>

      {viewRx && (
        <PrescriptionDetailModal prescription={viewableRx} onClose={() => setViewRx(null)} />
      )}
    </PatientPortalLayout>
  );
}
