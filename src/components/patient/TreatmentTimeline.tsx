import { Calendar, Check, FileText, HeartPulse, Stethoscope, UserCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { PATIENT_TIMELINE, type TreatmentStep } from "@/lib/patient-data";

const STEP_ICONS: Record<string, typeof Calendar> = {
  booked: Calendar,
  consultation: Stethoscope,
  diagnosis: HeartPulse,
  prescription: FileText,
  followup: UserCheck,
};

function StepIcon({ step }: { step: TreatmentStep }) {
  const Icon = STEP_ICONS[step.key] ?? Calendar;
  return <Icon className="size-5" />;
}

export function TreatmentTimeline() {
  const steps = PATIENT_TIMELINE;
  const lastIndex = steps.length - 1;

  return (
    <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-card">
      <div className="mb-6">
        <h3 className="text-base font-bold text-foreground">Treatment Journey</h3>
        <p className="text-xs text-muted-foreground">
          A view of your care from booking to follow-up.
        </p>
      </div>

      {/* Horizontal timeline (desktop) */}
      <ol className="hidden items-start md:flex" aria-label="Treatment timeline">
        {steps.map((step, i) => {
          const isLast = i === lastIndex;
          const Icon = STEP_ICONS[step.key] ?? Calendar;
          return (
            <li key={step.key} className="relative flex flex-1 flex-col">
              {!isLast && (
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute left-[calc(50%+22px)] top-6 h-0.5 w-[calc(100%-44px)]",
                    step.status === "completed" ? "bg-primary/50" : "bg-border",
                  )}
                />
              )}
              <div className="flex flex-col items-center text-center">
                <span
                  className={cn(
                    "relative z-10 grid size-12 place-items-center rounded-full border transition-colors",
                    step.status === "completed" &&
                      "gradient-blue border-transparent text-white shadow-soft",
                    step.status === "active" &&
                      "border-primary bg-primary/10 text-primary ring-4 ring-primary/15",
                    step.status === "upcoming" &&
                      "border-border bg-background text-muted-foreground",
                  )}
                >
                  {step.status === "completed" ? (
                    <Check className="size-5" />
                  ) : (
                    <Icon className="size-5" />
                  )}
                </span>
                <span
                  className={cn(
                    "mt-3 text-xs font-bold",
                    step.status === "upcoming" ? "text-muted-foreground" : "text-foreground",
                  )}
                >
                  {step.label}
                </span>
                <span className="mt-0.5 text-[0.62rem] leading-snug text-muted-foreground">
                  {step.description}
                </span>
                <span className="mt-1 text-[0.62rem] font-mono font-semibold text-primary">
                  {step.date ?? "Scheduled"}
                </span>
              </div>
            </li>
          );
        })}
      </ol>

      {/* Vertical timeline (mobile/tablet) */}
      <ol className="space-y-0 md:hidden" aria-label="Treatment timeline">
        {steps.map((step, i) => {
          const isLast = i === lastIndex;
          const Icon = STEP_ICONS[step.key] ?? Calendar;
          return (
            <li key={step.key} className="relative flex gap-4">
              {!isLast && (
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute left-6 top-12 h-full w-0.5",
                    step.status === "completed" ? "bg-primary/40" : "bg-border",
                  )}
                />
              )}
              <span
                className={cn(
                  "relative z-10 grid size-12 shrink-0 place-items-center rounded-full border",
                  step.status === "completed" &&
                    "gradient-blue border-transparent text-white shadow-soft",
                  step.status === "active" &&
                    "border-primary bg-primary/10 text-primary ring-4 ring-primary/15",
                  step.status === "upcoming" && "border-border bg-background text-muted-foreground",
                )}
              >
                {step.status === "completed" ? (
                  <Check className="size-5" />
                ) : (
                  <Icon className="size-5" />
                )}
              </span>
              <div className="flex flex-1 flex-col justify-center pb-8">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-bold text-foreground">{step.label}</span>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-wide",
                      step.status === "completed" && "bg-success/15 text-success",
                      step.status === "active" && "bg-primary/15 text-primary",
                      step.status === "upcoming" && "bg-secondary text-muted-foreground",
                    )}
                  >
                    {step.status}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">{step.description}</p>
                <p className="mt-0.5 text-[0.68rem] font-mono font-semibold text-primary">
                  {step.date ?? "Scheduled"}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
