import { useState } from "react";
import {
  Search,
  Loader2,
  HeartPulse,
  ShieldCheck,
  LockKeyhole,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";

type PatientPortalLandingProps = {
  onSubmit: (patientCode: string, appointmentCode: string) => void;
  isSearching: boolean;
};

function ToothIllustration() {
  return (
    <div className="relative size-48 sm:size-56 lg:size-64" aria-hidden="true">
      {/* Gradient circle background */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/15 via-primary-glow/10 to-brand-pink/10 blur-sm" />
      <div className="absolute inset-3 rounded-full bg-gradient-to-br from-primary/10 to-primary-glow/5 border border-primary/10" />

      {/* Tooth SVG */}
      <svg
        viewBox="0 0 120 140"
        fill="none"
        className="absolute inset-0 m-auto size-24 sm:size-28 lg:size-32 drop-shadow-lg"
      >
        {/* Tooth body */}
        <path
          d="M60 12C42 12 28 22 24 40C20 58 22 72 28 84C32 92 36 104 40 116C42 122 46 128 50 128C54 128 56 120 58 112C59 108 60 104 60 104C60 104 61 108 62 112C64 120 66 128 70 128C74 128 78 122 80 116C84 104 88 92 92 84C98 72 100 58 96 40C92 22 78 12 60 12Z"
          fill="url(#toothGradient)"
          stroke="url(#toothStroke)"
          strokeWidth="2"
        />
        {/* Tooth shine */}
        <ellipse cx="48" cy="38" rx="10" ry="12" fill="white" fillOpacity="0.25" />
        {/* Smile line */}
        <path
          d="M48 58C52 64 56 66 60 66C64 66 68 64 72 58"
          stroke="url(#toothStroke)"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
        <defs>
          <linearGradient id="toothGradient" x1="24" y1="12" x2="96" y2="128" gradientUnits="userSpaceOnUse">
            <stop stopColor="#818cf8" />
            <stop offset="0.5" stopColor="#a78bfa" />
            <stop offset="1" stopColor="#c084fc" />
          </linearGradient>
          <linearGradient id="toothStroke" x1="24" y1="12" x2="96" y2="128" gradientUnits="userSpaceOnUse">
            <stop stopColor="#6366f1" />
            <stop offset="1" stopColor="#a855f7" />
          </linearGradient>
        </defs>
      </svg>

      {/* Sparkle elements */}
      <div className="absolute top-4 right-6">
        <Sparkles className="size-4 text-primary/40 animate-pulse" />
      </div>
      <div className="absolute bottom-10 left-4">
        <Sparkles className="size-3 text-primary-glow/50 animate-pulse" style={{ animationDelay: "1s" }} />
      </div>
      <div className="absolute top-12 left-8">
        <div className="size-2 rounded-full bg-primary/20 animate-pulse" style={{ animationDelay: "0.5s" }} />
      </div>
    </div>
  );
}

export function PatientPortalLanding({ onSubmit, isSearching }: PatientPortalLandingProps) {
  const [patientCode, setPatientCode] = useState("");
  const [appointmentCode, setAppointmentCode] = useState("");
  const [errors, setErrors] = useState<{ patientCode?: string; appointmentCode?: string }>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: typeof errors = {};
    if (!patientCode.trim()) {
      newErrors.patientCode = "Patient code is required";
    }
    if (!appointmentCode.trim()) {
      newErrors.appointmentCode = "Appointment code is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    onSubmit(patientCode.trim(), appointmentCode.trim());
  };

  return (
    <div className="relative min-h-[calc(100vh-80px)] flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-secondary/30 via-background to-background overflow-hidden">
      {/* Background glows */}
      <div className="pointer-events-none absolute top-0 left-1/2 -z-10 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-primary/8 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 -z-10 h-[300px] w-[400px] rounded-full bg-primary-glow/5 blur-3xl" />

      {/* ================================================================= */}
      {/* HERO SECTION                                                      */}
      {/* ================================================================= */}
      <div className="w-full max-w-5xl mx-auto animate-fade-up">
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12 mb-12">
          {/* Left — Text */}
          <div className="flex-1 text-center lg:text-left space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-bold tracking-wider text-primary uppercase shadow-xs">
              <HeartPulse className="size-3.5" />
              <span>SmileCare Patient Portal</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground leading-[1.15]">
              Your Prescription,
              <br />
              <span className="text-gradient">Your Care, Simplified.</span>
            </h1>

            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-lg mx-auto lg:mx-0">
              Access your SmileCare prescription, medication instructions, clinical summary,
              and follow-up information securely in one place.
            </p>
          </div>

          {/* Right — Illustration */}
          <div className="shrink-0">
            <ToothIllustration />
          </div>
        </div>

        {/* ================================================================= */}
        {/* PRESCRIPTION ACCESS CARD                                         */}
        {/* ================================================================= */}
        <div className="w-full max-w-lg mx-auto rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-card relative">
          <div className="text-center mb-7 space-y-1.5">
            <h2 className="text-xl font-bold text-foreground">Find Your Prescription</h2>
            <p className="text-xs text-muted-foreground">
              Enter the details provided by SmileCare after your consultation.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5" role="form" aria-label="Prescription search">
            {/* Patient Code */}
            <div className="space-y-1.5">
              <label htmlFor="portal-patient-code" className="text-xs font-bold text-foreground">
                Patient Code
              </label>
              <input
                id="portal-patient-code"
                type="text"
                placeholder="PT-00001"
                value={patientCode}
                onChange={(e) => {
                  setPatientCode(e.target.value);
                  if (errors.patientCode) setErrors((prev) => ({ ...prev, patientCode: undefined }));
                }}
                aria-describedby={errors.patientCode ? "patient-code-error" : "patient-code-help"}
                aria-invalid={!!errors.patientCode}
                className="w-full rounded-2xl border bg-background px-4 py-3.5 text-sm text-foreground uppercase placeholder:normal-case focus:outline-none focus:ring-2 transition-all border-border focus:border-primary focus:ring-primary/20 data-[invalid=true]:border-destructive data-[invalid=true]:focus:ring-destructive/30"
                data-invalid={!!errors.patientCode}
                required
              />
              {errors.patientCode ? (
                <p id="patient-code-error" className="text-xs text-destructive flex items-center gap-1" role="alert">
                  <span className="size-1 rounded-full bg-destructive inline-block" />
                  {errors.patientCode}
                </p>
              ) : (
                <p id="patient-code-help" className="text-[0.65rem] text-muted-foreground">
                  e.g. PT-00001
                </p>
              )}
            </div>

            {/* Appointment Code */}
            <div className="space-y-1.5">
              <label htmlFor="portal-appointment-code" className="text-xs font-bold text-foreground">
                Appointment Code
              </label>
              <input
                id="portal-appointment-code"
                type="text"
                placeholder="SC-2026-00001"
                value={appointmentCode}
                onChange={(e) => {
                  setAppointmentCode(e.target.value);
                  if (errors.appointmentCode) setErrors((prev) => ({ ...prev, appointmentCode: undefined }));
                }}
                aria-describedby={errors.appointmentCode ? "appt-code-error" : "appt-code-help"}
                aria-invalid={!!errors.appointmentCode}
                className="w-full rounded-2xl border bg-background px-4 py-3.5 text-sm text-foreground uppercase placeholder:normal-case focus:outline-none focus:ring-2 transition-all border-border focus:border-primary focus:ring-primary/20 data-[invalid=true]:border-destructive data-[invalid=true]:focus:ring-destructive/30"
                data-invalid={!!errors.appointmentCode}
                required
              />
              {errors.appointmentCode ? (
                <p id="appt-code-error" className="text-xs text-destructive flex items-center gap-1" role="alert">
                  <span className="size-1 rounded-full bg-destructive inline-block" />
                  {errors.appointmentCode}
                </p>
              ) : (
                <p id="appt-code-help" className="text-[0.65rem] text-muted-foreground">
                  e.g. SC-2026-00001
                </p>
              )}
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={isSearching}
              className="w-full gradient-cta rounded-full py-4 text-sm font-semibold text-white shadow-soft transition-all hover:shadow-glow hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
              aria-label="View my prescription"
            >
              {isSearching ? (
                <>
                  <Loader2 className="size-4 animate-spin mr-2" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="size-4 mr-2" />
                  View My Prescription
                </>
              )}
            </Button>
          </form>

          {/* Helper text */}
          <p className="mt-5 text-center text-[0.65rem] text-muted-foreground leading-relaxed">
            Your patient and appointment codes can be found on your SmileCare appointment confirmation.
          </p>
        </div>

        {/* ================================================================= */}
        {/* TRUST / SECURITY SECTION                                          */}
        {/* ================================================================= */}
        <div className="mt-8 w-full max-w-lg mx-auto">
          <p className="text-center text-[0.65rem] font-semibold text-muted-foreground/80 uppercase tracking-wider mb-3">
            Your information is handled with care
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
            <TrustItem icon={<ShieldCheck className="size-4" />} label="Secure Access" />
            <TrustItem icon={<LockKeyhole className="size-4" />} label="Private Medical Information" />
            <TrustItem icon={<HeartPulse className="size-4" />} label="SmileCare Care Team" />
          </div>
        </div>
      </div>
    </div>
  );
}

function TrustItem({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <span className="grid size-7 place-items-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </span>
      <span className="font-medium">{label}</span>
    </div>
  );
}
