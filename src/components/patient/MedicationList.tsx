import { Pill } from "lucide-react";
import { MedicationCard } from "./MedicationCard";
import type { PortalMedication } from "./portal-mock-data";

type MedicationListProps = {
  items: PortalMedication[];
};

export function MedicationList({ items }: MedicationListProps) {
  return (
    <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-card space-y-6">
      <div>
        <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
          <Pill className="size-5 text-primary" />
          Your Medications
        </h3>
        <p className="text-xs text-muted-foreground mt-1">
          Follow your doctor&apos;s instructions carefully.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {items.map((item, idx) => (
          <MedicationCard key={item.id} item={item} index={idx} />
        ))}
      </div>
    </div>
  );
}
