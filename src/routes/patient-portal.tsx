import { useState, useRef } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { PrescriptionPrintView } from "@/components/clinical/PrescriptionPrintView";
import { PatientPortalLanding } from "@/components/patient/PatientPortalLanding";
import { PrescriptionHeader } from "@/components/patient/PrescriptionHeader";
import { PatientInfoCard } from "@/components/patient/PatientInfoCard";
import { ClinicalSummaryCard } from "@/components/patient/ClinicalSummaryCard";
import { MedicationList } from "@/components/patient/MedicationList";
import { FollowUpCard } from "@/components/patient/FollowUpCard";
import { PrescriptionActions } from "@/components/patient/PrescriptionActions";
import { ImportantInformation } from "@/components/patient/ImportantInformation";
import { PatientSupport } from "@/components/patient/PatientSupport";
import { MOCK_PRESCRIPTION_DATA } from "@/components/patient/portal-mock-data";

export const Route = createFileRoute("/patient-portal")({
  component: PatientPortalPage,
});

function PatientPortalPage() {
  const [showDashboard, setShowDashboard] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const dashboardRef = useRef<HTMLDivElement>(null);

  const data = MOCK_PRESCRIPTION_DATA;

  const handleSearch = (_patientCode: string, _appointmentCode: string) => {
    setIsSearching(true);

    // Simulate network delay for demo
    setTimeout(() => {
      setIsSearching(false);
      setShowDashboard(true);
      toast.success("Prescription found successfully!");

      // Scroll to dashboard top after transition
      setTimeout(() => {
        dashboardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }, 1200);
  };

  const handleBackToPortal = () => {
    setShowDashboard(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePrint = () => {
    setShowPrintModal(true);
  };

  const handleDownloadPDF = () => {
    toast.info("PDF download is ready for integration.", {
      description: "Backend PDF generation will be implemented in the next phase.",
    });
  };

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground selection:bg-primary/20">
      <Navbar />

      <main className="flex-1">
        {!showDashboard ? (
          /* =============================================================== */
          /* LANDING STATE — Prescription Search                              */
          /* =============================================================== */
          <PatientPortalLanding onSubmit={handleSearch} isSearching={isSearching} />
        ) : (
          /* =============================================================== */
          /* DASHBOARD STATE — Prescription Result                           */
          /* =============================================================== */
          <div
            ref={dashboardRef}
            className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 animate-fade-up space-y-6"
          >
            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
              <Link
                to="/patient-portal"
                onClick={(e) => {
                  e.preventDefault();
                  handleBackToPortal();
                }}
                className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-secondary transition-colors cursor-pointer"
                aria-label="Back to portal"
              >
                <ArrowLeft className="size-3.5" />
                Back to Portal
              </Link>

              <PrescriptionActions onPrint={handlePrint} onDownload={handleDownloadPDF} />
            </div>

            {/* Prescription Header */}
            <section aria-label="Prescription details">
              <PrescriptionHeader
                prescription={data.prescription}
                doctor={data.doctor}
              />
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column — Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Clinical Summary */}
                <section aria-label="Clinical summary">
                  <ClinicalSummaryCard summary={data.clinical_summary} />
                </section>

                {/* Medications */}
                <section aria-label="Your medications">
                  <MedicationList items={data.medications} />
                </section>
              </div>

              {/* Right Column — Sidebar */}
              <div className="space-y-6">
                {/* Patient Info */}
                <section aria-label="Patient information">
                  <PatientInfoCard
                    patient={data.patient}
                    appointment={data.appointment}
                  />
                </section>

                {/* Follow-Up */}
                <section aria-label="Follow-up information">
                  <FollowUpCard
                    followUpDate={data.prescription.follow_up_date}
                    onBackToPortal={handleBackToPortal}
                  />
                </section>

                {/* Important Information */}
                <ImportantInformation />

                {/* Patient Support */}
                <PatientSupport />
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />

      {/* Print Modal — renders the official A4 prescription view */}
      {showPrintModal && (
        <PrescriptionPrintView
          doctor={{
            name: data.doctor.name,
            qualification: data.doctor.qualification,
            specialization: data.doctor.specialization,
            registration_number: data.doctor.registration_number,
          }}
          patient={{
            code: data.patient.code,
            name: data.patient.name,
            age: data.patient.age,
            gender: data.patient.gender,
            phone: data.patient.phone,
            email: data.patient.email,
          }}
          appointment={{
            code: data.appointment.code,
            appointment_date: data.appointment.date,
            appointment_time: data.appointment.time,
            service: data.appointment.service,
            reason: "",
          }}
          consultation={{
            problem: data.clinical_summary.problem,
            diagnosis: data.clinical_summary.diagnosis,
            clinical_observation: `${data.clinical_summary.chief_complaint}. Affected area: ${data.clinical_summary.affected_area}. Pain level: ${data.clinical_summary.pain_level}/10.`,
            doctor_notes: data.clinical_summary.doctor_notes,
            affected_area: data.clinical_summary.affected_area,
          }}
          prescription={{
            code: data.prescription.code,
            status: data.prescription.status,
            follow_up_date: data.prescription.follow_up_date,
          }}
          items={data.medications.map((m) => ({
            medicine_name: m.medicine_name,
            strength: m.strength,
            dosage: m.dosage,
            frequency: m.frequency,
            duration: m.duration,
            instructions: m.instructions,
          }))}
          onClose={() => setShowPrintModal(false)}
        />
      )}
    </div>
  );
}
