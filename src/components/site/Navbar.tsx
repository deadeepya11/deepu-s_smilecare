import { useState, useEffect } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { Menu, X, Calendar, PhoneCall } from "lucide-react";
import { Logo } from "@/components/site/Logo";
import { GradientLink } from "@/components/ui/gradient-button";
import { CLINIC } from "@/lib/site-data";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { name: "Home", to: "/" },
  { name: "Services", to: "/", hash: "services" },
  { name: "Doctors", to: "/", hash: "doctors" },
  { name: "Patient Portal", to: "/patient/dashboard" },
  { name: "About Us", to: "/", hash: "about" },
  { name: "Gallery", to: "/", hash: "gallery" },
  { name: "Contact", to: "/", hash: "contact" },
];

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Prevent background scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileMenuOpen]);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/85 backdrop-blur-md transition-all">
      {/* Top emergency / phone bar */}
      <div className="hidden border-b border-border/40 bg-secondary/50 px-4 py-1.5 text-xs text-muted-foreground sm:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="font-medium text-foreground">Dental Emergency?</span>
            <a
              href={`tel:${CLINIC.phone.replace(/\s+/g, "")}`}
              className="flex items-center gap-1 font-semibold text-primary hover:underline"
            >
              <PhoneCall className="size-3.5" />
              {CLINIC.phone}
            </a>
          </div>
          <div className="flex items-center gap-4">
            <span>Mon - Fri: 9:00 AM - 7:00 PM</span>
            <span className="text-border">|</span>
            <span>123 Smile Street, New Delhi</span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <Logo />
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden items-center gap-1 md:flex" aria-label="Main Navigation">
          {NAV_LINKS.map((link) => {
            const isActive = link.hash
              ? location.pathname === "/" && location.hash.replace(/^#/, "") === link.hash
              : location.pathname === link.to;
            return (
              <Link
                key={link.name}
                to={link.to}
                {...(link.hash ? { hash: link.hash } : {})}
                className={cn(
                  "rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors hover:text-primary",
                  isActive
                    ? "bg-secondary text-primary font-semibold"
                    : "text-muted-foreground hover:bg-secondary/60",
                )}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Desktop Action CTAs */}
        <div className="hidden items-center gap-3 md:flex">
          <GradientLink
            to="/appointment"
            className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-semibold shadow-soft"
          >
            <Calendar className="size-3.5" />
            Book Appointment
          </GradientLink>
        </div>

        {/* Mobile Hamburger Toggle Button */}
        <div className="flex items-center gap-2 md:hidden">
          <Link
            to="/appointment"
            className="rounded-full gradient-cta px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs"
          >
            Book
          </Link>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="inline-flex items-center justify-center rounded-xl p-2 text-foreground hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-primary"
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer / Slide-over Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 top-[57px] z-50 flex flex-col bg-background/98 p-6 backdrop-blur-xl md:hidden animate-fade-up">
          <nav className="flex flex-col gap-2" aria-label="Mobile Navigation">
            {NAV_LINKS.map((link) => {
              const isActive = link.hash
                ? location.pathname === "/" && location.hash.replace(/^#/, "") === link.hash
                : location.pathname === link.to;
              return (
                <Link
                  key={link.name}
                  to={link.to}
                  {...(link.hash ? { hash: link.hash } : {})}
                  className={cn(
                    "rounded-xl px-4 py-3 text-base font-medium transition-colors",
                    isActive
                      ? "bg-secondary text-primary font-semibold"
                      : "text-foreground hover:bg-secondary/60",
                  )}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          <div className="mt-8 flex flex-col gap-3 border-t border-border pt-6">
            <GradientLink
              to="/appointment"
              className="flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-sm font-semibold shadow-soft"
            >
              <Calendar className="size-4" />
              Book Appointment
            </GradientLink>
          </div>

          <div className="mt-auto border-t border-border/60 pt-4 text-xs text-muted-foreground">
            <p className="font-semibold text-foreground">{CLINIC.name}</p>
            <p className="mt-1">{CLINIC.address}</p>
            <p className="mt-1 font-medium text-primary">{CLINIC.phone}</p>
          </div>
        </div>
      )}
    </header>
  );
}
