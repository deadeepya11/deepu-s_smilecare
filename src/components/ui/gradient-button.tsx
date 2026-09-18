import { Link } from "@tanstack/react-router";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60";

const variants = {
  gradient: "gradient-cta text-primary-foreground shadow-soft hover:shadow-glow hover:-translate-y-0.5",
  outline: "border border-border bg-background text-foreground hover:bg-secondary",
  ghostLight: "border border-white/30 bg-white/10 text-white hover:bg-white/20",
} as const;

type Variant = keyof typeof variants;

export function GradientButton({
  className,
  variant = "gradient",
  children,
  ...props
}: ComponentProps<"button"> & { variant?: Variant; children: ReactNode }) {
  return (
    <button className={cn(base, variants[variant], className)} {...props}>
      {children}
    </button>
  );
}

export function GradientLink({
  className,
  variant = "gradient",
  children,
  ...props
}: ComponentProps<typeof Link> & { variant?: Variant; children: ReactNode }) {
  return (
    <Link className={cn(base, variants[variant], className)} {...props}>
      {children}
    </Link>
  );
}
