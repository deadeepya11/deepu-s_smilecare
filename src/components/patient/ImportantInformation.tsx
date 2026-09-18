import { AlertCircle } from "lucide-react";

export function ImportantInformation() {
  const items = [
    "Take medicines exactly as prescribed.",
    "Do not change dosage without consulting your dentist.",
    "Complete the prescribed course unless your doctor advises otherwise.",
    "Contact SmileCare if you experience unexpected or severe symptoms.",
  ];

  return (
    <div className="rounded-3xl border border-amber-500/30 bg-amber-500/5 p-6 shadow-sm space-y-3">
      <h3 className="text-sm font-bold text-amber-700 dark:text-amber-500 flex items-center gap-1.5">
        <AlertCircle className="size-4" />
        Important Information
      </h3>
      <ul className="space-y-2 text-xs text-amber-900/80 dark:text-amber-400/80 list-disc list-outside ml-4 leading-relaxed">
        {items.map((item, idx) => (
          <li key={idx}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
