import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export function Logo({ className, inverted = false }: { className?: string; inverted?: boolean }) {
  return (
    <Link to="/" className={cn("group flex items-center gap-2.5", className)} aria-label="SmileCare Dental Hospital home">
      <span className="grid size-10 place-items-center rounded-2xl gradient-cta shadow-soft transition-transform group-hover:scale-105">
        <svg viewBox="0 0 24 24" className="size-6" aria-hidden="true" fill="none">
          <path
            d="M12 6.2c1.6-1.4 3.2-2 4.7-1.8 2.3.3 3.6 2.2 3.6 4.9 0 3.3-1.3 6.6-2.4 8.6-.7 1.3-1.4 2-2.2 2-1 0-1.5-.7-2-2l-.9-2.4c-.2-.6-.6-.9-.8-.9s-.6.3-.8.9l-.9 2.4c-.5 1.3-1 2-2 2-.8 0-1.5-.7-2.2-2C4.9 15.9 3.7 12.6 3.7 9.3c0-2.7 1.3-4.6 3.6-4.9C8.8 4.2 10.4 4.8 12 6.2Z"
            fill="white"
            fillOpacity="0.95"
          />
          <path d="M9 11c.9.8 1.9 1.2 3 1.2S14.1 11.8 15 11" stroke="oklch(0.52 0.2 268)" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      </span>
      <span className="leading-none">
        <span className={cn("block text-lg font-extrabold tracking-tight", inverted ? "text-white" : "text-foreground")}>
          SmileCare
        </span>
        <span className={cn("block text-[0.6rem] font-semibold tracking-[0.22em]", inverted ? "text-white/70" : "text-muted-foreground")}>
          DENTAL HOSPITAL
        </span>
      </span>
    </Link>
  );
}
