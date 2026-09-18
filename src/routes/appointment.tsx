import { useState, useEffect, useRef } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  Phone,
  Mail,
  Stethoscope,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Loader2,
  ShieldCheck,
  Sparkles,
  Copy,
  Check,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { supabase } from "@/integrations/supabase/client";
import {
  CLINIC,
  SERVICES,
  DOCTORS,
  TIME_SLOTS,
  APPOINTMENT_TYPES,
  type Doctor,
  type Service,
} from "@/lib/site-data";
import { cn } from "@/lib/utils";
import { fetchAvailableSlots } from "@/lib/availability";

export const Route = createFileRoute("/appointment")({
  component: AppointmentPage,
});

type FormState = {
  name: string;
  phone: string;
  email: string;
  age: string;
  gender: "Male" | "Female" | "Other" | "";
  service: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialization: string;
  date: Date | undefined;
  time: string;
  appointmentType: string;
  reason: string;
};

type BookingResult = {
  appointmentCode: string;
  patientCode: string;
  patientName: string;
  doctorName: string;
  doctorSpecialization: string;
  service: string;
  dateString: string;
  time: string;
  appointmentType: string;
};

function AppointmentPage() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState<BookingResult | null>(null);
  const [copied, setCopied] = useState(false);

  // Dynamic doctors from database with fallback to site-data
  const [dbDoctors, setDbDoctors] = useState<
    { id: string; name: string; specialization: string; qualification: string; email: string }[]
  >([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);

  // Availability-aware time slots
  const [availableSlots, setAvailableSlots] = useState<string[] | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Form State
  const [formData, setFormData] = useState<FormState>({
    name: "",
    phone: "",
    email: "",
    age: "",
    gender: "",
    service: SERVICES[0]?.name || "General Dentistry",
    doctorId: "",
    doctorName: "",
    doctorSpecialization: "",
    date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Default tomorrow
    time: TIME_SLOTS[0] || "09:30 AM",
    appointmentType: APPOINTMENT_TYPES[0] || "New Consultation",
    reason: "",
  });

  // Inline Validation Errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Track the current time selection so slot loading doesn't need it in its deps
  const selectedTimeRef = useRef(formData.time);
  useEffect(() => {
    selectedTimeRef.current = formData.time;
  }, [formData.time]);

  // Fetch real doctor UUIDs from Supabase
  useEffect(() => {
    async function loadDoctors() {
      try {
        const { data, error } = await supabase
          .from("doctors")
          .select("id, name, specialization, qualification, email")
          .eq("status", "active");

        if (error) {
          console.warn("Could not load doctors from DB, using defaults:", error.message);
        } else if (data && data.length > 0) {
          setDbDoctors(data);
          // Set initial doctor if not already selected
          const first = data[0];
          setFormData((prev) => ({
            ...prev,
            doctorId: prev.doctorId || first.id,
            doctorName: prev.doctorName || first.name,
            doctorSpecialization: prev.doctorSpecialization || first.specialization,
          }));
        }
      } catch (err) {
        console.error("Error fetching doctors:", err);
      } finally {
        setLoadingDoctors(false);
      }
    }

    loadDoctors();
  }, []);

  // Sync doctor choice with data
  const handleSelectDoctor = (doc: { id: string; name: string; specialization: string }) => {
    setFormData((prev) => ({
      ...prev,
      doctorId: doc.id,
      doctorName: doc.name,
      doctorSpecialization: doc.specialization,
    }));
    setErrors((prev) => ({ ...prev, doctorId: "" }));
  };

  // Fetch availability-aware time slots whenever doctor + date changes
  useEffect(() => {
    let active = true;

    async function loadSlots() {
      if (!formData.doctorId || !formData.date) {
        setAvailableSlots(null);
        return;
      }

      const y = formData.date.getFullYear();
      const m = String(formData.date.getMonth() + 1).padStart(2, "0");
      const d = String(formData.date.getDate()).padStart(2, "0");
      const dateStr = `${y}-${m}-${d}`;

      setLoadingSlots(true);
      try {
        const slots = await fetchAvailableSlots(formData.doctorId, dateStr);
        if (active) {
          setAvailableSlots(slots.length > 0 ? slots : null);
          // Auto-select the first available slot if the current selection isn't bookable
          if (slots.length > 0 && !slots.includes(selectedTimeRef.current)) {
            const firstSlot = slots[0]!;
            setFormData((prev) => {
              const next = { ...prev, time: firstSlot };
              setErrors((e) => ({ ...e, time: "" }));
              return next;
            });
          }
        }
      } catch (err) {
        console.warn("Failed to load slots:", err);
        if (active) setAvailableSlots(null);
      } finally {
        if (active) setLoadingSlots(false);
      }
    }

    loadSlots();
    return () => {
      active = false;
    };
  }, [formData.doctorId, formData.date]);

  // Validation Logic for Step 1
  const validateStep1 = (): boolean => {
    const errs: Record<string, string> = {};

    if (!formData.name.trim()) {
      errs.name = "Full name is required";
    } else if (formData.name.trim().length < 2) {
      errs.name = "Name must be at least 2 characters";
    }

    const phoneClean = formData.phone.replace(/[\s\-]/g, "");
    if (!phoneClean) {
      errs.phone = "Phone number is required";
    } else if (!/^[6-9]\d{9}$/.test(phoneClean) && !/^\+91[6-9]\d{9}$/.test(phoneClean)) {
      errs.phone = "Please enter a valid 10-digit Indian mobile number";
    }

    if (!formData.email.trim()) {
      errs.email = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errs.email = "Please enter a valid email address";
    }

    const ageNum = parseInt(formData.age, 10);
    if (!formData.age) {
      errs.age = "Age is required";
    } else if (isNaN(ageNum) || ageNum < 1 || ageNum > 120) {
      errs.age = "Please enter a valid age between 1 and 120";
    }

    if (!formData.gender) {
      errs.gender = "Please select a gender";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Validation Logic for Step 2
  const validateStep2 = (): boolean => {
    const errs: Record<string, string> = {};

    if (!formData.service) {
      errs.service = "Please select a service";
    }

    if (!formData.doctorId) {
      errs.doctorId = "Please select a doctor";
    }

    if (!formData.date) {
      errs.date = "Please select an appointment date";
    }

    if (!formData.time) {
      errs.time = "Please select a time slot";
    }

    if (!formData.appointmentType) {
      errs.appointmentType = "Please select appointment type";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Validation Logic for Step 3
  const validateStep3 = (): boolean => {
    const errs: Record<string, string> = {};

    if (!formData.reason.trim()) {
      errs.reason = "Please enter the reason for your visit or symptoms";
    } else if (formData.reason.trim().length < 5) {
      errs.reason = "Please provide a few more details regarding your visit (min 5 chars)";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
      window.scrollTo({ top: 180, behavior: "smooth" });
    } else if (step === 2 && validateStep2()) {
      setStep(3);
      window.scrollTo({ top: 180, behavior: "smooth" });
    }
  };

  const handleBack = () => {
    if (step === 2) setStep(1);
    if (step === 3) setStep(2);
    window.scrollTo({ top: 180, behavior: "smooth" });
  };

  // Final Form Submission to Supabase RPC
  const handleSubmitBooking = async () => {
    if (!validateStep1() || !validateStep2() || !validateStep3()) {
      toast.error("Please fill in all required fields before confirming.");
      return;
    }

    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      // Format Date to YYYY-MM-DD
      const dateObj = formData.date!;
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, "0");
      const day = String(dateObj.getDate()).padStart(2, "0");
      const dateString = `${year}-${month}-${day}`;

      const rpcPayload = {
        p_name: formData.name.trim(),
        p_phone: formData.phone.trim(),
        p_email: formData.email.trim(),
        p_age: parseInt(formData.age, 10),
        p_gender: formData.gender,
        p_doctor_id: formData.doctorId,
        p_service: formData.service,
        p_date: dateString,
        p_time: formData.time,
        p_type: formData.appointmentType,
        p_reason: formData.reason.trim(),
      };

      const { data, error } = await supabase.rpc("book_appointment", rpcPayload);

      if (error) {
        throw error;
      }

      if (data && data.length > 0) {
        const appointment = data[0];
        setBookingSuccess({
          appointmentCode: appointment.appointment_code,
          patientCode: appointment.patient_code,
          patientName: formData.name.trim(),
          doctorName: formData.doctorName || "Selected Specialist",
          doctorSpecialization: formData.doctorSpecialization || "Dental Specialist",
          service: formData.service,
          dateString: dateObj.toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
          time: formData.time,
          appointmentType: formData.appointmentType,
        });

        toast.success("Appointment booked successfully!", {
          description: `Your appointment code is ${appointment.appointment_code}`,
        });

        window.scrollTo({ top: 100, behavior: "smooth" });
      } else {
        throw new Error("No appointment code returned from server.");
      }
    } catch (err: any) {
      console.error("Booking failed:", err);
      toast.error("Failed to confirm appointment", {
        description: err.message || "Please check your details and try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.info("Appointment code copied to clipboard");
    setTimeout(() => setCopied(false), 2500);
  };

  const handleResetBooking = () => {
    setBookingSuccess(null);
    setStep(1);
    setFormData({
      name: "",
      phone: "",
      email: "",
      age: "",
      gender: "",
      service: SERVICES[0]?.name || "General Dentistry",
      doctorId: dbDoctors[0]?.id || "",
      doctorName: dbDoctors[0]?.name || "",
      doctorSpecialization: dbDoctors[0]?.specialization || "",
      date: new Date(Date.now() + 24 * 60 * 60 * 1000),
      time: TIME_SLOTS[0] || "09:30 AM",
      appointmentType: APPOINTMENT_TYPES[0] || "New Consultation",
      reason: "",
    });
    setErrors({});
  };

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Navbar />

      <main className="flex-1 py-10 md:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          {/* ============================================================ */}
          {/* SUCCESS SCREEN STATE                                         */}
          {/* ============================================================ */}
          {bookingSuccess ? (
            <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-10 shadow-card animate-fade-up">
              {/* Success Badge */}
              <div className="text-center">
                <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-success/15 text-success shadow-soft">
                  <CheckCircle2 className="size-10" />
                </div>
                <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-success/10 px-3 py-1 text-xs font-bold text-success uppercase tracking-wider">
                  Confirmed & Scheduled
                </span>
                <h1 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl text-foreground">
                  Appointment Confirmed
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Your appointment has been successfully recorded in the hospital system.
                </p>
              </div>

              {/* Codes Highlight Box */}
              <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex items-center justify-between rounded-2xl border border-primary/20 bg-primary/5 p-4">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Appointment ID
                    </p>
                    <p className="text-xl font-extrabold tracking-tight text-primary">
                      {bookingSuccess.appointmentCode}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopyCode(bookingSuccess.appointmentCode)}
                    className="h-8 gap-1.5 text-xs rounded-xl"
                  >
                    {copied ? (
                      <Check className="size-3.5 text-success" />
                    ) : (
                      <Copy className="size-3.5" />
                    )}
                    {copied ? "Copied" : "Copy"}
                  </Button>
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-border/80 bg-secondary/30 p-4">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Patient Code
                    </p>
                    <p className="text-xl font-extrabold tracking-tight text-foreground">
                      {bookingSuccess.patientCode}
                    </p>
                  </div>
                  <span className="rounded-full bg-secondary px-2.5 py-1 text-[0.7rem] font-bold text-muted-foreground">
                    Registered
                  </span>
                </div>
              </div>

              {/* Appointment Summary Details Card */}
              <div className="mt-6 rounded-2xl border border-border/80 bg-secondary/20 p-6 space-y-3.5 text-sm">
                <div className="flex justify-between border-b border-border/50 pb-2">
                  <span className="text-muted-foreground">Patient Name:</span>
                  <span className="font-semibold text-foreground">
                    {bookingSuccess.patientName}
                  </span>
                </div>
                <div className="flex justify-between border-b border-border/50 pb-2">
                  <span className="text-muted-foreground">Consulting Doctor:</span>
                  <span className="font-semibold text-foreground">
                    {bookingSuccess.doctorName} ({bookingSuccess.doctorSpecialization})
                  </span>
                </div>
                <div className="flex justify-between border-b border-border/50 pb-2">
                  <span className="text-muted-foreground">Treatment / Service:</span>
                  <span className="font-semibold text-foreground">{bookingSuccess.service}</span>
                </div>
                <div className="flex justify-between border-b border-border/50 pb-2">
                  <span className="text-muted-foreground">Date & Time:</span>
                  <span className="font-semibold text-foreground">
                    {bookingSuccess.dateString} at {bookingSuccess.time}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Appointment Type:</span>
                  <span className="font-semibold text-primary">
                    {bookingSuccess.appointmentType}
                  </span>
                </div>
              </div>

              {/* Instructions Notice */}
              <div className="mt-6 flex items-start gap-3 rounded-2xl bg-secondary/60 p-4 text-xs text-muted-foreground">
                <ShieldCheck className="mt-0.5 size-5 shrink-0 text-success" />
                <p>
                  <strong className="text-foreground">Clinical Instructions:</strong> Please arrive
                  10 minutes prior to your scheduled time slot. If you have previous dental X-rays
                  or medical prescriptions, please bring them along.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Link
                  to="/"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-background px-6 py-3 text-sm font-semibold text-foreground hover:bg-secondary"
                >
                  Return to Home
                </Link>
                <Button
                  onClick={handleResetBooking}
                  className="gradient-cta rounded-full px-7 py-3 text-sm font-semibold text-white shadow-soft"
                >
                  Book Another Appointment
                </Button>
              </div>
            </div>
          ) : (
            /* ============================================================ */
            /* THREE-STEP WIZARD FORM                                       */
            /* ============================================================ */
            <div>
              {/* Title & Subtitle */}
              <div className="text-center">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-primary">
                  <Sparkles className="size-3.5" /> Book Online Consultation
                </span>
                <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground">
                  Schedule Your Dental Visit
                </h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  Complete the 3 quick steps below to confirm your appointment with our specialists.
                </p>
              </div>

              {/* Progress Indicator Steps */}
              <div className="mt-8 mb-10">
                <div className="flex items-center justify-between max-w-lg mx-auto">
                  {/* Step 1 Pill */}
                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        "grid size-8 place-items-center rounded-full text-xs font-bold transition-all",
                        step >= 1
                          ? "gradient-cta text-white shadow-xs"
                          : "bg-secondary text-muted-foreground",
                      )}
                    >
                      1
                    </div>
                    <span
                      className={cn(
                        "hidden sm:inline text-xs font-semibold",
                        step === 1 ? "text-primary" : "text-muted-foreground",
                      )}
                    >
                      Patient Info
                    </span>
                  </div>

                  <div
                    className={cn(
                      "h-0.5 flex-1 mx-2 transition-colors",
                      step >= 2 ? "bg-primary" : "bg-border",
                    )}
                  />

                  {/* Step 2 Pill */}
                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        "grid size-8 place-items-center rounded-full text-xs font-bold transition-all",
                        step >= 2
                          ? "gradient-cta text-white shadow-xs"
                          : "bg-secondary text-muted-foreground",
                      )}
                    >
                      2
                    </div>
                    <span
                      className={cn(
                        "hidden sm:inline text-xs font-semibold",
                        step === 2 ? "text-primary" : "text-muted-foreground",
                      )}
                    >
                      Appointment
                    </span>
                  </div>

                  <div
                    className={cn(
                      "h-0.5 flex-1 mx-2 transition-colors",
                      step >= 3 ? "bg-primary" : "bg-border",
                    )}
                  />

                  {/* Step 3 Pill */}
                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        "grid size-8 place-items-center rounded-full text-xs font-bold transition-all",
                        step >= 3
                          ? "gradient-cta text-white shadow-xs"
                          : "bg-secondary text-muted-foreground",
                      )}
                    >
                      3
                    </div>
                    <span
                      className={cn(
                        "hidden sm:inline text-xs font-semibold",
                        step === 3 ? "text-primary" : "text-muted-foreground",
                      )}
                    >
                      Review & Confirm
                    </span>
                  </div>
                </div>
              </div>

              {/* Form Card Container */}
              <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-10 shadow-card">
                {/* -------------------------------------------------------- */}
                {/* STEP 1: PATIENT INFORMATION                             */}
                {/* -------------------------------------------------------- */}
                {step === 1 && (
                  <div className="space-y-6 animate-fade-up">
                    <div>
                      <h2 className="text-xl font-bold text-foreground">
                        Step 1: Patient Information
                      </h2>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Please provide your contact details so our reception can verify your
                        appointment.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                      {/* Full Name */}
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold text-foreground">
                          Full Name <span className="text-destructive">*</span>
                        </label>
                        <div className="relative mt-1.5">
                          <User className="absolute top-3 left-3.5 size-4 text-muted-foreground" />
                          <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => {
                              setFormData({ ...formData, name: e.target.value });
                              if (errors.name) setErrors({ ...errors, name: "" });
                            }}
                            placeholder="Rahul Mehta"
                            className={cn(
                              "w-full rounded-2xl border bg-background pl-10 pr-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2",
                              errors.name
                                ? "border-destructive focus:ring-destructive/30"
                                : "border-border focus:border-primary focus:ring-primary/20",
                            )}
                          />
                        </div>
                        {errors.name && (
                          <p className="mt-1.5 flex items-center gap-1 text-xs text-destructive">
                            <AlertCircle className="size-3.5" /> {errors.name}
                          </p>
                        )}
                      </div>

                      {/* Phone Number */}
                      <div>
                        <label className="block text-xs font-bold text-foreground">
                          Phone Number <span className="text-destructive">*</span>
                        </label>
                        <div className="relative mt-1.5">
                          <Phone className="absolute top-3 left-3.5 size-4 text-muted-foreground" />
                          <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => {
                              setFormData({ ...formData, phone: e.target.value });
                              if (errors.phone) setErrors({ ...errors, phone: "" });
                            }}
                            placeholder="9876543210"
                            className={cn(
                              "w-full rounded-2xl border bg-background pl-10 pr-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2",
                              errors.phone
                                ? "border-destructive focus:ring-destructive/30"
                                : "border-border focus:border-primary focus:ring-primary/20",
                            )}
                          />
                        </div>
                        {errors.phone && (
                          <p className="mt-1.5 flex items-center gap-1 text-xs text-destructive">
                            <AlertCircle className="size-3.5" /> {errors.phone}
                          </p>
                        )}
                      </div>

                      {/* Email Address */}
                      <div>
                        <label className="block text-xs font-bold text-foreground">
                          Email Address <span className="text-destructive">*</span>
                        </label>
                        <div className="relative mt-1.5">
                          <Mail className="absolute top-3 left-3.5 size-4 text-muted-foreground" />
                          <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => {
                              setFormData({ ...formData, email: e.target.value });
                              if (errors.email) setErrors({ ...errors, email: "" });
                            }}
                            placeholder="rahul.mehta@example.com"
                            className={cn(
                              "w-full rounded-2xl border bg-background pl-10 pr-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2",
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

                      {/* Age */}
                      <div>
                        <label className="block text-xs font-bold text-foreground">
                          Age (Years) <span className="text-destructive">*</span>
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={120}
                          value={formData.age}
                          onChange={(e) => {
                            setFormData({ ...formData, age: e.target.value });
                            if (errors.age) setErrors({ ...errors, age: "" });
                          }}
                          placeholder="32"
                          className={cn(
                            "mt-1.5 w-full rounded-2xl border bg-background px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2",
                            errors.age
                              ? "border-destructive focus:ring-destructive/30"
                              : "border-border focus:border-primary focus:ring-primary/20",
                          )}
                        />
                        {errors.age && (
                          <p className="mt-1.5 flex items-center gap-1 text-xs text-destructive">
                            <AlertCircle className="size-3.5" /> {errors.age}
                          </p>
                        )}
                      </div>

                      {/* Gender */}
                      <div>
                        <label className="block text-xs font-bold text-foreground">
                          Gender <span className="text-destructive">*</span>
                        </label>
                        <div className="mt-1.5 grid grid-cols-3 gap-2">
                          {(["Male", "Female", "Other"] as const).map((g) => (
                            <button
                              key={g}
                              type="button"
                              onClick={() => {
                                setFormData({ ...formData, gender: g });
                                if (errors.gender) setErrors({ ...errors, gender: "" });
                              }}
                              className={cn(
                                "rounded-2xl border py-2.5 text-xs font-semibold transition-all cursor-pointer",
                                formData.gender === g
                                  ? "border-primary bg-primary/10 text-primary"
                                  : "border-border bg-background text-muted-foreground hover:bg-secondary",
                              )}
                            >
                              {g}
                            </button>
                          ))}
                        </div>
                        {errors.gender && (
                          <p className="mt-1.5 flex items-center gap-1 text-xs text-destructive">
                            <AlertCircle className="size-3.5" /> {errors.gender}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-border/60">
                      <Button
                        type="button"
                        onClick={handleNext}
                        className="gradient-cta rounded-full px-7 py-3 text-xs font-semibold text-white shadow-soft"
                      >
                        Continue to Step 2 <ArrowRight className="size-4 ml-1.5" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* -------------------------------------------------------- */}
                {/* STEP 2: APPOINTMENT SPECIFICS                            */}
                {/* -------------------------------------------------------- */}
                {step === 2 && (
                  <div className="space-y-7 animate-fade-up">
                    <div>
                      <h2 className="text-xl font-bold text-foreground">
                        Step 2: Appointment Details
                      </h2>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Choose your preferred service, specialist doctor, date, and time slot.
                      </p>
                    </div>

                    {/* Service Selection */}
                    <div>
                      <label className="block text-xs font-bold text-foreground">
                        Select Dental Service <span className="text-destructive">*</span>
                      </label>
                      <div className="mt-2 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                        {SERVICES.map((s) => {
                          const isSelected = formData.service === s.name;
                          const Icon = s.icon;
                          return (
                            <button
                              key={s.slug}
                              type="button"
                              onClick={() => setFormData({ ...formData, service: s.name })}
                              className={cn(
                                "flex items-start gap-3 rounded-2xl border p-3.5 text-left transition-all cursor-pointer",
                                isSelected
                                  ? "border-primary bg-primary/10 text-primary shadow-xs ring-1 ring-primary"
                                  : "border-border bg-background text-foreground hover:bg-secondary/60",
                              )}
                            >
                              <div
                                className={cn(
                                  "grid size-8 shrink-0 place-items-center rounded-xl",
                                  isSelected
                                    ? "bg-primary text-white"
                                    : "bg-secondary text-primary",
                                )}
                              >
                                <Icon className="size-4" />
                              </div>
                              <div>
                                <p className="text-xs font-bold leading-tight">{s.name}</p>
                                <p className="mt-0.5 text-[0.68rem] text-muted-foreground line-clamp-1">
                                  {s.short}
                                </p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Doctor Selection */}
                    <div>
                      <label className="block text-xs font-bold text-foreground">
                        Select Doctor / Specialist <span className="text-destructive">*</span>
                      </label>
                      <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {(dbDoctors.length > 0 ? dbDoctors : DOCTORS).map((doc) => {
                          const isSelected = formData.doctorId === doc.id;
                          const staticMatch = DOCTORS.find(
                            (d) => d.email === doc.email || d.name === doc.name,
                          );
                          const img = staticMatch?.image;

                          return (
                            <button
                              key={doc.id}
                              type="button"
                              onClick={() => handleSelectDoctor(doc)}
                              className={cn(
                                "flex items-center gap-3 rounded-2xl border p-3 text-left transition-all cursor-pointer",
                                isSelected
                                  ? "border-primary bg-primary/10 text-primary shadow-xs ring-1 ring-primary"
                                  : "border-border bg-background text-foreground hover:bg-secondary/60",
                              )}
                            >
                              {img ? (
                                <img
                                  src={img}
                                  alt={doc.name}
                                  className="size-12 rounded-xl object-cover shrink-0"
                                />
                              ) : (
                                <div className="grid size-12 place-items-center rounded-xl bg-secondary text-primary font-bold text-sm">
                                  {doc.name.charAt(4) || "Dr"}
                                </div>
                              )}
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-foreground truncate">
                                  {doc.name}
                                </p>
                                <p className="text-[0.68rem] text-primary font-medium truncate">
                                  {doc.specialization}
                                </p>
                                <p className="text-[0.65rem] text-muted-foreground">
                                  {doc.qualification}
                                </p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Date & Time Grid */}
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                      {/* Date Picker */}
                      <div className="lg:col-span-6">
                        <label className="block text-xs font-bold text-foreground">
                          Appointment Date <span className="text-destructive">*</span>
                        </label>
                        <div className="mt-2 rounded-2xl border border-border bg-background p-2 flex justify-center">
                          <Calendar
                            mode="single"
                            selected={formData.date}
                            onSelect={(d) => d && setFormData({ ...formData, date: d })}
                            disabled={(date) =>
                              date < new Date(new Date().setHours(0, 0, 0, 0)) ||
                              date > new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)
                            }
                            className="rounded-xl"
                          />
                        </div>
                      </div>

                      {/* Time Slots & Appointment Type */}
                      <div className="lg:col-span-6 flex flex-col justify-between">
                        <div>
                          <label className="block text-xs font-bold text-foreground">
                            Available Time Slot <span className="text-destructive">*</span>
                          </label>
                          <div className="mt-2 grid grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1">
                            {loadingSlots ? (
                              <div className="col-span-3 flex items-center justify-center gap-2 py-6 text-xs text-muted-foreground">
                                <Loader2 className="size-4 animate-spin text-primary" />
                                Checking availability...
                              </div>
                            ) : (
                              (availableSlots && availableSlots.length > 0
                                ? availableSlots
                                : TIME_SLOTS
                              ).map((slot) => {
                                const isSelected = formData.time === slot;
                                return (
                                  <button
                                    key={slot}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, time: slot })}
                                    className={cn(
                                      "rounded-xl border py-2 text-center text-xs font-semibold transition-all cursor-pointer",
                                      isSelected
                                        ? "border-primary bg-primary text-white shadow-xs"
                                        : "border-border bg-background text-muted-foreground hover:bg-secondary",
                                    )}
                                  >
                                    {slot}
                                  </button>
                                );
                              })
                            )}
                          </div>
                          {availableSlots && availableSlots.length === 0 && !loadingSlots && (
                            <p className="mt-2 flex items-center gap-1 text-xs text-destructive">
                              <AlertCircle className="size-3.5" /> No availability for this doctor
                              on the selected date.
                            </p>
                          )}
                        </div>

                        {/* Appointment Type */}
                        <div className="mt-6">
                          <label className="block text-xs font-bold text-foreground">
                            Appointment Type <span className="text-destructive">*</span>
                          </label>
                          <div className="mt-2 grid grid-cols-3 gap-2">
                            {APPOINTMENT_TYPES.map((type) => {
                              const isSelected = formData.appointmentType === type;
                              return (
                                <button
                                  key={type}
                                  type="button"
                                  onClick={() =>
                                    setFormData({ ...formData, appointmentType: type })
                                  }
                                  className={cn(
                                    "rounded-xl border py-2.5 text-center text-xs font-semibold transition-all cursor-pointer",
                                    isSelected
                                      ? "border-primary bg-primary/10 text-primary ring-1 ring-primary"
                                      : "border-border bg-background text-muted-foreground hover:bg-secondary",
                                  )}
                                >
                                  {type}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Step 2 Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-border/60">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleBack}
                        className="rounded-full px-5 py-2 text-xs font-semibold gap-1.5"
                      >
                        <ArrowLeft className="size-4" /> Back to Patient Info
                      </Button>
                      <Button
                        type="button"
                        onClick={handleNext}
                        className="gradient-cta rounded-full px-7 py-3 text-xs font-semibold text-white shadow-soft"
                      >
                        Review Booking <ArrowRight className="size-4 ml-1.5" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* -------------------------------------------------------- */}
                {/* STEP 3: REASON & FINAL REVIEW SUMMARY                   */}
                {/* -------------------------------------------------------- */}
                {step === 3 && (
                  <div className="space-y-6 animate-fade-up">
                    <div>
                      <h2 className="text-xl font-bold text-foreground">Step 3: Reason & Review</h2>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Please describe your dental symptoms and review your booking summary before
                        confirming.
                      </p>
                    </div>

                    {/* Reason Textarea */}
                    <div>
                      <label className="block text-xs font-bold text-foreground">
                        Reason for Visit / Symptoms <span className="text-destructive">*</span>
                      </label>
                      <textarea
                        rows={3}
                        value={formData.reason}
                        onChange={(e) => {
                          setFormData({ ...formData, reason: e.target.value });
                          if (errors.reason) setErrors({ ...errors, reason: "" });
                        }}
                        placeholder="Please describe what you are experiencing (e.g. pain while chewing on lower right molar, sensitivity to cold, routine cleaning)..."
                        className={cn(
                          "mt-1.5 w-full rounded-2xl border bg-background p-4 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 resize-none",
                          errors.reason
                            ? "border-destructive focus:ring-destructive/30"
                            : "border-border focus:border-primary focus:ring-primary/20",
                        )}
                      />
                      {errors.reason && (
                        <p className="mt-1.5 flex items-center gap-1 text-xs text-destructive">
                          <AlertCircle className="size-3.5" /> {errors.reason}
                        </p>
                      )}
                    </div>

                    {/* Review Summary Card */}
                    <div className="rounded-2xl border border-border/80 bg-secondary/30 p-6 space-y-4 text-xs">
                      <div className="flex items-center justify-between border-b border-border/60 pb-3">
                        <span className="font-bold text-sm text-foreground flex items-center gap-1.5">
                          <FileText className="size-4 text-primary" /> Booking Summary
                        </span>
                        <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[0.68rem] font-bold text-primary">
                          {formData.appointmentType}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <p className="font-semibold text-muted-foreground">Patient Information</p>
                          <p className="mt-1 text-sm font-bold text-foreground">{formData.name}</p>
                          <p className="text-muted-foreground">
                            {formData.phone} • {formData.email}
                          </p>
                          <p className="text-muted-foreground">
                            Age: {formData.age} • Gender: {formData.gender}
                          </p>
                        </div>

                        <div>
                          <p className="font-semibold text-muted-foreground">
                            Appointment Specifics
                          </p>
                          <p className="mt-1 text-sm font-bold text-foreground">
                            {formData.doctorName}
                          </p>
                          <p className="text-primary font-medium">{formData.service}</p>
                          <p className="text-muted-foreground">
                            {formData.date?.toLocaleDateString("en-US", {
                              weekday: "short",
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}{" "}
                            at {formData.time}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Step 3 Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-border/60">
                      <Button
                        type="button"
                        variant="outline"
                        disabled={isSubmitting}
                        onClick={handleBack}
                        className="rounded-full px-5 py-2 text-xs font-semibold gap-1.5"
                      >
                        <ArrowLeft className="size-4" /> Back to Edit
                      </Button>

                      <Button
                        type="button"
                        disabled={isSubmitting}
                        onClick={handleSubmitBooking}
                        className="gradient-cta rounded-full px-8 py-3.5 text-sm font-semibold text-white shadow-soft hover:shadow-glow min-w-[200px]"
                      >
                        {isSubmitting ? (
                          <span className="flex items-center gap-2">
                            <Loader2 className="size-4 animate-spin" /> Confirming...
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">
                            Confirm Appointment <CheckCircle2 className="size-4" />
                          </span>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
