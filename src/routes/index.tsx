import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Calendar,
  ArrowRight,
  CheckCircle2,
  Star,
  Phone,
  Mail,
  MapPin,
  Clock,
  Sparkles,
  ShieldCheck,
  Award,
  ChevronRight,
  Smile,
} from "lucide-react";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { GradientLink } from "@/components/ui/gradient-button";
import {
  CLINIC,
  SERVICES,
  TRUST_FEATURES,
  TECHNOLOGIES,
  TESTIMONIALS,
  STATS,
  DOCTORS,
  GALLERY,
  GALLERY_CATEGORIES,
} from "@/lib/site-data";
import heroDental from "@/assets/hero-dental.jpg";
import advancedCare from "@/assets/advanced-care.jpg";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  const [selectedGalleryCategory, setSelectedGalleryCategory] = useState("All");

  const filteredGallery =
    selectedGalleryCategory === "All"
      ? GALLERY
      : GALLERY.filter((item) => item.category === selectedGalleryCategory);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground selection:bg-primary/20">
      {/* Site Header */}
      <Navbar />

      <main className="flex-1">
        {/* ============================================================ */}
        {/* SECTION 1: HERO SECTION                                      */}
        {/* ============================================================ */}
        <section className="relative overflow-hidden bg-gradient-to-b from-secondary/40 via-background to-background py-12 md:py-20 lg:py-24">
          {/* Subtle decorative background glow */}
          <div
            className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl"
            aria-hidden="true"
          />

          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-8">
              {/* Hero Left Content */}
              <div className="flex flex-col items-center text-center lg:col-span-6 lg:items-start lg:text-left">
                {/* Eyebrow */}
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-bold tracking-wider text-primary uppercase shadow-xs">
                  <Sparkles className="size-3.5" />
                  <span>YOUR SMILE, OUR PASSION</span>
                </div>

                {/* Headline */}
                <h1 className="mt-5 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
                  Advanced Dental Care for a{" "}
                  <span className="text-gradient">Healthier, Brighter Smile</span>
                </h1>

                {/* Supporting Description */}
                <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                  Experience compassionate dental care powered by modern technology, experienced
                  specialists, and a patient-first approach designed for your complete comfort.
                </p>

                {/* CTAs */}
                <div className="mt-8 flex flex-col gap-3.5 sm:flex-row sm:items-center">
                  <GradientLink
                    to="/appointment"
                    className="inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 text-base font-semibold shadow-soft hover:shadow-glow"
                  >
                    <Calendar className="size-5" />
                    Book Appointment
                  </GradientLink>
                  <Link
                    to="/"
                    hash="services"
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-border/90 bg-background px-7 py-4 text-base font-semibold text-foreground shadow-xs transition-all hover:bg-secondary hover:border-border"
                  >
                    Explore Services
                    <ArrowRight className="size-4" />
                  </Link>
                </div>

                {/* Trust Highlights */}
                <div className="mt-10 grid grid-cols-3 gap-4 border-t border-border/60 pt-6 text-left">
                  <div>
                    <p className="text-2xl font-extrabold text-foreground">10+</p>
                    <p className="text-xs text-muted-foreground">Specialist Doctors</p>
                  </div>
                  <div>
                    <p className="text-2xl font-extrabold text-foreground">2K+</p>
                    <p className="text-xs text-muted-foreground">Happy Smiles</p>
                  </div>
                  <div>
                    <p className="text-2xl font-extrabold text-foreground">100%</p>
                    <p className="text-xs text-muted-foreground">Sterile & Safe</p>
                  </div>
                </div>
              </div>

              {/* Hero Right Visual with Floating Cards */}
              <div className="relative mx-auto w-full max-w-md lg:col-span-6 lg:max-w-none">
                <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-card shadow-card">
                  <img
                    src={heroDental}
                    alt="SmileCare dental surgeon consulting comfortably with a patient"
                    className="h-[380px] w-full object-cover sm:h-[480px] lg:h-[520px]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                </div>

                {/* Floating Badge 1: 2K+ Happy Smiles */}
                <div className="absolute -bottom-6 left-4 sm:-bottom-6 sm:left-6 rounded-2xl border border-border/80 bg-background/95 p-4 shadow-card backdrop-blur-md animate-fade-up">
                  <div className="flex items-center gap-3">
                    <div className="grid size-11 place-items-center rounded-xl bg-success/15 text-success">
                      <Smile className="size-6" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground">
                        Patient's Choice
                      </p>
                      <p className="text-sm font-extrabold text-foreground">2K+ Happy Smiles</p>
                    </div>
                  </div>
                </div>

                {/* Floating Badge 2: Experienced Doctors */}
                <div className="hidden sm:flex absolute -top-4 -right-4 rounded-2xl border border-border/80 bg-background/95 p-3.5 shadow-card backdrop-blur-md">
                  <div className="flex items-center gap-2.5">
                    <div className="grid size-9 place-items-center rounded-lg gradient-cta text-white">
                      <Award className="size-5" />
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-extrabold text-foreground">
                        Experienced Specialists
                      </p>
                      <p className="text-[0.68rem] text-muted-foreground">Certified Dental Team</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* SECTION 2: TRUST FEATURES                                    */}
        {/* ============================================================ */}
        <section className="border-y border-border/60 bg-card py-10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {TRUST_FEATURES.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={index}
                    className="flex items-start gap-4 rounded-2xl border border-border/60 bg-secondary/30 p-5 transition-transform hover:-translate-y-0.5"
                  >
                    <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="size-6" />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-foreground">{feature.title}</h2>
                      <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                        {feature.text}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* SECTION 3: DENTAL SERVICES                                   */}
        {/* ============================================================ */}
        <section id="services" className="py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-primary">
                Comprehensive Treatments
              </span>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
                Complete Care for Every Smile
              </h2>
              <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                Comprehensive dental treatments designed around your comfort, long-term oral health,
                and bright aesthetic confidence.
              </p>
            </div>

            <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {SERVICES.map((service) => {
                const Icon = service.icon;
                return (
                  <div
                    key={service.slug}
                    className="group relative flex flex-col justify-between rounded-3xl border border-border/80 bg-card p-6 shadow-xs transition-all hover:border-primary/40 hover:shadow-card hover:-translate-y-1"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <div
                          className={cn(
                            "grid size-12 place-items-center rounded-2xl text-foreground",
                            service.tint,
                          )}
                        >
                          <Icon className="size-6 text-primary" />
                        </div>
                        <span className="text-xs font-semibold text-muted-foreground group-hover:text-primary transition-colors">
                          Learn More →
                        </span>
                      </div>

                      <h3 className="mt-5 text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                        {service.name}
                      </h3>
                      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                        {service.description}
                      </p>

                      <div className="mt-4 space-y-1.5 border-t border-border/50 pt-3.5">
                        {service.highlights.map((highlight, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-2 text-xs text-foreground/80"
                          >
                            <CheckCircle2 className="size-3.5 text-primary shrink-0" />
                            <span>{highlight}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-border/40">
                      <Link
                        to="/appointment"
                        className="inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-secondary/80 py-2.5 text-xs font-semibold text-foreground transition-colors hover:bg-primary hover:text-white"
                      >
                        Book for {service.name}
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* SECTION 4: ADVANCED CARE, EXCEPTIONAL EXPERIENCE             */}
        {/* ============================================================ */}
        <section className="relative overflow-hidden py-16 text-white md:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="relative overflow-hidden rounded-3xl gradient-blue p-8 sm:p-12 lg:p-16 shadow-card">
              <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
                {/* Left Text */}
                <div className="lg:col-span-7">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-white backdrop-blur-sm">
                    State-of-the-art Dentistry
                  </span>
                  <h2 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl text-white">
                    Advanced Care,
                    <br />
                    Exceptional Experience
                  </h2>
                  <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/85 sm:text-base">
                    We combine advanced digital dental diagnostics with a gentle, patient-first
                    touch to ensure comfortable, effective, and lasting smile transformations.
                  </p>

                  <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="flex items-start gap-3 rounded-2xl bg-white/10 p-4 backdrop-blur-xs">
                      <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-white/20">
                        <Sparkles className="size-5 text-white" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">Digital Diagnostics</h4>
                        <p className="mt-1 text-xs text-white/75">
                          Low-radiation 3D imaging & intraoral digital scans.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 rounded-2xl bg-white/10 p-4 backdrop-blur-xs">
                      <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-white/20">
                        <Smile className="size-5 text-white" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">Pain-Free Protocol</h4>
                        <p className="mt-1 text-xs text-white/75">
                          Comfort-focused anesthesia and gentle techniques.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 rounded-2xl bg-white/10 p-4 backdrop-blur-xs">
                      <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-white/20">
                        <ShieldCheck className="size-5 text-white" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">Sterile Environment</h4>
                        <p className="mt-1 text-xs text-white/75">
                          Hospital-grade autoclaving & sanitized operatory.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 rounded-2xl bg-white/10 p-4 backdrop-blur-xs">
                      <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-white/20">
                        <Award className="size-5 text-white" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">Friendly Specialists</h4>
                        <p className="mt-1 text-xs text-white/75">
                          Personalized treatment plans tailored for you.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8">
                    <GradientLink
                      to="/appointment"
                      className="inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold shadow-soft"
                    >
                      <Calendar className="size-4" />
                      Schedule a Consultation
                    </GradientLink>
                  </div>
                </div>

                {/* Right Visual */}
                <div className="relative lg:col-span-5">
                  <div className="overflow-hidden rounded-2xl border border-white/20 shadow-2xl">
                    <img
                      src={advancedCare}
                      alt="Modern dental surgery room and advanced equipment"
                      className="h-[300px] w-full object-cover sm:h-[380px]"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* SECTION 5: MEET OUR DOCTORS                                  */}
        {/* ============================================================ */}
        <section id="doctors" className="py-16 md:py-24 bg-secondary/20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-primary">
                Experienced Dental Team
              </span>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
                Meet Our Dental Specialists
              </h2>
              <p className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
                Our board-certified dentists bring decades of specialized expertise, precision, and
                genuine care to every treatment.
              </p>
            </div>

            <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {DOCTORS.map((doctor) => (
                <div
                  key={doctor.id}
                  className="group flex flex-col justify-between overflow-hidden rounded-3xl border border-border/80 bg-card shadow-xs transition-all hover:border-primary/40 hover:shadow-card hover:-translate-y-1"
                >
                  <div>
                    {/* Doctor Image Container */}
                    <div className="relative h-64 w-full overflow-hidden bg-secondary">
                      <img
                        src={doctor.image}
                        alt={doctor.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute top-3 right-3 rounded-full bg-background/90 px-3 py-1 text-[0.7rem] font-bold text-foreground backdrop-blur-md shadow-xs">
                        {doctor.qualification}
                      </div>
                    </div>

                    {/* Doctor Details */}
                    <div className="p-6">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-primary">
                          {doctor.specialization}
                        </span>
                        <span className="text-xs text-muted-foreground font-medium">
                          {doctor.experience}
                        </span>
                      </div>
                      <h3 className="mt-2 text-xl font-extrabold text-foreground">{doctor.name}</h3>
                      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                        {doctor.bio}
                      </p>
                      <p className="mt-3 text-[0.75rem] text-muted-foreground">
                        <span className="font-semibold text-foreground">Available:</span>{" "}
                        {doctor.availability}
                      </p>
                    </div>
                  </div>

                  {/* Doctor Card Action */}
                  <div className="border-t border-border/60 p-6 pt-0">
                    <GradientLink
                      to="/appointment"
                      className="inline-flex w-full items-center justify-center gap-2 rounded-full py-2.5 text-xs font-semibold"
                    >
                      <Calendar className="size-3.5" />
                      Book with {doctor.name.split(" ")[1]}
                    </GradientLink>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* SECTION 6: ABOUT US & CLINIC STATS                           */}
        {/* ============================================================ */}
        <section id="about" className="py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
              <div className="lg:col-span-6">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-primary">
                  About SmileCare
                </span>
                <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
                  Dedicated to Excellence in Oral Healthcare
                </h2>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
                  Established with a vision to deliver world-class dental healthcare, SmileCare
                  Dental Hospital brings together experienced specialists, cutting-edge technology,
                  and a warm, patient-centric environment.
                </p>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
                  Whether you need a routine checkup, orthodontic alignment, dental implants, or
                  emergency treatment, we prioritize your long-term wellness with personalized care
                  plans.
                </p>

                <div className="mt-8 flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <div className="grid size-6 place-items-center rounded-full bg-primary/10 text-primary">
                      <CheckCircle2 className="size-4" />
                    </div>
                    <span className="text-sm font-semibold text-foreground">
                      International sterilization & hygiene protocols
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="grid size-6 place-items-center rounded-full bg-primary/10 text-primary">
                      <CheckCircle2 className="size-4" />
                    </div>
                    <span className="text-sm font-semibold text-foreground">
                      Digital 3D imaging & impression-free scanners
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="grid size-6 place-items-center rounded-full bg-primary/10 text-primary">
                      <CheckCircle2 className="size-4" />
                    </div>
                    <span className="text-sm font-semibold text-foreground">
                      Transparent consultation & clinical decision support
                    </span>
                  </div>
                </div>
              </div>

              {/* Statistics Grid */}
              <div className="lg:col-span-6">
                <div className="grid grid-cols-2 gap-4 sm:gap-6">
                  {STATS.map((stat, i) => (
                    <div
                      key={i}
                      className="rounded-3xl border border-border/80 bg-secondary/30 p-6 text-center shadow-xs"
                    >
                      <p className="text-4xl font-extrabold text-gradient sm:text-5xl">
                        {stat.value}
                      </p>
                      <p className="mt-2 text-xs font-bold text-foreground uppercase tracking-wider sm:text-sm">
                        {stat.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* SECTION 7: MODERN TECHNOLOGY                                 */}
        {/* ============================================================ */}
        <section className="border-y border-border/60 bg-secondary/20 py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-primary">
                Modern Equipment
              </span>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
                Advanced Clinical Technology
              </h2>
              <p className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
                We invest in state-of-the-art dental equipment to maximize precision, minimize
                treatment duration, and guarantee pain-free experiences.
              </p>
            </div>

            <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {TECHNOLOGIES.map((tech, idx) => {
                const Icon = tech.icon;
                return (
                  <div
                    key={idx}
                    className="flex items-start gap-4 rounded-2xl border border-border/80 bg-card p-6 shadow-xs transition-transform hover:-translate-y-1 hover:border-primary/40"
                  >
                    <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary">
                      <Icon className="size-6" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-foreground">{tech.name}</h3>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                        {tech.text}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* SECTION 8: PATIENT TESTIMONIALS                              */}
        {/* ============================================================ */}
        <section className="py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-primary">
                Real Patient Stories
              </span>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
                What Our Patients Say
              </h2>
              <p className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
                Read authentic feedback from patients who trusted SmileCare for their dental
                treatments and smile makeovers.
              </p>
            </div>

            <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {TESTIMONIALS.map((t, idx) => (
                <div
                  key={idx}
                  className="flex flex-col justify-between rounded-3xl border border-border/80 bg-card p-6 shadow-xs"
                >
                  <div>
                    {/* 5 Stars */}
                    <div className="flex items-center gap-1 text-amber-500">
                      {[...Array(t.rating)].map((_, i) => (
                        <Star key={i} className="size-4 fill-amber-400" />
                      ))}
                    </div>
                    <p className="mt-4 text-xs italic leading-relaxed text-muted-foreground">
                      "{t.text}"
                    </p>
                  </div>

                  <div className="mt-6 border-t border-border/50 pt-4">
                    <p className="text-sm font-bold text-foreground">{t.name}</p>
                    <p className="text-xs text-primary font-medium">{t.treatment}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* SECTION 9: GALLERY PREVIEW                                   */}
        {/* ============================================================ */}
        <section id="gallery" className="border-t border-border/60 bg-secondary/20 py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-primary">
                Clinic & Facilities
              </span>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
                Hospital Gallery
              </h2>
              <p className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
                Take a look inside our clean, modern operatory, patient lounge, diagnostic
                equipment, and dedicated team.
              </p>
            </div>

            {/* Gallery Category Filter Buttons */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
              {GALLERY_CATEGORIES.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setSelectedGalleryCategory(category)}
                  className={cn(
                    "rounded-full px-4 py-2 text-xs font-semibold transition-all cursor-pointer",
                    selectedGalleryCategory === category
                      ? "gradient-cta text-white shadow-soft"
                      : "border border-border/80 bg-background text-muted-foreground hover:bg-secondary",
                  )}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Gallery Image Grid */}
            <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {filteredGallery.map((img, idx) => (
                <div
                  key={idx}
                  className="group relative h-64 overflow-hidden rounded-3xl border border-border/80 bg-card shadow-xs transition-all hover:shadow-card hover:-translate-y-1"
                >
                  <img
                    src={img.src}
                    alt={img.alt}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <span className="rounded-full bg-primary/80 px-2.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider">
                      {img.category}
                    </span>
                    <p className="mt-1.5 text-xs font-medium leading-tight">{img.alt}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* SECTION 10: CONTACT & WORKING HOURS                          */}
        {/* ============================================================ */}
        <section id="contact" className="py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
              {/* Contact Info & Hours */}
              <div className="lg:col-span-5">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-primary">
                  Get in Touch
                </span>
                <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
                  Contact & Clinic Hours
                </h2>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                  Have a question or dental emergency? Reach out to our hospital front desk
                  directly.
                </p>

                <div className="mt-8 space-y-4">
                  <div className="flex items-start gap-4 rounded-2xl border border-border/80 bg-secondary/20 p-4">
                    <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                      <MapPin className="size-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-foreground">Clinic Address</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{CLINIC.address}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 rounded-2xl border border-border/80 bg-secondary/20 p-4">
                    <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                      <Phone className="size-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-foreground">Phone Number</p>
                      <a
                        href={`tel:${CLINIC.phone.replace(/\s+/g, "")}`}
                        className="mt-0.5 text-xs text-primary font-semibold hover:underline"
                      >
                        {CLINIC.phone}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 rounded-2xl border border-border/80 bg-secondary/20 p-4">
                    <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                      <Mail className="size-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-foreground">Email Address</p>
                      <a
                        href={`mailto:${CLINIC.email}`}
                        className="mt-0.5 text-xs text-primary font-semibold hover:underline"
                      >
                        {CLINIC.email}
                      </a>
                    </div>
                  </div>
                </div>

                {/* Working Hours */}
                <div className="mt-6 rounded-2xl border border-border/80 bg-card p-5 shadow-xs">
                  <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                    <Clock className="size-4 text-primary" />
                    Hospital Timings
                  </div>
                  <ul className="mt-3 space-y-2 text-xs text-muted-foreground">
                    {CLINIC.hours.map((h, i) => (
                      <li
                        key={i}
                        className="flex justify-between border-b border-border/40 pb-1.5 last:border-0"
                      >
                        <span className="font-semibold text-foreground">{h.day}</span>
                        <span>{h.time}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Contact Message Card */}
              <div className="lg:col-span-7">
                <div className="rounded-3xl border border-border/80 bg-card p-8 shadow-card">
                  <h3 className="text-xl font-bold text-foreground">Send Us a Message</h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Fill in the form below and our team will get back to you promptly.
                  </p>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      alert("Thank you for your message! Our team will contact you shortly.");
                    }}
                    className="mt-6 space-y-4"
                  >
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-xs font-bold text-foreground">Your Name</label>
                        <input
                          type="text"
                          required
                          placeholder="Rahul Mehta"
                          className="mt-1.5 w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-foreground">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          required
                          placeholder="+91 98765 43210"
                          className="mt-1.5 w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-foreground">
                        Email Address
                      </label>
                      <input
                        type="email"
                        placeholder="rahul@example.com"
                        className="mt-1.5 w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-foreground">
                        How can we help?
                      </label>
                      <textarea
                        rows={4}
                        required
                        placeholder="Describe your inquiry or dental concern..."
                        className="mt-1.5 w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="gradient-cta flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-xs font-semibold text-white shadow-soft hover:shadow-glow cursor-pointer transition-all"
                    >
                      Send Message
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Site Footer */}
      <Footer />
    </div>
  );
}
