import { Phone, Mail, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { CLINIC } from "@/lib/site-data";

export function PatientSupport() {
  return (
    <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-card space-y-4">
      <h3 className="text-sm font-bold text-foreground border-b border-border/60 pb-3 flex items-center gap-2">
        <Phone className="size-4 text-primary" />
        Need Help?
      </h3>
      <p className="text-xs text-muted-foreground leading-relaxed">
        Our SmileCare team is here to help.
      </p>
      <div className="space-y-2">
        <a
          href={`tel:${CLINIC.phone.replace(/\s+/g, "")}`}
          className="inline-flex w-full items-center gap-2 rounded-xl border border-border/80 px-4 py-3 text-xs font-semibold text-foreground transition-colors hover:bg-secondary cursor-pointer"
          aria-label={`Call SmileCare at ${CLINIC.phone}`}
        >
          <Phone className="size-3.5 text-primary shrink-0" />
          Call SmileCare
          <span className="ml-auto text-muted-foreground font-normal">{CLINIC.phone}</span>
        </a>
        <Link
          to="/appointment"
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl gradient-cta px-4 py-3 text-xs font-semibold text-white shadow-soft transition-all hover:shadow-glow cursor-pointer"
        >
          <Calendar className="size-3.5" />
          Book an Appointment
        </Link>
      </div>
    </div>
  );
}
