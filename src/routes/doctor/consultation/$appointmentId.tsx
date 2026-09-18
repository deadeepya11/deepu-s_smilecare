import { useState, useEffect } from "react";
import { createFileRoute, useNavigate, useParams, Link } from "@tanstack/react-router";
import {
  Stethoscope,
  ShieldCheck,
  User,
  Phone,
  Mail,
  Calendar,
  Clock,
  FileText,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  Loader2,
  Save,
  Activity,
  HeartPulse,
  Info,
  LogOut,
  ChevronRight,
  Pill,
  Plus,
  Trash2,
  Edit2,
  Search,
  Check,
  Sparkles,
  Send,
  AlertTriangle,
  X,
  Printer,
} from "lucide-react";
import { toast } from "sonner";
import { Logo } from "@/components/site/Logo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PrescriptionPrintView } from "@/components/clinical/PrescriptionPrintView";
import { supabase } from "@/integrations/supabase/client";
import { DOCTOR_IMAGES } from "@/lib/site-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/doctor/consultation/$appointmentId")({
  component: ConsultationPage,
});

type DoctorRecord = {
  id: string;
  name: string;
  email: string;
  specialization: string;
  qualification: string;
  registration_number: string;
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

type AppointmentRecord = {
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
  patients: PatientRecord | null;
};

type ConsultationRecord = {
  id: string;
  appointment_id: string;
  doctor_id: string;
  patient_id: string;
  problem: string;
  symptoms: string;
  clinical_observation: string;
  pain_level: number | null;
  affected_area: string;
  tooth_number: string;
  doctor_notes: string;
  diagnosis: string;
  status: string;
  created_at: string;
  updated_at: string;
};

type ProblemRef = {
  id: string;
  name: string;
  description: string;
};

type MedicineRecord = {
  id: string;
  name: string;
  generic_name: string;
  strength: string;
  form: string;
  default_dosage: string;
  default_frequency: string;
  default_duration: string;
  default_instructions: string;
  status: string;
};

type ProblemMedicineJoined = {
  id: string;
  problem_id: string;
  medicine_id: string;
  note: string;
  medicines: MedicineRecord;
};

type StagedPrescriptionItem = {
  id?: string;
  medicine_id: string | null;
  medicine_name: string;
  generic_name?: string;
  strength: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
};

type PrescriptionRecord = {
  id: string;
  code: string;
  consultation_id: string;
  appointment_id: string;
  patient_id: string;
  doctor_id: string;
  problem: string;
  diagnosis: string;
  doctor_notes: string;
  follow_up_date: string | null;
  status: string;
  created_at: string;
};

function ConsultationPage() {
  const { appointmentId } = useParams({ from: "/doctor/consultation/$appointmentId" });
  const navigate = useNavigate();

  const [doctor, setDoctor] = useState<DoctorRecord | null>(null);
  const [appointment, setAppointment] = useState<AppointmentRecord | null>(null);
  const [consultationId, setConsultationId] = useState<string | null>(null);
  const [prescriptionId, setPrescriptionId] = useState<string | null>(null);
  const [prescriptionCode, setPrescriptionCode] = useState<string | null>(null);
  const [prescriptionStatus, setPrescriptionStatus] = useState<string>("Draft");

  const [problemsList, setProblemsList] = useState<ProblemRef[]>([]);
  const [allMedicines, setAllMedicines] = useState<MedicineRecord[]>([]);
  const [suggestedMedicines, setSuggestedMedicines] = useState<ProblemMedicineJoined[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  // Clinical Consultation Form Fields
  const [problem, setProblem] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [clinicalObservation, setClinicalObservation] = useState("");
  const [painLevel, setPainLevel] = useState<number>(5);
  const [affectedArea, setAffectedArea] = useState("");
  const [toothNumber, setToothNumber] = useState("");
  const [doctorNotes, setDoctorNotes] = useState("");

  // Prescription State
  const [stagedItems, setStagedItems] = useState<StagedPrescriptionItem[]>([]);
  const [followUpDate, setFollowUpDate] = useState<string>("");

  // Medicine Search & Add Modal
  const [searchQuery, setSearchQuery] = useState("");
  const [showCatalogModal, setShowCatalogModal] = useState(false);
  const [editingItem, setEditingItem] = useState<{
    index: number | null;
    item: StagedPrescriptionItem;
  } | null>(null);

  // Confirmation Modal for Issuing
  const [showIssueConfirmModal, setShowIssueConfirmModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);

  // General States
  const [loading, setLoading] = useState(true);
  const [isSavingConsult, setIsSavingConsult] = useState(false);
  const [isSavingPrescription, setIsSavingPrescription] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Load Reference Problems & Active Medicines Catalog
  useEffect(() => {
    async function loadCatalogs() {
      try {
        const [probRes, medRes] = await Promise.all([
          supabase.from("problems").select("*").order("name"),
          supabase.from("medicines").select("*").eq("status", "active").order("name"),
        ]);
        if (probRes.data) setProblemsList(probRes.data);
        if (medRes.data) setAllMedicines(medRes.data);
      } catch (err) {
        console.error("Error loading reference catalogs:", err);
      }
    }
    loadCatalogs();
  }, []);

  // 1. Authenticate Doctor, Authorize Appointment & Load Existing Records
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setAccessDenied(false);

      try {
        // A. Check Active Session
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError || !session || !session.user) {
          navigate({ to: "/doctor-login" });
          return;
        }

        // B. Query Doctor Record for authenticated user
        const { data: docData, error: docError } = await supabase
          .from("doctors")
          .select("id, name, email, specialization, qualification, registration_number, status")
          .eq("user_id", session.user.id)
          .maybeSingle();

        if (docError || !docData || docData.status !== "active") {
          await supabase.auth.signOut();
          navigate({ to: "/doctor-login" });
          return;
        }

        setDoctor(docData as DoctorRecord);

        // C. Fetch Appointment strictly scoped to this doctor (Prevents IDOR)
        const { data: aptData, error: aptError } = await supabase
          .from("appointments")
          .select("*, patients(*)")
          .eq("id", appointmentId)
          .eq("doctor_id", docData.id)
          .maybeSingle();

        if (aptError || !aptData) {
          setAccessDenied(true);
          setLoading(false);
          return;
        }

        setAppointment(aptData as unknown as AppointmentRecord);

        // D. Fetch Existing Consultation Record if previously started
        const { data: consultData, error: consultError } = await supabase
          .from("consultations")
          .select("*")
          .eq("appointment_id", appointmentId)
          .eq("doctor_id", docData.id)
          .maybeSingle();

        if (consultData && !consultError) {
          setConsultationId(consultData.id);
          setProblem(consultData.problem || "");
          setDiagnosis(consultData.diagnosis || "");
          setSymptoms(consultData.symptoms || "");
          setClinicalObservation(consultData.clinical_observation || "");
          if (consultData.pain_level !== null) setPainLevel(consultData.pain_level);
          setAffectedArea(consultData.affected_area || "");
          setToothNumber(consultData.tooth_number || "");
          setDoctorNotes(consultData.doctor_notes || "");
          setLastSaved(new Date(consultData.updated_at || consultData.created_at));

          // E. Fetch Existing Prescription linked to this consultation
          const { data: rxData, error: rxError } = await supabase
            .from("prescriptions")
            .select("*, prescription_items(*)")
            .eq("consultation_id", consultData.id)
            .eq("doctor_id", docData.id)
            .maybeSingle();

          if (rxData && !rxError) {
            setPrescriptionId(rxData.id);
            setPrescriptionCode(rxData.code);
            setPrescriptionStatus(rxData.status || "Draft");
            if (rxData.follow_up_date) setFollowUpDate(rxData.follow_up_date);

            if (rxData.prescription_items && Array.isArray(rxData.prescription_items)) {
              setStagedItems(
                rxData.prescription_items.map((item: any) => ({
                  id: item.id,
                  medicine_id: item.medicine_id,
                  medicine_name: item.medicine_name,
                  strength: item.strength,
                  dosage: item.dosage,
                  frequency: item.frequency,
                  duration: item.duration,
                  instructions: item.instructions,
                })),
              );
            }
          }
        } else {
          // Pre-populate symptoms with booking reason
          if (aptData.reason) {
            setSymptoms(aptData.reason);
          }
        }
      } catch (err) {
        console.error("Consultation load error:", err);
        setAccessDenied(true);
      } finally {
        setLoading(false);
      }
    }

    if (appointmentId) {
      loadData();
    }
  }, [appointmentId]);

  // Query problem_medicines when Problem changes
  useEffect(() => {
    async function loadSuggestionsForProblem() {
      if (!problem.trim()) {
        setSuggestedMedicines([]);
        return;
      }

      const matchedProblem = problemsList.find(
        (p) => p.name.toLowerCase() === problem.trim().toLowerCase(),
      );

      if (!matchedProblem) {
        setSuggestedMedicines([]);
        return;
      }

      setLoadingSuggestions(true);
      try {
        const { data, error } = await supabase
          .from("problem_medicines")
          .select("*, medicines(*)")
          .eq("problem_id", matchedProblem.id);

        if (!error && data) {
          setSuggestedMedicines(data as unknown as ProblemMedicineJoined[]);
        } else {
          setSuggestedMedicines([]);
        }
      } catch (err) {
        console.error("Error loading suggestions:", err);
        setSuggestedMedicines([]);
      } finally {
        setLoadingSuggestions(false);
      }
    }

    loadSuggestionsForProblem();
  }, [problem, problemsList]);

  // 2. Save / Update Consultation Record
  const handleSaveConsultation = async (): Promise<string | null> => {
    if (!problem.trim()) {
      toast.error("Please select or enter a Primary Problem / Disease first.");
      return null;
    }

    if (!doctor || !appointment || isSavingConsult) return null;

    setIsSavingConsult(true);

    try {
      const payload = {
        appointment_id: appointment.id,
        doctor_id: doctor.id,
        patient_id: appointment.patient_id,
        problem: problem.trim(),
        diagnosis: diagnosis.trim(),
        symptoms: symptoms.trim(),
        clinical_observation: clinicalObservation.trim(),
        pain_level: painLevel,
        affected_area: affectedArea.trim(),
        tooth_number: toothNumber.trim(),
        doctor_notes: doctorNotes.trim(),
        status: "in_progress",
      };

      let currentConsultId = consultationId;

      if (consultationId) {
        const { error: updateError } = await supabase
          .from("consultations")
          .update(payload)
          .eq("id", consultationId)
          .eq("doctor_id", doctor.id);

        if (updateError) throw updateError;
      } else {
        const { data: newConsult, error: insertError } = await supabase
          .from("consultations")
          .insert(payload)
          .select("id")
          .single();

        if (insertError) throw insertError;
        if (newConsult) {
          currentConsultId = newConsult.id;
          setConsultationId(newConsult.id);
        }
      }

      // Update appointment status to 'In Consultation' if 'Waiting'
      if (appointment.status === "Waiting" || appointment.status === "Scheduled") {
        await supabase
          .from("appointments")
          .update({ status: "In Consultation" })
          .eq("id", appointment.id)
          .eq("doctor_id", doctor.id);

        setAppointment((prev) => (prev ? { ...prev, status: "In Consultation" } : null));
      }

      const now = new Date();
      setLastSaved(now);
      toast.success("Consultation record saved!");
      return currentConsultId;
    } catch (err: any) {
      console.error("Save consultation error:", err);
      toast.error("Failed to save consultation", {
        description: err.message || "Please check connection and retry.",
      });
      return null;
    } finally {
      setIsSavingConsult(false);
    }
  };

  // 3. Staging Medication Item Helpers
  const handleAddSuggestedMedicine = (med: MedicineRecord) => {
    // Prevent duplicate addition
    const exists = stagedItems.some(
      (item) =>
        item.medicine_id === med.id || item.medicine_name.toLowerCase() === med.name.toLowerCase(),
    );

    if (exists) {
      toast.warning("Duplicate Medication", {
        description: `${med.name} is already in the prescription list. Edit the existing item instead.`,
      });
      return;
    }

    const newItem: StagedPrescriptionItem = {
      medicine_id: med.id,
      medicine_name: med.name,
      generic_name: med.generic_name,
      strength: med.strength,
      dosage: med.default_dosage,
      frequency: med.default_frequency,
      duration: med.default_duration,
      instructions: med.default_instructions,
    };

    setStagedItems((prev) => [...prev, newItem]);
    toast.success(`Added ${med.name} to prescription`);
  };

  const handleOpenItemEditor = (item: StagedPrescriptionItem, index: number | null) => {
    setEditingItem({
      index,
      item: { ...item },
    });
  };

  const handleSaveItemEdit = () => {
    if (!editingItem) return;

    if (!editingItem.item.medicine_name.trim()) {
      toast.error("Medicine name is required");
      return;
    }

    if (editingItem.index !== null) {
      // Update existing item in staged list
      setStagedItems((prev) => {
        const updated = [...prev];
        updated[editingItem.index!] = editingItem.item;
        return updated;
      });
      toast.info(`Updated ${editingItem.item.medicine_name}`);
    } else {
      // Adding new custom / catalog medicine
      const exists = stagedItems.some(
        (item) => item.medicine_name.toLowerCase() === editingItem.item.medicine_name.toLowerCase(),
      );
      if (exists) {
        toast.warning("Duplicate Medication", {
          description: `${editingItem.item.medicine_name} is already added.`,
        });
        return;
      }
      setStagedItems((prev) => [...prev, editingItem.item]);
      toast.success(`Added ${editingItem.item.medicine_name} to prescription`);
    }

    setEditingItem(null);
    setShowCatalogModal(false);
  };

  const handleRemoveStagedItem = (index: number) => {
    const item = stagedItems[index];
    setStagedItems((prev) => prev.filter((_, i) => i !== index));
    toast.info(`Removed ${item.medicine_name} from prescription`);
  };

  // 4. Save Prescription (Draft or Issued)
  const handlePersistPrescription = async (targetStatus: "Draft" | "Issued") => {
    if (targetStatus === "Issued" && stagedItems.length === 0) {
      toast.error("Add at least one medication before issuing the prescription.");
      return;
    }

    if (!doctor || !appointment || isSavingPrescription) return;

    setIsSavingPrescription(true);

    try {
      // Step 1: Ensure consultation record is saved first
      let activeConsultId = consultationId;
      if (!activeConsultId) {
        activeConsultId = await handleSaveConsultation();
        if (!activeConsultId) {
          throw new Error("Could not initialize consultation before saving prescription.");
        }
      }

      // Step 2: Insert or Update Prescription Header
      const rxHeaderPayload = {
        consultation_id: activeConsultId,
        appointment_id: appointment.id,
        patient_id: appointment.patient_id,
        doctor_id: doctor.id,
        problem: problem.trim(),
        diagnosis: diagnosis.trim(),
        doctor_notes: doctorNotes.trim(),
        follow_up_date: followUpDate || null,
        status: targetStatus,
      };

      let activeRxId = prescriptionId;
      let generatedCode = prescriptionCode;

      if (prescriptionId) {
        const { error: updateRxError } = await supabase
          .from("prescriptions")
          .update(rxHeaderPayload)
          .eq("id", prescriptionId)
          .eq("doctor_id", doctor.id);

        if (updateRxError) throw updateRxError;
      } else {
        const { data: newRx, error: insertRxError } = await supabase
          .from("prescriptions")
          .insert(rxHeaderPayload)
          .select("id, code")
          .single();

        if (insertRxError) throw insertRxError;
        if (newRx) {
          activeRxId = newRx.id;
          generatedCode = newRx.code;
          setPrescriptionId(newRx.id);
          setPrescriptionCode(newRx.code);
        }
      }

      // Step 3: Persist Prescription Items
      if (activeRxId) {
        // Clear previous items to avoid stale data
        await supabase.from("prescription_items").delete().eq("prescription_id", activeRxId);

        if (stagedItems.length > 0) {
          const itemsPayload = stagedItems.map((item) => ({
            prescription_id: activeRxId,
            medicine_id: item.medicine_id || null,
            medicine_name: item.medicine_name.trim(),
            strength: item.strength || "",
            dosage: item.dosage || "",
            frequency: item.frequency || "",
            duration: item.duration || "",
            instructions: item.instructions || "",
          }));

          const { error: itemsError } = await supabase
            .from("prescription_items")
            .insert(itemsPayload);

          if (itemsError) throw itemsError;
        }
      }

      // Step 4: If Issued, mark appointment as Completed
      if (targetStatus === "Issued") {
        await supabase
          .from("appointments")
          .update({ status: "Completed" })
          .eq("id", appointment.id)
          .eq("doctor_id", doctor.id);

        setAppointment((prev) => (prev ? { ...prev, status: "Completed" } : null));
        setPrescriptionStatus("Issued");
        setShowPrintModal(true);
        toast.success("Prescription Issued Successfully!", {
          description: `Prescription #${generatedCode || "RX"} created & appointment completed.`,
        });
      } else {
        setPrescriptionStatus("Draft");
        toast.success("Prescription Draft Saved", {
          description: generatedCode ? `Draft #${generatedCode}` : "Saved to case record.",
        });
      }
    } catch (err: any) {
      console.error("Prescription persistence error:", err);
      toast.error("Failed to save prescription", {
        description: err.message || "An unexpected error occurred while writing to Supabase.",
      });
    } finally {
      setIsSavingPrescription(false);
      setShowIssueConfirmModal(false);
    }
  };

  const isIssued = prescriptionStatus === "Issued";

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary animate-pulse">
            <Stethoscope className="size-6" />
          </div>
          <p className="text-xs font-semibold text-muted-foreground">
            Verifying clinical authorization and loading patient case...
          </p>
        </div>
      </div>
    );
  }

  if (accessDenied || !appointment || !doctor) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="w-full max-w-md rounded-3xl border border-border/80 bg-card p-8 text-center shadow-card space-y-4">
          <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-destructive/10 text-destructive">
            <AlertCircle className="size-6" />
          </div>
          <h2 className="text-xl font-bold text-foreground">
            Appointment Not Found or Access Denied
          </h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            The requested appointment record does not exist or belongs to another doctor. Patient
            clinical data is strictly protected.
          </p>
          <div className="pt-2">
            <Link
              to="/doctor/dashboard"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-secondary/80 px-6 py-2.5 text-xs font-semibold text-foreground hover:bg-secondary"
            >
              <ArrowLeft className="size-3.5" /> Return to Doctor Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const patient = appointment.patients;
  const filteredCatalog = allMedicines.filter(
    (m) =>
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.generic_name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFC] text-foreground selection:bg-primary/20">
      {/* Top Clinical Header */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border/80 bg-background/90 px-4 py-3 backdrop-blur-md sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <Link
            to="/doctor/dashboard"
            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="size-3.5" />
            <span className="hidden sm:inline">Dashboard</span>
          </Link>
          <span className="text-border">|</span>
          <div>
            <span className="text-[0.68rem] font-bold text-primary uppercase tracking-wider">
              Active Consultation
            </span>
            <h1 className="text-sm font-extrabold text-foreground truncate max-w-xs sm:max-w-md">
              Case #{appointment.code} • {patient?.name}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {prescriptionCode && (
            <Badge
              className={cn(
                "font-mono text-xs px-2.5 py-1",
                isIssued
                  ? "bg-success/15 text-success border-success/30"
                  : "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
              )}
            >
              {isIssued ? "Prescription Issued: " : "Draft: "}
              {prescriptionCode}
            </Badge>
          )}

          {prescriptionCode && (
            <Button
              onClick={() => setShowPrintModal(true)}
              size="sm"
              className="gradient-cta rounded-full px-3.5 text-xs font-semibold text-white shadow-soft h-8 gap-1.5 cursor-pointer"
            >
              <Printer className="size-3.5" />
              <span className="hidden sm:inline">Print / PDF Slip</span>
            </Button>
          )}

          <Button
            onClick={() => handleSaveConsultation()}
            disabled={isSavingConsult || isIssued}
            variant="outline"
            className="rounded-full px-4 text-xs font-semibold h-8"
          >
            {isSavingConsult ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Save className="size-3.5" />
            )}
            <span className="hidden sm:inline ml-1.5">Save Consultation</span>
          </Button>
        </div>
      </header>

      {/* Main Clinical Workspace */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto space-y-6">
        {/* ============================================================ */}
        {/* 1. PATIENT RECORD SUMMARY HEADER CARD                        */}
        {/* ============================================================ */}
        <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/60 pb-5">
            <div className="flex items-center gap-4">
              <div className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary font-bold text-lg shrink-0">
                {patient?.name.charAt(0) || "P"}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-extrabold text-foreground">{patient?.name}</h2>
                  <span className="rounded-full bg-secondary px-2.5 py-0.5 text-[0.68rem] font-bold text-muted-foreground">
                    {patient?.code || "N/A"}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {patient?.age ? `${patient.age} years old` : "Age not recorded"} •{" "}
                  {patient?.gender || "Gender unspecified"}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Phone className="size-3.5 text-primary" />
                <span className="font-medium text-foreground">{patient?.phone}</span>
              </div>
              {patient?.email && (
                <div className="flex items-center gap-1.5">
                  <Mail className="size-3.5 text-primary" />
                  <span>{patient.email}</span>
                </div>
              )}
              <Badge variant="outline" className="font-semibold text-primary border-primary/30">
                {appointment.service}
              </Badge>
              <Badge className="bg-secondary text-foreground font-medium">
                {appointment.appointment_type}
              </Badge>
            </div>
          </div>

          {/* Appointment Schedule & Reason Row */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-12 gap-4 text-xs">
            <div className="md:col-span-4 flex items-center gap-3 bg-secondary/30 rounded-2xl p-3 border border-border/40">
              <Clock className="size-4 text-primary shrink-0" />
              <div>
                <p className="text-muted-foreground font-semibold">Appointment Slot</p>
                <p className="font-bold text-foreground">
                  {appointment.appointment_time} on {appointment.appointment_date}
                </p>
              </div>
            </div>

            <div className="md:col-span-8 flex items-start gap-3 bg-secondary/30 rounded-2xl p-3 border border-border/40">
              <Info className="size-4 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-muted-foreground font-semibold">
                  Reason for Visit / Chief Complaint
                </p>
                <p className="text-foreground italic mt-0.5">
                  "{appointment.reason || "General consultation requested."}"
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* 2. CLINICAL CONSULTATION ASSESSMENT FORM                     */}
        {/* ============================================================ */}
        <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-card space-y-6">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-primary uppercase tracking-wider">
              <HeartPulse className="size-3.5" /> Step 1: Clinical Assessment
            </span>
            <h3 className="text-xl font-bold text-foreground mt-1">
              Doctor Examination & Clinical Findings
            </h3>
            <p className="text-xs text-muted-foreground">
              Record diagnosis, observations, and tooth regions for this case.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Primary Problem / Disease Selector */}
            <div className="md:col-span-2 space-y-2">
              <label className="block text-xs font-bold text-foreground">
                Primary Problem / Condition <span className="text-destructive">*</span>
              </label>

              {/* Quick Problem Select Pills */}
              <div className="flex flex-wrap gap-1.5">
                {problemsList.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    disabled={isIssued}
                    onClick={() => setProblem(p.name)}
                    className={cn(
                      "rounded-xl px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer",
                      problem.toLowerCase() === p.name.toLowerCase()
                        ? "gradient-cta text-white shadow-xs"
                        : "border border-border/80 bg-secondary/40 text-muted-foreground hover:bg-secondary hover:text-foreground",
                    )}
                  >
                    {p.name}
                  </button>
                ))}
              </div>

              {/* Custom Problem Input */}
              <input
                type="text"
                disabled={isIssued}
                value={problem}
                onChange={(e) => setProblem(e.target.value)}
                placeholder="Or enter custom condition (e.g. Toothache, Dental Caries, Gingivitis)..."
                className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            {/* Diagnosis / Clinical Assessment */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-foreground">
                Diagnosis & Assessment
              </label>
              <textarea
                rows={2}
                disabled={isIssued}
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                placeholder="Enter detailed diagnosis (e.g. Chronic irreversible pulpitis with apical periodontitis)..."
                className="mt-1.5 w-full rounded-2xl border border-border bg-background p-3.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
              />
            </div>

            {/* Affected Area & Tooth Number */}
            <div>
              <label className="block text-xs font-bold text-foreground">Affected Area</label>
              <input
                type="text"
                disabled={isIssued}
                value={affectedArea}
                onChange={(e) => setAffectedArea(e.target.value)}
                placeholder="e.g. Lower right quadrant, Mandibular molar"
                className="mt-1.5 w-full rounded-2xl border border-border bg-background px-4 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground">
                Tooth Number / Region
              </label>
              <input
                type="text"
                disabled={isIssued}
                value={toothNumber}
                onChange={(e) => setToothNumber(e.target.value)}
                placeholder="e.g. #46, #18, #31"
                className="mt-1.5 w-full rounded-2xl border border-border bg-background px-4 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            {/* Pain Level Scale (1 - 10) */}
            <div className="md:col-span-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-foreground">
                  Reported Pain Level:{" "}
                  <span className="text-primary font-extrabold">{painLevel} / 10</span>
                </label>
                <span className="text-[0.68rem] text-muted-foreground">
                  {painLevel <= 3
                    ? "Mild Discomfort"
                    : painLevel <= 6
                      ? "Moderate Pain"
                      : "Severe Pain"}
                </span>
              </div>
              <div className="mt-2 flex items-center gap-1.5">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                  <button
                    key={num}
                    type="button"
                    disabled={isIssued}
                    onClick={() => setPainLevel(num)}
                    className={cn(
                      "flex-1 rounded-xl py-2 text-center text-xs font-bold transition-all cursor-pointer",
                      painLevel === num
                        ? num >= 7
                          ? "bg-destructive text-white shadow-xs"
                          : num >= 4
                            ? "bg-amber-500 text-white shadow-xs"
                            : "bg-success text-white shadow-xs"
                        : "border border-border/80 bg-secondary/30 text-muted-foreground hover:bg-secondary",
                    )}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            {/* Clinical Observations */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-foreground">
                Clinical Observation & Examination Findings
              </label>
              <textarea
                rows={3}
                disabled={isIssued}
                value={clinicalObservation}
                onChange={(e) => setClinicalObservation(e.target.value)}
                placeholder="e.g. Deep occlusal caries detected on tooth #46, tenderness on vertical percussion, no intraoral swelling..."
                className="mt-1.5 w-full rounded-2xl border border-border bg-background p-3.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
              />
            </div>

            {/* Doctor Clinical Notes */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-foreground">
                Doctor Notes & Treatment Plan
              </label>
              <textarea
                rows={2}
                disabled={isIssued}
                value={doctorNotes}
                onChange={(e) => setDoctorNotes(e.target.value)}
                placeholder="e.g. Single-sitting RCT followed by zirconia crown. Advised oral hygiene..."
                className="mt-1.5 w-full rounded-2xl border border-border bg-background p-3.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
              />
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* 3. MEDICATION DECISION SUPPORT (SUGGESTIONS)                 */}
        {/* ============================================================ */}
        <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-card space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-primary uppercase tracking-wider">
                <Sparkles className="size-3.5" /> Step 2: Medication Decision Support
              </span>
              <h3 className="text-xl font-bold text-foreground mt-1">
                Clinical Suggestions — Doctor Review Required
              </h3>
              <p className="text-xs text-muted-foreground">
                Evidence-based suggestions mapped from dental condition (
                {problem || "None selected"}). Doctor must explicitly review and add to
                prescription.
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isIssued}
              onClick={() => {
                setSearchQuery("");
                setShowCatalogModal(true);
              }}
              className="gap-1.5 rounded-full text-xs self-start sm:self-auto border-primary/30 text-primary hover:bg-primary/10"
            >
              <Search className="size-3.5" />
              <span>Search All Medicines</span>
            </Button>
          </div>

          {loadingSuggestions ? (
            <div className="flex items-center justify-center p-8 text-xs text-muted-foreground gap-2">
              <Loader2 className="size-4 animate-spin text-primary" />
              <span>Retrieving clinical recommendations for {problem}...</span>
            </div>
          ) : suggestedMedicines.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {suggestedMedicines.map((item) => {
                const med = item.medicines;
                const isAlreadyAdded = stagedItems.some(
                  (staged) => staged.medicine_id === med.id || staged.medicine_name === med.name,
                );

                return (
                  <div
                    key={item.id}
                    className="flex flex-col justify-between rounded-2xl border border-border/80 bg-secondary/20 p-4 transition-all hover:border-primary/40 hover:bg-secondary/40"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-bold text-foreground">{med.name}</p>
                          <p className="text-[0.68rem] text-muted-foreground italic">
                            {med.generic_name}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-[0.65rem] font-semibold">
                          {med.form} • {med.strength}
                        </Badge>
                      </div>

                      <div className="space-y-1 rounded-xl bg-background/60 p-2.5 text-[0.7rem] text-muted-foreground">
                        <p>
                          <strong className="text-foreground">Dosage:</strong> {med.default_dosage}
                        </p>
                        <p>
                          <strong className="text-foreground">Frequency:</strong>{" "}
                          {med.default_frequency}
                        </p>
                        <p>
                          <strong className="text-foreground">Duration:</strong>{" "}
                          {med.default_duration}
                        </p>
                        <p>
                          <strong className="text-foreground">Instructions:</strong>{" "}
                          {med.default_instructions}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 pt-2">
                      <Button
                        type="button"
                        size="sm"
                        disabled={isAlreadyAdded || isIssued}
                        onClick={() => handleAddSuggestedMedicine(med)}
                        className={cn(
                          "w-full rounded-xl text-xs font-semibold gap-1.5",
                          isAlreadyAdded
                            ? "bg-secondary text-muted-foreground cursor-default"
                            : "gradient-cta text-white shadow-xs",
                        )}
                      >
                        {isAlreadyAdded ? (
                          <>
                            <Check className="size-3.5" /> Added to Prescription
                          </>
                        ) : (
                          <>
                            <Plus className="size-3.5" /> Add to Prescription
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border/80 bg-secondary/10 p-6 text-center text-xs text-muted-foreground">
              <Pill className="mx-auto size-6 opacity-40 mb-1.5" />
              {problem ? (
                <p>
                  No specific clinical suggestions are mapped for "{problem}". You can search and
                  select approved medicines from the catalog above.
                </p>
              ) : (
                <p>
                  Select a Primary Problem above to view clinically mapped medications, or use
                  "Search All Medicines".
                </p>
              )}
            </div>
          )}
        </div>

        {/* ============================================================ */}
        {/* 4. STAGED PRESCRIPTION BUILDER TABLE & ACTIONS               */}
        {/* ============================================================ */}
        <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-card space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-4">
            <div>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-primary uppercase tracking-wider">
                <FileText className="size-3.5" /> Step 3: Prescription Builder
              </span>
              <h3 className="text-xl font-bold text-foreground mt-0.5">
                Staged Patient Prescription ({stagedItems.length}{" "}
                {stagedItems.length === 1 ? "Item" : "Items"})
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isIssued}
                onClick={() =>
                  handleOpenItemEditor(
                    {
                      medicine_id: null,
                      medicine_name: "",
                      strength: "",
                      dosage: "1 tablet",
                      frequency: "Twice daily",
                      duration: "3 days",
                      instructions: "Take after food.",
                    },
                    null,
                  )
                }
                className="rounded-full text-xs gap-1 h-8"
              >
                <Plus className="size-3.5" /> Custom Medicine
              </Button>
            </div>
          </div>

          {/* Staged Items Table */}
          {stagedItems.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border/80 bg-secondary/10 p-8 text-center text-xs text-muted-foreground space-y-2">
              <Pill className="mx-auto size-8 opacity-40" />
              <p className="font-semibold text-foreground">No medications added yet.</p>
              <p>
                Add medications from the clinical suggestions above or search the approved hospital
                catalog.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-border/60 bg-secondary/40 text-muted-foreground font-bold uppercase tracking-wider text-[0.68rem]">
                  <tr>
                    <th className="py-3 px-4">Medicine & Strength</th>
                    <th className="py-3 px-4">Dosage</th>
                    <th className="py-3 px-4">Frequency</th>
                    <th className="py-3 px-4">Duration</th>
                    <th className="py-3 px-4">Instructions</th>
                    {!isIssued && <th className="py-3 px-4 text-right">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {stagedItems.map((item, idx) => (
                    <tr key={idx} className="hover:bg-secondary/20 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-foreground">
                        <div>{item.medicine_name}</div>
                        {item.strength && (
                          <span className="text-[0.68rem] text-primary font-normal">
                            {item.strength}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-foreground">{item.dosage}</td>
                      <td className="py-3.5 px-4 text-foreground">{item.frequency}</td>
                      <td className="py-3.5 px-4 text-foreground">{item.duration}</td>
                      <td className="py-3.5 px-4 text-muted-foreground italic">
                        {item.instructions || "—"}
                      </td>
                      {!isIssued && (
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenItemEditor(item, idx)}
                              className="rounded-lg p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
                              title="Edit Item"
                            >
                              <Edit2 className="size-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveStagedItem(idx)}
                              className="rounded-lg p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                              title="Remove Item"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Follow-up Date Input */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-border/60 text-xs">
            <div>
              <label className="block text-xs font-bold text-foreground">
                Follow-up Date <span className="text-muted-foreground font-normal">(Optional)</span>
              </label>
              <input
                type="date"
                disabled={isIssued}
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
                className="mt-1.5 w-full rounded-2xl border border-border bg-background px-4 py-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>

          {/* Prescription Confirmation & Persistence Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-border/60 pt-6">
            <Link
              to="/doctor/dashboard"
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              ← Return to Dashboard
            </Link>

            <div className="flex items-center gap-3">
              {!isIssued && (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isSavingPrescription}
                    onClick={() => handlePersistPrescription("Draft")}
                    className="rounded-full px-5 py-2.5 text-xs font-semibold h-9"
                  >
                    {isSavingPrescription ? (
                      <Loader2 className="size-3.5 animate-spin mr-1.5" />
                    ) : (
                      <Save className="size-3.5 mr-1.5" />
                    )}
                    Save Prescription Draft
                  </Button>

                  <Button
                    type="button"
                    disabled={isSavingPrescription || stagedItems.length === 0}
                    onClick={() => setShowIssueConfirmModal(true)}
                    className="gradient-cta rounded-full px-6 py-2.5 text-xs font-semibold text-white shadow-soft h-9 min-w-[160px]"
                  >
                    <Send className="size-3.5 mr-1.5" />
                    Issue Prescription
                  </Button>
                </>
              )}

              {isIssued && (
                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    onClick={() => setShowPrintModal(true)}
                    className="gradient-cta rounded-full px-6 py-2.5 text-xs font-semibold text-white shadow-soft h-9 gap-1.5 cursor-pointer"
                  >
                    <Printer className="size-3.5" />
                    <span>Print / Download Prescription Slip</span>
                  </Button>
                  <div className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-success bg-success/10 px-3.5 py-2 rounded-full border border-success/20">
                    <CheckCircle2 className="size-3.5" />
                    <span>Finalized & Issued</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* ============================================================ */}
      {/* MEDICINE CATALOG SEARCH MODAL                                */}
      {/* ============================================================ */}
      {showCatalogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-fade-up">
          <div className="w-full max-w-2xl rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-card space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div>
                <span className="text-[0.68rem] font-bold text-primary uppercase tracking-wider">
                  Hospital Approved Formulary
                </span>
                <h3 className="text-lg font-extrabold text-foreground">Select Medication</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCatalogModal(false)}
                className="rounded-xl p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="absolute top-3 left-3.5 size-4 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by brand name or generic active ingredient..."
                className="w-full rounded-2xl border border-border bg-background pl-10 pr-4 py-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            {/* Catalog List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {filteredCatalog.length === 0 ? (
                <p className="p-8 text-center text-xs text-muted-foreground">
                  No medicines found matching "{searchQuery}".
                </p>
              ) : (
                filteredCatalog.map((med) => (
                  <div
                    key={med.id}
                    onClick={() => {
                      handleOpenItemEditor(
                        {
                          medicine_id: med.id,
                          medicine_name: med.name,
                          generic_name: med.generic_name,
                          strength: med.strength,
                          dosage: med.default_dosage,
                          frequency: med.default_frequency,
                          duration: med.default_duration,
                          instructions: med.default_instructions,
                        },
                        null,
                      );
                    }}
                    className="flex items-center justify-between rounded-2xl border border-border/60 bg-secondary/20 p-3.5 hover:bg-secondary/50 hover:border-primary/40 transition-colors cursor-pointer"
                  >
                    <div>
                      <p className="text-xs font-bold text-foreground">{med.name}</p>
                      <p className="text-[0.68rem] text-muted-foreground italic">
                        {med.generic_name}
                      </p>
                      <p className="text-[0.65rem] text-primary mt-0.5 font-medium">
                        Default: {med.default_dosage} • {med.default_frequency} •{" "}
                        {med.default_duration}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {med.form} • {med.strength}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* ITEM CONFIGURATION / CUSTOMIZER MODAL                        */}
      {/* ============================================================ */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-fade-up">
          <div className="w-full max-w-lg rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-card space-y-5">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div>
                <span className="text-[0.68rem] font-bold text-primary uppercase tracking-wider">
                  Prescription Configuration
                </span>
                <h3 className="text-lg font-extrabold text-foreground">
                  {editingItem.index !== null ? "Edit Medication" : "Add Medication"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="rounded-xl p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-bold text-foreground">Medicine Name *</label>
                <input
                  type="text"
                  value={editingItem.item.medicine_name}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      item: { ...editingItem.item, medicine_name: e.target.value },
                    })
                  }
                  placeholder="e.g. Amoxicillin, Ibuprofen"
                  className="mt-1 w-full rounded-2xl border border-border bg-background px-4 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-foreground">Strength</label>
                  <input
                    type="text"
                    value={editingItem.item.strength}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        item: { ...editingItem.item, strength: e.target.value },
                      })
                    }
                    placeholder="e.g. 500 mg, 400 mg"
                    className="mt-1 w-full rounded-2xl border border-border bg-background px-4 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground">Dosage</label>
                  <input
                    type="text"
                    value={editingItem.item.dosage}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        item: { ...editingItem.item, dosage: e.target.value },
                      })
                    }
                    placeholder="e.g. 1 tablet, 5 ml"
                    className="mt-1 w-full rounded-2xl border border-border bg-background px-4 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-foreground">Frequency</label>
                  <input
                    type="text"
                    value={editingItem.item.frequency}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        item: { ...editingItem.item, frequency: e.target.value },
                      })
                    }
                    placeholder="e.g. Twice daily, Thrice daily"
                    className="mt-1 w-full rounded-2xl border border-border bg-background px-4 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground">Duration</label>
                  <input
                    type="text"
                    value={editingItem.item.duration}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        item: { ...editingItem.item, duration: e.target.value },
                      })
                    }
                    placeholder="e.g. 3 days, 5 days"
                    className="mt-1 w-full rounded-2xl border border-border bg-background px-4 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground">Instructions</label>
                <input
                  type="text"
                  value={editingItem.item.instructions}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      item: { ...editingItem.item, instructions: e.target.value },
                    })
                  }
                  placeholder="e.g. Take after food. Avoid dairy for 2 hours."
                  className="mt-1 w-full rounded-2xl border border-border bg-background px-4 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border/60">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditingItem(null)}
                className="rounded-full text-xs px-5"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSaveItemEdit}
                className="gradient-cta rounded-full text-xs px-6 text-white font-semibold shadow-soft"
              >
                {editingItem.index !== null ? "Update Item" : "Add to Prescription"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* ISSUE CONFIRMATION MODAL                                     */}
      {/* ============================================================ */}
      {showIssueConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-fade-up">
          <div className="w-full max-w-md rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-card space-y-4">
            <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary">
              <Send className="size-6" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-bold text-foreground">Issue Final Prescription?</h3>
              <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                Issuing will finalize {stagedItems.length} prescribed medication items, generate an
                official RX code, and mark this consultation appointment as{" "}
                <strong>Completed</strong>.
              </p>
            </div>

            <div className="rounded-2xl bg-secondary/40 p-3.5 text-xs text-muted-foreground border border-border/40 space-y-1">
              <p>
                <strong className="text-foreground">Patient:</strong> {patient?.name} (
                {patient?.code})
              </p>
              <p>
                <strong className="text-foreground">Condition:</strong> {problem}
              </p>
              <p>
                <strong className="text-foreground">Total Medications:</strong> {stagedItems.length}
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                disabled={isSavingPrescription}
                onClick={() => setShowIssueConfirmModal(false)}
                className="rounded-full text-xs px-5"
              >
                Cancel
              </Button>
              <Button
                type="button"
                disabled={isSavingPrescription}
                onClick={() => handlePersistPrescription("Issued")}
                className="gradient-cta rounded-full text-xs px-6 text-white font-semibold shadow-soft"
              >
                {isSavingPrescription ? (
                  <span className="flex items-center gap-1.5">
                    <Loader2 className="size-3.5 animate-spin" /> Issuing...
                  </span>
                ) : (
                  <span>Confirm & Issue Prescription</span>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* PRINTABLE PRESCRIPTION VIEW MODAL                            */}
      {/* ============================================================ */}
      {showPrintModal && doctor && appointment && (
        <PrescriptionPrintView
          doctor={doctor}
          patient={patient}
          appointment={appointment}
          consultation={{
            problem,
            diagnosis,
            clinical_observation: clinicalObservation,
            doctor_notes: doctorNotes,
            affected_area: affectedArea,
            tooth_number: toothNumber,
            pain_level: painLevel,
          }}
          prescription={{
            code: prescriptionCode || "DRAFT-RX",
            status: prescriptionStatus,
            follow_up_date: followUpDate || null,
          }}
          items={stagedItems}
          onClose={() => setShowPrintModal(false)}
        />
      )}
    </div>
  );
}
