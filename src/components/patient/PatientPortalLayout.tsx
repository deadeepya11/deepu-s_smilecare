import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import {
  Bell,
  CalendarDays,
  ChevronDown,
  FileText,
  HeartPulse,
  LogOut,
  Menu,
  Phone,
  Pill,
  Settings,
  User,
  UserCircle2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { PATIENT, CLINIC_CONTACT } from "@/lib/patient-data";

const NAV_ITEMS = [
  { label: "Dashboard", to: "/patient/dashboard", icon: HeartPulse },
  { label: "Prescription", to: "/patient/prescription", icon: FileText },
] as const;

type NavItem = (typeof NAV_ITEMS)[number];

function isNavActive(pathname: string, to: NavItem["to"]) {
  return pathname === to;
}

function PatientNavLinks({
  pathname,
  onNavigate,
  className,
  itemClassName,
}: {
  pathname: string;
  onNavigate?: () => void;
  className?: string;
  itemClassName?: (item: NavItem, active: boolean) => string;
}) {
  return (
    <nav aria-label="Patient Portal Navigation" className={className}>
      {NAV_ITEMS.map((item) => {
        const active = isNavActive(pathname, item.to);
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors",
              itemClassName?.(item, active),
            )}
          >
            <item.icon className="size-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function PatientPortalHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const pathname = location.pathname;

  useEffect(() => {
    setMobileOpen(false);
    setProfileOpen(false);
  }, [pathname]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileOpen]);

  const initials = PATIENT.name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header className="patient-portal-header sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        {/* Brand */}
        <Link
          to="/patient/dashboard"
          className="group flex items-center gap-2.5"
          aria-label="SmileCare Patient Portal home"
        >
          <span className="grid size-10 place-items-center rounded-2xl gradient-cta shadow-soft transition-transform group-hover:scale-105">
            <svg viewBox="0 0 24 24" className="size-6" aria-hidden="true" fill="none">
              <path
                d="M12 6.2c1.6-1.4 3.2-2 4.7-1.8 2.3.3 3.6 2.2 3.6 4.9 0 3.3-1.3 6.6-2.4 8.6-.7 1.3-1.4 2-2.2 2-1 0-1.5-.7-2-2l-.9-2.4c-.2-.6-.6-.9-.8-.9s-.6.3-.8.9l-.9 2.4c-.5 1.3-1 2-2 2-.8 0-1.5-.7-2.2-2C4.9 15.9 3.7 12.6 3.7 9.3c0-2.7 1.3-4.6 3.6-4.9C8.8 4.2 10.4 4.8 12 6.2Z"
                fill="white"
                fillOpacity="0.95"
              />
              <path
                d="M9 11c.9.8 1.9 1.2 3 1.2S14.1 11.8 15 11"
                stroke="oklch(0.52 0.2 268)"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
            </svg>
          </span>
          <span className="leading-none">
            <span className="block text-lg font-extrabold tracking-tight text-foreground">
              SmileCare
            </span>
            <span className="block text-[0.6rem] font-semibold tracking-[0.22em] text-muted-foreground">
              DENTAL HOSPITAL
            </span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-1 md:flex">
          <PatientNavLinks
            pathname={pathname}
            itemClassName={(item, active) =>
              active
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            }
          />
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Notification */}
          <button
            type="button"
            onClick={() =>
              toast.info("No new notifications", {
                description: "You're all caught up.",
              })
            }
            className="relative grid size-9 place-items-center rounded-full border border-border/70 bg-background text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Notifications"
          >
            <Bell className="size-4" />
            <span
              className="absolute right-1.5 top-1.5 size-2 rounded-full bg-destructive"
              aria-hidden="true"
            />
          </button>

          {/* Public website */}
          <Link
            to="/"
            className="hidden rounded-full border border-border/70 bg-background px-3.5 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground lg:inline-flex"
          >
            Public Website
          </Link>

          {/* Profile dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              type="button"
              onClick={() => setProfileOpen((o) => !o)}
              className="flex items-center gap-2 rounded-full border border-border/70 bg-background py-1 pl-1 pr-2 transition-colors hover:bg-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-haspopup="menu"
              aria-expanded={profileOpen}
              aria-label="Account menu"
            >
              <span className="grid size-8 place-items-center rounded-full bg-gradient-to-br from-blue-600 to-purple-500 text-xs font-bold text-white">
                {initials}
              </span>
              <span className="hidden text-left sm:block">
                <span className="block text-xs font-bold leading-tight text-foreground">
                  {PATIENT.name}
                </span>
                <span className="block text-[0.62rem] leading-tight text-muted-foreground">
                  {PATIENT.id}
                </span>
              </span>
              <ChevronDown
                className={cn(
                  "size-3.5 text-muted-foreground transition-transform",
                  profileOpen && "rotate-180",
                )}
              />
            </button>

            {profileOpen && (
              <div
                role="menu"
                className="absolute right-0 top-full mt-2 w-60 animate-fade-up rounded-2xl border border-border/80 bg-card p-2 shadow-card"
              >
                <div className="rounded-xl bg-secondary/40 px-3 py-2.5">
                  <p className="text-sm font-bold text-foreground">{PATIENT.name}</p>
                  <p className="text-xs text-muted-foreground">Patient • {PATIENT.id}</p>
                </div>
                <div className="my-1.5 h-px bg-border/70" role="separator" />
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => setProfileOpen(false)}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-semibold text-foreground transition-colors hover:bg-secondary"
                >
                  <UserCircle2 className="size-4 text-primary" /> My Profile
                </button>
                <Link
                  to="/patient/dashboard"
                  role="menuitem"
                  onClick={() => setProfileOpen(false)}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-semibold text-foreground transition-colors hover:bg-secondary"
                >
                  <CalendarDays className="size-4 text-primary" /> My Appointments
                </Link>
                <Link
                  to="/patient/prescription"
                  role="menuitem"
                  onClick={() => setProfileOpen(false)}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-semibold text-foreground transition-colors hover:bg-secondary"
                >
                  <Pill className="size-4 text-primary" /> My Prescriptions
                </Link>
                <Link
                  to="/"
                  role="menuitem"
                  onClick={() => setProfileOpen(false)}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-semibold text-foreground transition-colors hover:bg-secondary"
                >
                  <Settings className="size-4 text-primary" /> Settings
                </Link>
                <div className="my-1.5 h-px bg-border/70" role="separator" />
                <Link
                  to="/"
                  role="menuitem"
                  onClick={() => {
                    setProfileOpen(false);
                    toast.success("Signed out (demo)");
                  }}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-semibold text-destructive transition-colors hover:bg-destructive/10"
                >
                  <LogOut className="size-4" /> Sign Out
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button
            type="button"
            onClick={() => setMobileOpen((o) => !o)}
            className="grid size-9 place-items-center rounded-full border border-border/70 text-muted-foreground transition-colors hover:bg-secondary md:hidden"
            aria-expanded={mobileOpen}
            aria-label="Toggle navigation"
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 top-[64px] z-40 flex flex-col bg-background/98 p-5 backdrop-blur-xl animate-fade-up md:hidden print:hidden">
          <div className="mb-4 flex items-center gap-3 rounded-2xl border border-border/80 bg-secondary/40 p-3">
            <span className="grid size-10 place-items-center rounded-full bg-gradient-to-br from-blue-600 to-purple-500 text-sm font-bold text-white">
              {initials}
            </span>
            <div>
              <p className="text-sm font-bold text-foreground">{PATIENT.name}</p>
              <p className="text-xs text-muted-foreground">Patient • {PATIENT.id}</p>
            </div>
          </div>

          <PatientNavLinks
            pathname={pathname}
            onNavigate={() => setMobileOpen(false)}
            className="flex flex-col gap-2"
            itemClassName={(item, active) =>
              cn(
                "rounded-xl px-4 py-3 text-base",
                active ? "bg-primary/10 text-primary" : "text-foreground hover:bg-secondary",
              )
            }
          />

          <div className="mt-auto space-y-3 border-t border-border/70 pt-5">
            <div className="flex items-center gap-2 rounded-2xl border border-border/80 p-3 text-xs text-muted-foreground">
              <Phone className="size-4 text-primary" />
              <span>
                Emergency: <strong className="text-foreground">{CLINIC_CONTACT.emergency}</strong>
              </span>
            </div>
            <Link
              to="/"
              className="flex w-full items-center justify-center gap-2 rounded-full border border-border/80 py-3 text-sm font-semibold text-foreground hover:bg-secondary"
            >
              <User className="size-4 text-primary" /> Public Website
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

export function PatientPortalLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFC] text-foreground selection:bg-primary/20 print:bg-white">
      <PatientPortalHeader />
      <main className="flex-1">{children}</main>
      <footer className="patient-portal-footer border-t border-border/70 bg-background py-6 print:hidden">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 text-center text-xs text-muted-foreground sm:flex-row sm:px-6 lg:px-8">
          <p>© 2026 SmileCare Dental Hospital. All rights reserved.</p>
          <p className="font-medium text-muted-foreground/80">Patient Portal • Mock Demo Data</p>
        </div>
      </footer>
    </div>
  );
}
