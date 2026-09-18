import { User, Hash, Calendar, Stethoscope } from "lucide-react";
import type { PortalPatient, PortalAppointment } from "./portal-mock-data";

type PatientInfoCardProps = {
  patient: PortalPatient;
  appointment: PortalAppointment;
};

function InfoRow({ icon, label, value, mono }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-border/70 bg-background p-3">
      <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-[0.62rem] font-bold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p className={`text-sm font-semibold text-foreground ${mono ? "font-mono" : ""}`}>
          {value}
        </p>
      </div>
    </div>
  );
}

export function PatientInfoCard({ patient, appointment }: PatientInfoCardProps) {
  return (
    <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-card space-y-4">
      <h3 className="text-sm font-bold text-foreground border-b border-border/60 pb-3 flex items-center gap-2">
        <User className="size-4 text-primary" />
        Patient Information
      </h3>

      <div className="space-y-3">
        <InfoRow
          icon={<User className="size-4" />}
          label="Patient Name"
          value={patient.name}
        />
        <InfoRow
          icon={<Hash className="size-4" />}
          label="Patient Code"
          value={patient.code}
          mono
        />

        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-xl border border-border/70 bg-background p-3">
            <p className="text-[0.62rem] font-bold uppercase tracking-wider text-muted-foreground">
              Age
            </p>
            <p className="text-sm font-semibold text-foreground">{patient.age}</p>
          </div>
          <div className="rounded-xl border border-border/70 bg-background p-3">
            <p className="text-[0.62rem] font-bold uppercase tracking-wider text-muted-foreground">
              Gender
            </p>
            <p className="text-sm font-semibold text-foreground">{patient.gender}</p>
          </div>
        </div>

        <div className="pt-2 border-t border-border/40 space-y-2">
          <InfoRow
            icon={<Calendar className="size-4" />}
            label="Appointment Date"
            value={appointment.date}
          />
          <InfoRow
            icon={<Stethoscope className="size-4" />}
            label="Appointment Code"
            value={appointment.code}
            mono
          />
        </div>
      </div>
    </div>
  );
}
