import { Calendar, CalendarClock, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";

type FollowUpCardProps = {
  followUpDate: string;
  onBackToPortal: () => void;
};

export function FollowUpCard({ followUpDate, onBackToPortal }: FollowUpCardProps) {
  return (
    <div className="rounded-3xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 p-6 shadow-card text-center space-y-4 relative overflow-hidden">
      {/* Background watermark */}
      <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none" aria-hidden="true">
        <Calendar className="size-16 text-primary" />
      </div>

      <div className="relative z-10">
        <div className="mx-auto grid size-10 place-items-center rounded-xl bg-background text-primary mb-3 shadow-xs">
          <CalendarClock className="size-5" />
        </div>

        <h3 className="text-sm font-bold text-foreground">Your Follow-Up</h3>

        <div className="my-3 py-2 border-y border-primary/10">
          <p className="text-xs text-muted-foreground mb-1">Recommended follow-up</p>
          <p className="text-xl font-extrabold text-primary">{followUpDate}</p>
        </div>

        <p className="text-xs text-foreground/80 leading-relaxed mb-5">
          Your doctor recommends a follow-up visit to monitor your recovery.
        </p>

        <div className="space-y-2">
          <Link
            to="/appointment"
            className="w-full inline-flex items-center justify-center rounded-xl gradient-cta py-3 text-xs font-semibold text-white shadow-soft hover:shadow-glow transition-all hover:scale-[1.01] active:scale-[0.99]"
          >
            <Calendar className="size-3.5 mr-1.5" />
            Book Follow-Up Appointment
          </Link>

          <Button
            variant="ghost"
            onClick={onBackToPortal}
            className="w-full rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-secondary/60 cursor-pointer"
          >
            <ArrowLeft className="size-3.5 mr-1.5" />
            Back to Portal
          </Button>
        </div>
      </div>
    </div>
  );
}
