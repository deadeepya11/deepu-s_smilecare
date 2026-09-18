import { Printer, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

type PrescriptionActionsProps = {
  onPrint: () => void;
  onDownload: () => void;
};

export function PrescriptionActions({ onPrint, onDownload }: PrescriptionActionsProps) {
  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <Button
        onClick={onDownload}
        variant="outline"
        className="rounded-full text-xs font-semibold border-primary/20 text-primary hover:bg-primary/5 hover:border-primary/40 h-9 cursor-pointer"
        aria-label="Download prescription as PDF"
      >
        <Download className="size-3.5 mr-1.5" />
        Download PDF
      </Button>
      <Button
        onClick={onPrint}
        className="gradient-cta rounded-full text-xs font-semibold text-white shadow-soft h-9 cursor-pointer"
        aria-label="Print prescription"
      >
        <Printer className="size-3.5 mr-1.5" />
        Print Prescription
      </Button>
    </div>
  );
}
