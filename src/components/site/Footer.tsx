import { Link } from "@tanstack/react-router";
import { MapPin, Phone, Mail, Clock, Calendar, ArrowRight, Shield, Heart } from "lucide-react";
import { Logo } from "@/components/site/Logo";
import { GradientLink } from "@/components/ui/gradient-button";
import { CLINIC, SERVICES } from "@/lib/site-data";

export function Footer() {
  return (
    <footer className="border-t border-border bg-gradient-to-b from-background to-secondary/30 text-foreground">
      {/* Pre-footer Appointment Banner */}
      <div className="border-b border-border/60 bg-secondary/40">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 py-10 sm:px-6 md:flex-row lg:px-8">
          <div className="max-w-xl text-center md:text-left">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <Heart className="size-3.5 fill-primary" /> Personalized Dental Care
            </span>
            <h3 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Ready for a healthier, brighter smile?
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Book a consultation with our experienced dental specialists today.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <GradientLink
              to="/appointment"
              className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold shadow-soft"
            >
              <Calendar className="size-4" />
              Book Appointment Online
            </GradientLink>
            <a
              href={`tel:${CLINIC.phone.replace(/\s+/g, "")}`}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
            >
              <Phone className="size-4 text-primary" />
              {CLINIC.phone}
            </a>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Logo />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
              {CLINIC.tagline} We combine advanced clinical technology with a gentle, compassionate
              approach to deliver pain-free, exceptional dental experiences.
            </p>

            <div className="mt-6 flex flex-col gap-2.5 text-xs text-muted-foreground">
              <div className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
                <span>{CLINIC.address}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="size-4 shrink-0 text-primary" />
                <a href={`tel:${CLINIC.phone.replace(/\s+/g, "")}`} className="hover:text-primary">
                  {CLINIC.phone}
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="size-4 shrink-0 text-primary" />
                <a href={`mailto:${CLINIC.email}`} className="hover:text-primary">
                  {CLINIC.email}
                </a>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-bold tracking-tight text-foreground">Quick Links</h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link to="/" className="text-muted-foreground transition-colors hover:text-primary">
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/"
                  hash="services"
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  Services
                </Link>
              </li>
              <li>
                <Link
                  to="/"
                  hash="doctors"
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  Dental Doctors
                </Link>
              </li>
              <li>
                <Link
                  to="/"
                  hash="about"
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  About Hospital
                </Link>
              </li>
              <li>
                <Link
                  to="/"
                  hash="gallery"
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  Clinic Gallery
                </Link>
              </li>
              <li>
                <Link
                  to="/"
                  hash="contact"
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  to="/patient/dashboard"
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  Patient Portal
                </Link>
              </li>
              <li>
                <Link to="/doctor-login" className="font-medium text-primary hover:underline">
                  Doctor Login Portal →
                </Link>
              </li>
            </ul>
          </div>

          {/* Dental Services */}
          <div>
            <h4 className="text-sm font-bold tracking-tight text-foreground">Dental Services</h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              {SERVICES.map((service) => (
                <li key={service.slug}>
                  <Link
                    to="/"
                    hash="services"
                    className="flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-primary"
                  >
                    <ArrowRight className="size-3 opacity-60" />
                    {service.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Working Hours & Safety */}
          <div>
            <h4 className="text-sm font-bold tracking-tight text-foreground">Working Hours</h4>
            <ul className="mt-4 space-y-2 text-xs text-muted-foreground">
              {CLINIC.hours.map((h, i) => (
                <li
                  key={i}
                  className="flex flex-col border-b border-border/40 pb-1.5 last:border-0"
                >
                  <span className="font-semibold text-foreground">{h.day}</span>
                  <span>{h.time}</span>
                </li>
              ))}
            </ul>

            <div className="mt-6 rounded-2xl border border-border/80 bg-background/60 p-3 shadow-xs">
              <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                <Shield className="size-4 text-success" />
                Sterilized & Safe
              </div>
              <p className="mt-1 text-[0.7rem] text-muted-foreground">
                Class-B autoclaved instruments & international hygiene standards.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border/60 pt-6 text-xs text-muted-foreground sm:flex-row">
          <p>© 2026 {CLINIC.name}. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="text-muted-foreground/80">Demo / Clinical Review Required</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
