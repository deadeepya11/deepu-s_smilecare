import { Pill, CheckCircle2, Clock, Calendar, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { PortalMedication, PortalTimeBadge } from "./portal-mock-data";

type MedicationCardProps = {
  item: PortalMedication;
  index: number;
};

const TIME_BADGE_STYLES: Record<PortalTimeBadge, string> = {
  Morning: "bg-amber-500/10 text-amber-700 border-amber-500/20",
  Afternoon: "bg-sky-500/10 text-sky-700 border-sky-500/20",
  Night: "bg-indigo-500/10 text-indigo-700 border-indigo-500/20",
};

export function MedicationCard({ item, index }: MedicationCardProps) {
  return (
    <div className="rounded-2xl border border-border bg-background p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row gap-4 sm:items-start transition-shadow hover:shadow-soft group">
      {/* Pill icon */}
      <div className="grid size-12 place-items-center rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 text-primary shrink-0 group-hover:scale-105 transition-transform">
        <Pill className="size-6" />
      </div>

      {/* Main info */}
      <div className="flex-1 space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[0.6rem] font-bold text-muted-foreground">#{index + 1}</span>
          <h4 className="text-base font-bold text-foreground">{item.medicine_name}</h4>
          <Badge
            variant="outline"
            className="text-[0.65rem] font-semibold bg-background text-primary"
          >
            {item.strength}
          </Badge>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
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

        {/* Time-of-day badges */}
        {item.time_badges.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
            {item.time_badges.map((badge) => (
              <span
                key={badge}
                className={cn(
                  "inline-flex items-center rounded-full border px-2 py-0.5 text-[0.6rem] font-bold",
                  TIME_BADGE_STYLES[badge],
                )}
              >
                {badge}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="w-full sm:w-1/3 shrink-0 rounded-xl bg-secondary/40 p-3 text-xs border border-border/50">
        <p className="font-semibold text-foreground/80 flex items-start gap-1.5">
          <AlertCircle className="size-3.5 mt-0.5 text-amber-500 shrink-0" />
          <span>{item.instructions}</span>
        </p>
      </div>
    </div>
  );
}
