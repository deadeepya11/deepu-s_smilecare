import {
  FileText,
  CheckCircle2,
  User,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { PortalDoctor, PortalPrescription } from "./portal-mock-data";

type PrescriptionHeaderProps = {
  prescription: PortalPrescription;
  doctor: PortalDoctor;
};

export function PrescriptionHeader({ prescription, doctor }: PrescriptionHeaderProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-card">
      {/* Background watermark */}
      <div className="absolute top-0 right-0 p-8 opacity-[0.04] pointer-events-none" aria-hidden="true">
        <FileText className="size-32" />
      </div>

      <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        {/* Left — Title & status */}
        <div className="space-y-2">
          <div className="flex items-center gap-2.5 flex-wrap">
            <Badge className="bg-success/15 text-success border-success/30 font-semibold text-[0.65rem] uppercase tracking-wider px-2.5 py-1 gap-1">
              <CheckCircle2 className="size-3" />
              {prescription.status}
            </Badge>
            <span className="text-[0.65rem] font-bold text-muted-foreground uppercase tracking-wider">
              {prescription.issued_date}
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Prescription
          </h2>

          <div className="flex items-center gap-2 text-sm text-muted-foreground pt-0.5">
            <span className="font-mono text-primary font-bold bg-primary/5 px-2 py-0.5 rounded-md">
              {prescription.code}
            </span>
            <span aria-hidden="true">·</span>
            <span>SmileCare Dental Hospital</span>
          </div>
        </div>

        {/* Right — Doctor card */}
        <div className="bg-secondary/30 border border-border/60 rounded-2xl p-4 flex items-center gap-4 w-full md:w-auto shrink-0">
          <div className="grid size-12 place-items-center rounded-xl bg-background border border-border shadow-xs text-primary">
            <User className="size-6" />
          </div>
          <div>
            <p className="text-[0.65rem] font-bold text-muted-foreground uppercase tracking-wider">
              Consulting Doctor
            </p>
            <p className="text-sm font-bold text-foreground">{doctor.name}</p>
            <p className="text-xs text-muted-foreground">
              {doctor.qualification} — {doctor.specialization}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
