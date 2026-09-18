import { useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import {
  Stethoscope,
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  UserRound,
  GraduationCap,
  Briefcase,
  BadgeCheck,
  Phone,
  AlertCircle,
  Loader2,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/doctor/register")({
  component: DoctorRegisterPage,
});

type FieldErrors = Partial<Record<keyof DoctorFormFields, string>>;
type DoctorFormFields = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  qualification: string;
  specialization: string;
  experience: string;
  registrationNumber: string;
  phone: string;
  bio: string;
};

function DoctorRegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState<DoctorFormFields>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    qualification: "",
    specialization: "",
    experience: "",
    registrationNumber: "",
    phone: "",
    bio: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});

  const set = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const validate = (): boolean => {
    const errs: FieldErrors = {};

    if (!form.name.trim() || form.name.trim().length < 2)
      errs.name = "Enter the doctor's full name";
    if (!form.email.trim()) errs.email = "Hospital email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
      errs.email = "Enter a valid email address";
    if (!form.password) errs.password = "Password is required";
    else if (form.password.length < 6) errs.password = "Password must be at least 6 characters";
    if (form.confirmPassword !== form.password) errs.confirmPassword = "Passwords do not match";
    if (form.qualification.trim().length < 2)
      errs.qualification = "Enter qualification (e.g. BDS, MDS)";
    if (!form.specialization.trim()) errs.specialization = "Enter a specialization";

    const expNum = parseInt(form.experience, 10);
    if (!form.experience) errs.experience = "Years of experience is required";
    else if (isNaN(expNum) || expNum < 0 || expNum > 60)
      errs.experience = "Enter valid years (0-60)";

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (isLoading) return;
    setIsLoading(true);

    try {
      // 1. Create the auth account (publishable key allows self sign-up)
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });

      if (signUpError) {
        throw new Error(
          signUpError.message.includes("already")
            ? "An account already exists for this email."
            : signUpError.message,
        );
      }

      if (!signUpData.user) {
        throw new Error("Account creation failed. Please try again.");
      }

      // 2. Create the linked doctor profile
      const { error: profileError } = await supabase.rpc("register_doctor_profile", {
        p_name: form.name.trim(),
        p_qualification: form.qualification.trim(),
        p_specialization: form.specialization.trim(),
        p_experience_years: parseInt(form.experience, 10) || 0,
        p_registration_number: form.registrationNumber.trim(),
        p_phone: form.phone.trim(),
        p_bio: form.bio.trim(),
      });

      if (profileError) {
        console.error("Profile creation error:", profileError);
        // Account was created but profile failed; still inform user to try login
        toast.warning("Account created, but profile setup needs attention.");
      }

      // Sign out the session so the doctor logs in cleanly
      await supabase.auth.signOut();

      toast.success("Doctor account registered!", {
        description: `Welcome, ${form.name.trim()}. You can now sign in to the dashboard.`,
      });

      navigate({ to: "/doctor-login" });
    } catch (err) {
      console.error("Doctor registration error:", err);
      toast.error("Registration failed", {
        description: (err as Error)?.message || "Unable to register. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const inputCls = (field: keyof DoctorFormFields) =>
    cn(
      "mt-1.5 w-full rounded-2xl border bg-background pl-10 pr-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 transition-all",
      errors[field]
        ? "border-destructive focus:ring-destructive/30"
        : "border-border focus:border-primary focus:ring-primary/20",
    );

  const plainInputCls = (field: keyof DoctorFormFields) =>
    cn(
      "mt-1.5 w-full rounded-2xl border bg-background px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 transition-all",
      errors[field]
        ? "border-destructive focus:ring-destructive/30"
        : "border-border focus:border-primary focus:ring-primary/20",
    );

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground selection:bg-primary/20">
      <Navbar />

      <main className="flex flex-1 items-start justify-center py-12 md:py-16 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-2xl">
          {/* Header */}
          <div className="text-center">
            <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary shadow-soft">
              <Stethoscope className="size-7" />
            </div>
            <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary">
              <ShieldCheck className="size-3.5" /> Doctor Account Registration
            </span>
            <h1 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl text-foreground">
              Join the SmileCare Clinical Team
            </h1>
            <p className="mt-1.5 text-xs text-muted-foreground">
              Create your doctor account to access the clinical dashboard, manage availability, and
              handle patient consultations.
            </p>
          </div>

          {/* Form Card */}
          <div className="mt-8 rounded-3xl border border-border/80 bg-card p-6 sm:p-9 shadow-card">
            <form onSubmit={handleRegister} className="space-y-5" noValidate>
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-foreground">
                  Full Name <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <User className="absolute top-4 left-3.5 size-4 text-muted-foreground" />
                  <input
                    type="text"
                    autoComplete="name"
                    value={form.name}
                    onChange={(e) => set("name", e.target.value)}
                    placeholder="Dr. Priya Sharma"
                    className={inputCls("name")}
                  />
                </div>
                {errors.name && (
                  <p className="mt-1.5 flex items-center gap-1 text-xs text-destructive">
                    <AlertCircle className="size-3.5" /> {errors.name}
                  </p>
                )}
              </div>

              {/* Email + Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-foreground">
                    Hospital Email <span className="text-destructive">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute top-4 left-3.5 size-4 text-muted-foreground" />
                    <input
                      type="email"
                      autoComplete="email"
                      value={form.email}
                      onChange={(e) => set("email", e.target.value)}
                      placeholder="doctor@smilecare.com"
                      className={inputCls("email")}
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1.5 flex items-center gap-1 text-xs text-destructive">
                      <AlertCircle className="size-3.5" /> {errors.email}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground">
                    Password <span className="text-destructive">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute top-4 left-3.5 size-4 text-muted-foreground" />
                    <input
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      value={form.password}
                      onChange={(e) => set("password", e.target.value)}
                      placeholder="Min. 6 characters"
                      className={cn(inputCls("password"), "pr-11")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute top-4 right-3 text-muted-foreground hover:text-foreground p-1 rounded-lg focus:outline-none"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1.5 flex items-center gap-1 text-xs text-destructive">
                      <AlertCircle className="size-3.5" /> {errors.password}
                    </p>
                  )}
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-bold text-foreground">
                  Confirm Password <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute top-4 left-3.5 size-4 text-muted-foreground" />
                  <input
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={form.confirmPassword}
                    onChange={(e) => set("confirmPassword", e.target.value)}
                    placeholder="Re-enter your password"
                    className={inputCls("confirmPassword")}
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1.5 flex items-center gap-1 text-xs text-destructive">
                    <AlertCircle className="size-3.5" /> {errors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Qualification + Specialization */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-foreground">
                    Qualification <span className="text-destructive">*</span>
                  </label>
                  <div className="relative">
                    <GraduationCap className="absolute top-4 left-3.5 size-4 text-muted-foreground" />
                    <input
                      type="text"
                      value={form.qualification}
                      onChange={(e) => set("qualification", e.target.value)}
                      placeholder="BDS, MDS"
                      className={inputCls("qualification")}
                    />
                  </div>
                  {errors.qualification && (
                    <p className="mt-1.5 flex items-center gap-1 text-xs text-destructive">
                      <AlertCircle className="size-3.5" /> {errors.qualification}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground">
                    Specialization <span className="text-destructive">*</span>
                  </label>
                  <div className="relative">
                    <Briefcase className="absolute top-4 left-3.5 size-4 text-muted-foreground" />
                    <input
                      type="text"
                      value={form.specialization}
                      onChange={(e) => set("specialization", e.target.value)}
                      placeholder="e.g. Orthodontist"
                      className={inputCls("specialization")}
                    />
                  </div>
                  {errors.specialization && (
                    <p className="mt-1.5 flex items-center gap-1 text-xs text-destructive">
                      <AlertCircle className="size-3.5" /> {errors.specialization}
                    </p>
                  )}
                </div>
              </div>

              {/* Experience + Registration Number */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-foreground">
                    Years of Experience <span className="text-destructive">*</span>
                  </label>
                  <div className="relative">
                    <UserRound className="absolute top-4 left-3.5 size-4 text-muted-foreground" />
                    <input
                      type="number"
                      min={0}
                      max={60}
                      value={form.experience}
                      onChange={(e) => set("experience", e.target.value)}
                      placeholder="e.g. 8"
                      className={inputCls("experience")}
                    />
                  </div>
                  {errors.experience && (
                    <p className="mt-1.5 flex items-center gap-1 text-xs text-destructive">
                      <AlertCircle className="size-3.5" /> {errors.experience}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground">
                    Registration Number
                  </label>
                  <div className="relative">
                    <BadgeCheck className="absolute top-4 left-3.5 size-4 text-muted-foreground" />
                    <input
                      type="text"
                      value={form.registrationNumber}
                      onChange={(e) => set("registrationNumber", e.target.value)}
                      placeholder="e.g. DCI-2018-4471"
                      className={inputCls("registrationNumber")}
                    />
                  </div>
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-bold text-foreground">Contact Phone</label>
                <div className="relative">
                  <Phone className="absolute top-4 left-3.5 size-4 text-muted-foreground" />
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => set("phone", e.target.value)}
                    placeholder="+91 98765 43210"
                    className={inputCls("phone")}
                  />
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-xs font-bold text-foreground">Professional Bio</label>
                <div className="relative">
                  <FileText className="absolute top-4 left-3.5 size-4 text-muted-foreground" />
                  <textarea
                    rows={2}
                    value={form.bio}
                    onChange={(e) => set("bio", e.target.value)}
                    placeholder="Briefly describe your clinical focus and patient approach (optional)..."
                    className={cn(plainInputCls("bio"), "resize-none pl-10")}
                  />
                </div>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                disabled={isLoading}
                className="gradient-cta w-full rounded-full py-3.5 text-sm font-semibold text-white shadow-soft hover:shadow-glow cursor-pointer transition-all"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="size-4 animate-spin" /> Creating Account...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Create Doctor Account <ArrowRight className="size-4" />
                  </span>
                )}
              </Button>
            </form>

            {/* Already have account */}
            <div className="mt-6 text-center">
              <Link
                to="/doctor-login"
                className="text-xs text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1"
              >
                <ArrowLeft className="size-3.5" /> Already registered? Sign in instead
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
