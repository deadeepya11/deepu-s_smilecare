import { Stethoscope, Activity, AlertTriangle, MapPin, FileText } from "lucide-react";
import type { PortalClinicalSummary } from "./portal-mock-data";

type ClinicalSummaryCardProps = {
  summary: PortalClinicalSummary;
};

export function ClinicalSummaryCard({ summary }: ClinicalSummaryCardProps) {
  return (
    <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-card space-y-5">
      <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
        <Stethoscope className="size-5 text-primary" />
        Clinical Summary
      </h3>

      {/* Chief Complaint + Problem */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1 rounded-2xl bg-secondary/30 p-4 border border-border/50">
          <p className="text-[0.65rem] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Activity className="size-3" />
            Chief Complaint
          </p>
          <p className="text-sm font-semibold text-foreground">
            {summary.chief_complaint}
          </p>
        </div>
        <div className="space-y-1 rounded-2xl bg-secondary/30 p-4 border border-border/50">
          <p className="text-[0.65rem] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <AlertTriangle className="size-3" />
            Problem
          </p>
          <p className="text-sm font-semibold text-foreground">
            {summary.problem}
          </p>
        </div>
      </div>

      {/* Diagnosis */}
      <div className="space-y-1 rounded-2xl bg-secondary/30 p-4 border border-border/50">
        <p className="text-[0.65rem] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
          <FileText className="size-3" />
          Diagnosis
        </p>
        <p className="text-sm font-semibold text-foreground">
          {summary.diagnosis}
        </p>
      </div>

      {/* Affected Area + Pain Level */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1 rounded-2xl bg-secondary/30 p-4 border border-border/50">
          <p className="text-[0.65rem] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <MapPin className="size-3" />
            Affected Area
          </p>
          <p className="text-sm font-semibold text-foreground">
            {summary.affected_area}
          </p>
        </div>
        <div className="space-y-1 rounded-2xl bg-secondary/30 p-4 border border-border/50">
          <p className="text-[0.65rem] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Activity className="size-3" />
            Pain Level
          </p>
          <div className="flex items-center gap-3">
            <p className="text-sm font-semibold text-foreground">
              {summary.pain_level} / 10
            </p>
            <div className="flex-1 h-2 rounded-full bg-border overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-success via-warning to-destructive transition-all"
                style={{ width: `${(summary.pain_level / 10) * 100}%` }}
                role="progressbar"
                aria-valuenow={summary.pain_level}
                aria-valuemin={0}
                aria-valuemax={10}
                aria-label={`Pain level ${summary.pain_level} out of 10`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Doctor's Notes */}
      <div className="space-y-1 rounded-2xl bg-primary/5 p-4 border border-primary/10">
        <p className="text-[0.65rem] font-bold text-primary uppercase tracking-wider">
          Doctor&apos;s Notes
        </p>
        <p className="text-sm text-foreground/90 leading-relaxed">
          {summary.doctor_notes}
        </p>
      </div>
    </div>
  );
}
