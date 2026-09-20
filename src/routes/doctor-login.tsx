import { useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import {
  UserCheck,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  AlertCircle,
  Loader2,
  Stethoscope,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/doctor-login")({
  component: DoctorLoginPage,
});

function DoctorLoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validateForm = (): boolean => {
    const errs: { email?: string; password?: string } = {};

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      errs.email = "Doctor email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      errs.email = "Please enter a valid email address";
    }

    if (!password) {
      errs.password = "Password is required";
    } else if (password.length < 6) {
      errs.password = "Password must be at least 6 characters";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (isLoading) return;
    setIsLoading(true);

    try {
      // 1. Authenticate with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password: password,
      });

      if (authError) {
        // Generic safe error message to prevent user enumeration
        throw new Error("Invalid email or password. Please verify your credentials.");
      }

      if (!authData.user) {
        throw new Error("Authentication failed. No user session returned.");
      }

      // 2. Link doctor profile to auth UID if not already linked
      try {
        await supabase.rpc("link_doctor_account");
      } catch (linkErr) {
        console.warn("link_doctor_account note:", linkErr);
      }

      // 3. Strictly verify that this authenticated user is an authorized Doctor in public.doctors table
      const { data: doctorData, error: docError } = await supabase
        .from("doctors")
        .select("id, name, specialization, qualification, status")
        .eq("user_id", authData.user.id)
        .maybeSingle();

      if (docError || !doctorData || doctorData.status !== "active") {
        // Sign out unauthorized session immediately
        await supabase.auth.signOut();
        throw new Error(
          "Access Denied: This account is not registered as an active doctor at SmileCare Dental Hospital.",
        );
      }

      // 4. Doctor authorized successfully!
      toast.success(`Welcome, ${doctorData.name}`, {
        description: `${doctorData.specialization} • Clinical Dashboard Access Granted`,
      });

      // 5. Navigate toward future doctor portal route
      // Note: The /doctor/dashboard route will be created in later steps
      try {
        navigate({ to: "/doctor/dashboard" as any });
      } catch {
        console.info("Redirecting toward /doctor/dashboard...");
      }
    } catch (err: any) {
      console.error("Doctor login error:", err);
      toast.error("Login Failed", {
        description: err.message || "Unable to sign in. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground selection:bg-primary/20">
      <Navbar />

      <main className="flex flex-1 items-center justify-center py-12 md:py-20 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          {/* Top Clinical Badge */}
          <div className="text-center">
            <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary shadow-soft">
              <Stethoscope className="size-7" />
            </div>
            <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary">
              <ShieldCheck className="size-3.5" /> Doctor Portal Access
            </span>
            <h1 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl text-foreground">
              Doctor Sign In
            </h1>
            <p className="mt-1.5 text-xs text-muted-foreground">
              Access today's appointments, patient consultation records, and clinical decision
              support.
            </p>
          </div>

          {/* Login Card */}
          <div className="mt-8 rounded-3xl border border-border/80 bg-card p-7 sm:p-9 shadow-card">
            <form onSubmit={handleLogin} className="space-y-5" noValidate>
              {/* Doctor Email Field */}
              <div>
                <label className="block text-xs font-bold text-foreground">
                  Doctor Hospital Email <span className="text-destructive">*</span>
                </label>
                <div className="relative mt-1.5">
                  <Mail className="absolute top-3 left-3.5 size-4 text-muted-foreground" />
                  <input
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors({ ...errors, email: "" });
                    }}
                    placeholder="anaya@smilecare.com"
                    className={cn(
                      "w-full rounded-2xl border bg-background pl-10 pr-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 transition-all",
                      errors.email
                        ? "border-destructive focus:ring-destructive/30"
                        : "border-border focus:border-primary focus:ring-primary/20",
                    )}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1.5 flex items-center gap-1 text-xs text-destructive">
                    <AlertCircle className="size-3.5" /> {errors.email}
                  </p>
                )}
              </div>

              {/* Password Field with Show/Hide Toggle */}
              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-foreground">
                    Password <span className="text-destructive">*</span>
                  </label>
                </div>
                <div className="relative mt-1.5">
                  <Lock className="absolute top-3 left-3.5 size-4 text-muted-foreground" />
                  <input
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) setErrors({ ...errors, password: "" });
                    }}
                    placeholder="••••••••"
                    className={cn(
                      "w-full rounded-2xl border bg-background pl-10 pr-11 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 transition-all",
                      errors.password
                        ? "border-destructive focus:ring-destructive/30"
                        : "border-border focus:border-primary focus:ring-primary/20",
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute top-2.5 right-3 text-muted-foreground hover:text-foreground p-1 rounded-lg focus:outline-none"
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

              {/* Sign In Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="gradient-cta w-full rounded-full py-3.5 text-sm font-semibold text-white shadow-soft hover:shadow-glow cursor-pointer transition-all mt-6"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="size-4 animate-spin" /> Verifying Credentials...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Sign In to Dashboard <ArrowRight className="size-4" />
                  </span>
                )}
              </Button>
            </form>

            {/* Security Notice */}
            <div className="mt-6 rounded-2xl bg-secondary/40 p-3.5 text-center text-[0.72rem] text-muted-foreground border border-border/40">
              <p className="font-semibold text-foreground">Authorized Clinical Personnel Only</p>
              <p className="mt-0.5">
                Protected healthcare portal compliant with patient privacy standards.
              </p>
            </div>
          </div>

          {/* Return to Public Website */}
          <div className="mt-6 text-center space-y-2">
            <Link
              to="/doctor/register"
              className="inline-flex items-center justify-center gap-1 rounded-full gradient-cta px-5 py-2 text-xs font-semibold text-white shadow-soft hover:shadow-glow transition-all"
            >
              <UserCheck className="size-3.5" /> Register as a Doctor
            </Link>
            <div>
              <Link
                to="/"
                className="inline-block text-xs text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1"
              >
                ← Return to SmileCare Website
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
