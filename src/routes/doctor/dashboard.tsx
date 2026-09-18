import { useState, useEffect } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import {
  Calendar,
  Clock,
  User,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Stethoscope,
  ShieldCheck,
  Award,
  FileText,
  Phone,
  Mail,
  ChevronRight,
  Eye,
  RefreshCw,
  X,
  Building2,
  CalendarDays,
  Users,
  CalendarRange,
  Plus,
  Trash2,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { Logo } from "@/components/site/Logo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { DOCTOR_IMAGES } from "@/lib/site-data";
import { cn } from "@/lib/utils";
import {
  DAY_LABELS,
  fetchDoctorAvailability,
  createAvailability,
  deleteAvailability,
  to12h,
  type AvailabilityRecord,
} from "@/lib/availability";

export const Route = createFileRoute("/doctor/dashboard")({
  component: DoctorDashboardPage,
});

type DoctorRecord = {
  id: string;
  user_id: string | null;
  name: string;
  email: string;
  qualification: string;
  specialization: string;
  experience_years: number;
  registration_number: string;
  phone: string;
  profile_image: string | null;
  bio: string;
  availability: string;
  status: string;
};

type PatientRecord = {
  id: string;
  code: string;
  name: string;
  phone: string;
  email: string | null;
  age: number | null;
  gender: string | null;
};

type AppointmentWithPatient = {
  id: string;
  code: string;
  patient_id: string;
  doctor_id: string;
  service: string;
  appointment_date: string;
  appointment_time: string;
  appointment_type: string;
  reason: string;
  status: string;
  created_at: string;
  patients: PatientRecord | null;
};

function DoctorDashboardPage() {
  const navigate = useNavigate();

  const [doctor, setDoctor] = useState<DoctorRecord | null>(null);
  const [appointments, setAppointments] = useState<AppointmentWithPatient[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentWithPatient | null>(
    null,
  );

  // Availability state
  const [availability, setAvailability] = useState<AvailabilityRecord[]>([]);
  const [loadingAvail, setLoadingAvail] = useState(false);

  // Today's date formatted as YYYY-MM-DD for database query
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  const todayStr = `${year}-${month}-${day}`;

  // Selected schedule date (defaults to today) for the appointments queue
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  const formattedDate = today.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // 1. Authenticate & Authorize Doctor
  const fetchDashboardData = async (showRefreshToast = false) => {
    try {
      if (showRefreshToast) setRefreshing(true);

      // Check current session
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session || !session.user) {
        // Not authenticated -> redirect to login
        navigate({ to: "/doctor-login" });
        return;
      }

      // Query doctor profile for authenticated user_id
      const { data: docData, error: docError } = await supabase
        .from("doctors")
        .select("*")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (docError || !docData || docData.status !== "active") {
        // Authenticated user is not an active doctor -> sign out and redirect
        await supabase.auth.signOut();
        toast.error("Unauthorized: Doctor profile not found");
        navigate({ to: "/doctor-login" });
        return;
      }

      setDoctor(docData as DoctorRecord);

      // Load the doctor's availability schedule
      try {
        const avail = await fetchDoctorAvailability(docData.id);
        setAvailability(avail);
      } catch (availErr) {
        console.warn("Could not load availability:", availErr);
        setAvailability([]);
      }

      // 2. Fetch the selected date's Appointments scoped strictly to this doctor
      await loadAppointments(docData.id, selectedDate);

      if (showRefreshToast) {
        toast.success("Schedule refreshed");
      }
    } catch (err: any) {
      console.error("Dashboard error:", err);
      toast.error("Failed to load dashboard");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadAppointments = async (doctorId: string, dateStr: string) => {
    const { data: aptData, error: aptError } = await supabase
      .from("appointments")
      .select("*, patients(*)")
      .eq("doctor_id", doctorId)
      .eq("appointment_date", dateStr)
      .order("appointment_time", { ascending: true });

    if (aptError) {
      console.error("Error fetching appointments:", aptError);
      toast.error("Unable to load appointments for this date");
      setAppointments([]);
      return;
    }
    setAppointments((aptData as unknown as AppointmentWithPatient[]) || []);
  };

  const handleDateChange = (value: string) => {
    if (!value) return;
    setSelectedDate(value);
    if (doctor) {
      loadAppointments(doctor.id, value);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        navigate({ to: "/doctor-login" });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.info("Logged out successfully");
      navigate({ to: "/doctor-login" });
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  // Availability handlers
  const [availDay, setAvailDay] = useState(1);
  const [availStart, setAvailStart] = useState("09:00 AM");
  const [availEnd, setAvailEnd] = useState("05:00 PM");
  const [savingAvail, setSavingAvail] = useState(false);

  const handleAddAvailability = async () => {
    if (!doctor) return;
    setSavingAvail(true);
    try {
      const rec = await createAvailability(doctor.id, availDay, availStart, availEnd);
      setAvailability((prev) =>
        [...prev, rec].sort(
          (a, b) => a.day_of_week - b.day_of_week || a.start_time.localeCompare(b.start_time),
        ),
      );
      toast.success("Availability added");
    } catch (err: unknown) {
      toast.error("Could not add availability", {
        description: (err as Error)?.message || "Please check the time range and try again.",
      });
    } finally {
      setSavingAvail(false);
    }
  };

  const handleRemoveAvailability = async (id: string) => {
    try {
      await deleteAvailability(id);
      setAvailability((prev) => prev.filter((r) => r.id !== id));
      toast.success("Availability removed");
    } catch (err: unknown) {
      toast.error("Could not remove availability", {
        description: (err as Error)?.message || "Please try again.",
      });
    }
  };

  // Metrics derived from real appointment records
  const totalBookings = appointments.length;
  const completedCount = appointments.filter((a) => a.status === "Completed").length;
  const waitingCount = appointments.filter(
    (a) => a.status === "Waiting" || a.status === "Scheduled",
  ).length;
  const inConsultCount = appointments.filter((a) => a.status === "In Consultation").length;

  const doctorPhoto = doctor?.email ? DOCTOR_IMAGES[doctor.email] : null;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Completed":
        return (
          <Badge className="bg-success/15 text-success border-success/30 font-semibold">
            Completed
          </Badge>
        );
      case "In Consultation":
        return (
          <Badge className="bg-primary/15 text-primary border-primary/30 font-semibold">
            In Consultation
          </Badge>
        );
      case "Waiting":
      case "Scheduled":
        return (
          <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 font-semibold">
            Waiting
          </Badge>
        );
      case "Cancelled":
        return (
          <Badge className="bg-destructive/15 text-destructive border-destructive/30 font-semibold">
            Cancelled
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary animate-pulse">
            <Stethoscope className="size-6" />
          </div>
          <p className="text-xs font-semibold text-muted-foreground">
            Loading doctor clinical dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (!doctor) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] text-foreground">
      {/* ============================================================ */}
      {/* DOCTOR CLINICAL SIDEBAR                                      */}
      {/* ============================================================ */}
      <aside className="hidden lg:flex w-64 flex-col border-r border-border/80 bg-card p-6 justify-between">
        <div className="space-y-6">
          <Logo />

          {/* Doctor Mini Profile Card in Sidebar */}
          <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-secondary/30 p-3">
            {doctorPhoto ? (
              <img
                src={doctorPhoto}
                alt={doctor.name}
                className="size-11 rounded-xl object-cover"
              />
            ) : (
              <div className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary font-bold">
                {doctor.name.charAt(4) || "Dr"}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-xs font-bold text-foreground truncate">{doctor.name}</p>
              <p className="text-[0.68rem] text-primary font-semibold truncate">
                {doctor.specialization}
              </p>
              <p className="text-[0.65rem] text-muted-foreground">{doctor.qualification}</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1" aria-label="Doctor Sidebar Navigation">
            <Link
              to="/doctor/dashboard"
              className="flex items-center gap-3 rounded-xl bg-primary/10 px-3.5 py-2.5 text-xs font-bold text-primary shadow-xs"
            >
              <CalendarDays className="size-4" />
              <span>Today's Schedule</span>
            </Link>

            <div className="pt-3 pb-1">
              <span className="px-3.5 text-[0.65rem] font-bold text-muted-foreground uppercase tracking-wider">
                Clinical Modules
              </span>
            </div>

            <div className="flex items-center justify-between rounded-xl px-3.5 py-2 text-xs font-medium text-muted-foreground">
              <span className="flex items-center gap-3">
                <Users className="size-4 opacity-70" />
                <span>Patient Records</span>
              </span>
              <span className="text-[0.65rem] font-bold bg-secondary px-2 py-0.5 rounded-md">
                Step 5
              </span>
            </div>

            <div className="flex items-center justify-between rounded-xl px-3.5 py-2 text-xs font-medium text-muted-foreground">
              <span className="flex items-center gap-3">
                <FileText className="size-4 opacity-70" />
                <span>Prescriptions</span>
              </span>
              <span className="text-[0.65rem] font-bold bg-secondary px-2 py-0.5 rounded-md">
                Step 7
              </span>
            </div>
          </nav>
        </div>

        {/* Sidebar Footer & Sign Out */}
        <div className="border-t border-border/60 pt-4 space-y-3">
          <div className="px-2">
            <span className="inline-flex items-center gap-1.5 text-[0.68rem] font-medium text-success">
              <span className="size-2 rounded-full bg-success animate-pulse" /> Clinical Session
              Active
            </span>
            <p className="text-[0.65rem] text-muted-foreground mt-0.5">
              {doctor.registration_number}
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="w-full justify-start gap-2 rounded-xl text-xs text-destructive hover:bg-destructive/10 hover:text-destructive border-border"
          >
            <LogOut className="size-3.5" />
            <span>Sign Out</span>
          </Button>
        </div>
      </aside>

      {/* ============================================================ */}
      {/* MAIN DASHBOARD CONTENT AREA                                  */}
      {/* ============================================================ */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Clinical Header */}
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border/80 bg-background/90 px-4 py-3 backdrop-blur-md sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="lg:hidden">
              <Logo />
            </div>
            <div className="hidden lg:block">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Doctor Management Portal
              </span>
              <h1 className="text-lg font-extrabold text-foreground">Good Day, {doctor.name}</h1>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchDashboardData(true)}
              disabled={refreshing}
              className="gap-1.5 rounded-xl text-xs h-8"
            >
              <RefreshCw className={cn("size-3.5", refreshing && "animate-spin")} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>

            <Link
              to="/"
              className="hidden sm:inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-primary px-2"
            >
              Public Website ↗
            </Link>

            <Link
              to="/patient/dashboard"
              className="hidden sm:inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/70 px-2"
            >
              Patient Portal ↗
            </Link>

            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="lg:hidden gap-1 text-xs text-destructive rounded-xl h-8"
            >
              <LogOut className="size-3.5" />
            </Button>
          </div>
        </header>

        {/* Dashboard Main Workspace */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* Welcome & Date Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border border-border/80 bg-card p-6 shadow-xs">
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-0.5 text-xs font-bold text-primary uppercase">
                  <ShieldCheck className="size-3.5" /> Authenticated Specialist
                </span>
                <span className="text-xs text-muted-foreground">• {doctor.specialization}</span>
              </div>
              <h2 className="mt-2 text-2xl font-extrabold text-foreground tracking-tight">
                Today's Clinical Schedule
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {formattedDate} • Hospital Hours: {doctor.availability}
              </p>
            </div>

            <div className="flex items-center gap-3 bg-secondary/50 rounded-2xl p-3 border border-border/60">
              <div className="grid size-10 place-items-center rounded-xl gradient-cta text-white shadow-xs">
                <Calendar className="size-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-foreground">Registration No.</p>
                <p className="text-xs text-primary font-mono font-semibold">
                  {doctor.registration_number}
                </p>
              </div>
            </div>
          </div>

          {/* ============================================================ */}
          {/* STATS SUMMARY METRICS (Computed from real DB records)        */}
          {/* ============================================================ */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-3xl border border-border/80 bg-card p-5 shadow-xs transition-all hover:-translate-y-0.5 hover:shadow-soft">
              <div className="grid size-11 place-items-center rounded-2xl bg-blue-50 text-blue-600">
                <Calendar className="size-5" />
              </div>
              <p className="mt-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Today's Bookings
              </p>
              <p className="mt-2 text-3xl font-extrabold text-foreground">{totalBookings}</p>
              <p className="mt-1 text-[0.7rem] text-primary font-medium">Scheduled for today</p>
            </div>

            <div className="rounded-3xl border border-border/80 bg-card p-5 shadow-xs transition-all hover:-translate-y-0.5 hover:shadow-soft">
              <div className="grid size-11 place-items-center rounded-2xl bg-emerald-50 text-success">
                <CheckCircle2 className="size-5" />
              </div>
              <p className="mt-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Completed
              </p>
              <p className="mt-2 text-3xl font-extrabold text-success">{completedCount}</p>
              <p className="mt-1 text-[0.7rem] text-muted-foreground">Consultations finished</p>
            </div>

            <div className="rounded-3xl border border-border/80 bg-card p-5 shadow-xs transition-all hover:-translate-y-0.5 hover:shadow-soft">
              <div className="grid size-11 place-items-center rounded-2xl bg-amber-50 text-amber-600 dark:text-amber-400">
                <Clock className="size-5" />
              </div>
              <p className="mt-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Waiting
              </p>
              <p className="mt-2 text-3xl font-extrabold text-amber-600 dark:text-amber-400">
                {waitingCount}
              </p>
              <p className="mt-1 text-[0.7rem] text-muted-foreground">In queue / scheduled</p>
            </div>

            <div className="rounded-3xl border border-border/80 bg-card p-5 shadow-xs transition-all hover:-translate-y-0.5 hover:shadow-soft">
              <div className="grid size-11 place-items-center rounded-2xl bg-primary/10 text-primary">
                <Stethoscope className="size-5" />
              </div>
              <p className="mt-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                In Consultation
              </p>
              <p className="mt-2 text-3xl font-extrabold text-primary">{inConsultCount}</p>
              <p className="mt-1 text-[0.7rem] text-muted-foreground">Active in clinic</p>
            </div>
          </div>

          {/* ============================================================ */}
          {/* DOCTOR AVAILABILITY MANAGEMENT                                */}
          {/* ============================================================ */}
          <div className="rounded-3xl border border-border/80 bg-card shadow-card overflow-hidden">
            <div className="flex items-center justify-between border-b border-border/60 p-5 sm:px-6">
              <div className="flex items-center gap-2">
                <CalendarRange className="size-4 text-primary" />
                <div>
                  <h3 className="text-base font-bold text-foreground">Consultation Availability</h3>
                  <p className="text-xs text-muted-foreground">
                    Define your weekly working slots. Patients can only book within these windows.
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold bg-secondary px-3 py-1 rounded-full text-foreground">
                {availability.length} Slot{availability.length === 1 ? "" : "s"}
              </span>
            </div>

            <div className="p-5 sm:p-6 space-y-5">
              {/* Add form */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5">Day</label>
                  <select
                    value={availDay}
                    onChange={(e) => setAvailDay(parseInt(e.target.value, 10))}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  >
                    {DAY_LABELS.map((label, idx) => (
                      <option key={label} value={idx}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5">From</label>
                  <select
                    value={availStart}
                    onChange={(e) => setAvailStart(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  >
                    {Array.from({ length: 14 }, (_, i) => {
                      const h = 8 + Math.floor(i / 2);
                      const m = i % 2 === 0 ? "00" : "30";
                      const t = `${String(h).padStart(2, "0")}:${m}`;
                      return (
                        <option key={t} value={to12h(t)}>
                          {to12h(t)}
                        </option>
                      );
                    })}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5">To</label>
                  <select
                    value={availEnd}
                    onChange={(e) => setAvailEnd(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  >
                    {Array.from({ length: 15 }, (_, i) => {
                      const h = 8 + Math.floor(i / 2);
                      const m = i % 2 === 0 ? "00" : "30";
                      const t = `${String(h).padStart(2, "0")}:${m}`;
                      return (
                        <option key={t} value={to12h(t)}>
                          {to12h(t)}
                        </option>
                      );
                    })}
                  </select>
                </div>
                <div>
                  <Button
                    type="button"
                    disabled={savingAvail}
                    onClick={handleAddAvailability}
                    className="gradient-cta w-full rounded-xl text-xs font-semibold text-white shadow-soft gap-1.5"
                  >
                    {savingAvail ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <Plus className="size-3.5" />
                    )}
                    Add Slot
                  </Button>
                </div>
              </div>

              {/* Existing availability */}
              {availability.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border/80 bg-secondary/10 p-6 text-center text-xs text-muted-foreground">
                  <CalendarRange className="mx-auto size-6 opacity-40 mb-1.5" />
                  No availability defined. Until you add slots, patients can book any standard
                  clinic time.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {availability.map((rec) => (
                    <div
                      key={rec.id}
                      className="flex items-center justify-between rounded-2xl border border-border/80 bg-secondary/20 p-3.5"
                    >
                      <div>
                        <p className="text-xs font-bold text-foreground">
                          {DAY_LABELS[rec.day_of_week]}
                        </p>
                        <p className="text-[0.7rem] text-primary font-semibold mt-0.5">
                          {to12h(rec.start_time)} – {to12h(rec.end_time)}
                        </p>
                      </div>
                      <button
                        type="button"
                        title="Remove slot"
                        onClick={() => handleRemoveAvailability(rec.id)}
                        className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ============================================================ */}
          {/* TODAY'S APPOINTMENTS LIST / TABLE                            */}
          {/* ============================================================ */}
          <div className="rounded-3xl border border-border/80 bg-card shadow-card overflow-hidden">
            <div className="flex items-center justify-between border-b border-border/60 p-5 sm:px-6">
              <div>
                <h3 className="text-base font-bold text-foreground">Patient Appointments Queue</h3>
                <p className="text-xs text-muted-foreground">
                  Showing appointments booked with {doctor.name} for {selectedDate}
                </p>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="text-xs font-bold bg-secondary px-3 py-1 rounded-full text-foreground">
                  {appointments.length} Total
                </span>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => handleDateChange(e.target.value)}
                  max={todayStr}
                  className="rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            </div>

            {appointments.length === 0 ? (
              /* Empty State */
              <div className="flex flex-col items-center justify-center p-12 text-center">
                <div className="grid size-14 place-items-center rounded-2xl bg-secondary text-muted-foreground">
                  <Calendar className="size-7" />
                </div>
                <h4 className="mt-4 text-base font-bold text-foreground">
                  No appointments scheduled for {selectedDate}
                </h4>
                <p className="mt-1 max-w-sm text-xs text-muted-foreground">
                  {selectedDate === todayStr
                    ? "Your schedule for today is clear. New online bookings will appear here automatically."
                    : "There are no appointments booked for this date. Pick another date or go back to today."}
                </p>
              </div>
            ) : (
              /* Appointments Table */
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-border/60 bg-secondary/40 text-muted-foreground font-bold uppercase tracking-wider text-[0.68rem]">
                    <tr>
                      <th className="py-3.5 px-4 sm:px-6">Time & ID</th>
                      <th className="py-3.5 px-4 sm:px-6">Patient Name</th>
                      <th className="py-3.5 px-4 sm:px-6">Service</th>
                      <th className="py-3.5 px-4 sm:px-6">Type</th>
                      <th className="py-3.5 px-4 sm:px-6">Status</th>
                      <th className="py-3.5 px-4 sm:px-6 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {appointments.map((apt) => (
                      <tr key={apt.id} className="hover:bg-secondary/20 transition-colors">
                        {/* Time & Code */}
                        <td className="py-4 px-4 sm:px-6">
                          <div className="flex items-center gap-2">
                            <Clock className="size-3.5 text-primary shrink-0" />
                            <span className="font-bold text-foreground">
                              {apt.appointment_time}
                            </span>
                          </div>
                          <span className="text-[0.68rem] text-muted-foreground font-mono">
                            {apt.code}
                          </span>
                        </td>

                        {/* Patient Name & Details */}
                        <td className="py-4 px-4 sm:px-6">
                          <p className="font-bold text-foreground">
                            {apt.patients?.name || "Patient Record"}
                          </p>
                          <p className="text-[0.68rem] text-muted-foreground">
                            {apt.patients?.age ? `${apt.patients.age} yrs` : ""}
                            {apt.patients?.gender ? ` • ${apt.patients.gender}` : ""}
                            {apt.patients?.code ? ` • ${apt.patients.code}` : ""}
                          </p>
                        </td>

                        {/* Service */}
                        <td className="py-4 px-4 sm:px-6">
                          <span className="font-semibold text-foreground">{apt.service}</span>
                        </td>

                        {/* Appointment Type */}
                        <td className="py-4 px-4 sm:px-6">
                          <span className="rounded-md bg-secondary px-2 py-1 text-[0.68rem] font-medium text-foreground">
                            {apt.appointment_type}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-4 px-4 sm:px-6">{getStatusBadge(apt.status)}</td>

                        {/* Action */}
                        <td className="py-4 px-4 sm:px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedAppointment(apt)}
                              className="gap-1 rounded-xl text-xs h-8 hover:bg-secondary hover:text-primary"
                            >
                              <Eye className="size-3.5" />
                              <span className="hidden sm:inline">Details</span>
                            </Button>
                            <Link
                              to="/doctor/consultation/$appointmentId"
                              params={{ appointmentId: apt.id }}
                              className="inline-flex items-center gap-1 gradient-cta rounded-xl px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:shadow-soft transition-all"
                            >
                              <Stethoscope className="size-3.5" />
                              <span>{apt.status === "Completed" ? "View Case" : "Consult"}</span>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* ============================================================ */}
      {/* APPOINTMENT DETAILS MODAL VIEW                               */}
      {/* ============================================================ */}
      {selectedAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-fade-up">
          <div className="w-full max-w-lg rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-card space-y-5">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div>
                <span className="inline-flex items-center gap-1 text-[0.68rem] font-bold text-primary uppercase tracking-wider">
                  <FileText className="size-3.5" /> Appointment Overview
                </span>
                <h3 className="text-lg font-extrabold text-foreground">
                  {selectedAppointment.code}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAppointment(null)}
                className="rounded-xl p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground focus:outline-none"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="space-y-4 text-xs">
              {/* Patient Info Card */}
              <div className="rounded-2xl border border-border/60 bg-secondary/30 p-4 space-y-2">
                <p className="font-bold text-foreground text-sm">
                  {selectedAppointment.patients?.name}
                </p>
                <div className="grid grid-cols-2 gap-2 text-muted-foreground">
                  <p>
                    Patient ID:{" "}
                    <strong className="text-foreground">
                      {selectedAppointment.patients?.code || "N/A"}
                    </strong>
                  </p>
                  <p>
                    Age/Gender:{" "}
                    <strong className="text-foreground">
                      {selectedAppointment.patients?.age || "N/A"} yrs /{" "}
                      {selectedAppointment.patients?.gender || "N/A"}
                    </strong>
                  </p>
                  <p className="flex items-center gap-1">
                    <Phone className="size-3 text-primary" /> {selectedAppointment.patients?.phone}
                  </p>
                  <p className="flex items-center gap-1 truncate">
                    <Mail className="size-3 text-primary" />{" "}
                    {selectedAppointment.patients?.email || "No email"}
                  </p>
                </div>
              </div>

              {/* Appointment Specifics */}
              <div className="space-y-2 border-b border-border/50 pb-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Service:</span>
                  <span className="font-bold text-foreground">{selectedAppointment.service}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Scheduled Slot:</span>
                  <span className="font-bold text-primary">
                    {selectedAppointment.appointment_time} on {selectedAppointment.appointment_date}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Visit Type:</span>
                  <span className="font-semibold text-foreground">
                    {selectedAppointment.appointment_type}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Current Status:</span>
                  <span>{getStatusBadge(selectedAppointment.status)}</span>
                </div>
              </div>

              {/* Patient Reason / Symptoms */}
              <div>
                <p className="font-bold text-foreground mb-1">
                  Reason for Visit / Chief Complaint:
                </p>
                <div className="rounded-xl border border-border/60 bg-secondary/20 p-3 text-muted-foreground leading-relaxed italic">
                  "{selectedAppointment.reason || "Routine consultation requested."}"
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end pt-2">
              <Button
                type="button"
                onClick={() => setSelectedAppointment(null)}
                className="gradient-cta rounded-full px-6 text-xs font-semibold text-white shadow-soft"
              >
                Close Overview
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
