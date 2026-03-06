"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { appointmentApi, patientApi, doctorApi } from "@/api/clinic";
import { useAuth } from "@/context/AuthContext";
import RoleGuard from "@/components/RoleGuard";
import Link from "next/link";
import axios from "axios";
import { toast } from "react-hot-toast";

const TIME_SLOTS = ["09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00"];

export default function NewAppointmentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const patientIdParam = searchParams.get("patientId");
  const isPatient = user?.role === "patient";

  const [patientId, setPatientId] = useState(patientIdParam || "");
  const [doctorId, setDoctorId] = useState("");
  const [date, setDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("");
  const [reason, setReason] = useState("");

  const allowedRoles = ["admin", "doctor", "receptionist", "patient", "nurse", "pharmacist", "lab_technician"];

  const { data: patientsData, isLoading: patientsLoading } = useQuery({
    queryKey: ["patients-list"],
    queryFn: () => patientApi.list({ limit: 100 }),
    enabled: allowedRoles.includes(user?.role || "") && !isPatient,
  });

  const { data: doctorsData, isLoading: doctorsLoading } = useQuery({
    queryKey: ["doctors"],
    queryFn: doctorApi.list,
    enabled: allowedRoles.includes(user?.role || ""),
  });

  useEffect(() => {
    if (doctorsData?.doctors && isPatient === false && user?.role === "doctor" && !doctorId) {
      const exists = doctorsData.doctors.find(d => d.id === user.id);
      if (exists) setDoctorId(user.id);
    }
  }, [doctorsData, isPatient, user, doctorId]);

  const createMutation = useMutation({
    mutationFn: appointmentApi.create,
    onSuccess: () => {
      toast.success("Appointment booked successfully!");
      router.push("/dashboard/appointments");
    },
    onError: (err) => {
      if (axios.isAxiosError(err)) {
        toast.error(err.response?.data?.message || "Failed to book");
      } else {
        toast.error("An unexpected error occurred");
      }
    },
  });

  useEffect(() => {
    if (patientIdParam) setPatientId(patientIdParam);
  }, [patientIdParam]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctorId) {
      toast.error("Please select a doctor");
      return;
    }
    if (!date) {
      toast.error("Please select a date");
      return;
    }
    if (!timeSlot) {
      toast.error("Please select a time slot");
      return;
    }
    if (!isPatient && !patientId) {
      toast.error("Please select a patient");
      return;
    }

    const payload = { doctorId, date, timeSlot, reason };
    if (!isPatient) {
      (payload as Record<string, string>).patientId = patientId;
    }
    createMutation.mutate(payload as Parameters<typeof appointmentApi.create>[0]);
  };

  const patients = patientsData?.patients || [];
  const doctors = doctorsData?.doctors || [];

  return (
    <RoleGuard roles={allowedRoles}>
      <div className="p-8">
        <div className="mb-8 flex items-center gap-4">
          <Link href="/dashboard/appointments" className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-gray-200 text-gray-400 hover:text-emerald-600 hover:border-emerald-200 transition-all shadow-sm">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Schedule Consultation</h1>
            <p className="text-gray-500 font-medium">Book a new meeting slot with a medical practitioner.</p>
          </div>
        </div>

        <div className="max-w-2xl">
          <form onSubmit={handleSubmit} className="card-premium p-8 space-y-6">
            {!isPatient && (
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Select Patient *</label>
                <select
                  required
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  className="input-field py-3 font-bold"
                  disabled={patientsLoading}
                >
                  <option value="">{patientsLoading ? "Searching Patient Database..." : "Choose a Patient"}</option>
                  {patients.map((p) => (
                    <option key={p._id} value={p._id}>{p.name} {p.contact !== "n/a" ? `(${p.contact})` : ""}</option>
                  ))}
                  {!patientsLoading && patients.length === 0 && (
                    <option value="" disabled>No active patients found</option>
                  )}
                </select>
              </div>
            )}

            {isPatient && (
              <div className="ai-panel border-none bg-emerald-50/50">
                <div className="flex items-center gap-2 mb-1">
                  <span className="ai-badge bg-emerald-600 text-white">READY TO BOOK</span>
                  <p className="text-sm font-bold text-emerald-800">Booking for yourself</p>
                </div>
                <p className="text-xs text-emerald-700/80">Your profile details will be automatically linked to this session.</p>
              </div>
            )}

            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Choose Practitioner *</label>
              <select
                required
                value={doctorId}
                onChange={(e) => setDoctorId(e.target.value)}
                className="input-field py-3 font-bold"
                disabled={doctorsLoading}
              >
                <option value="">{doctorsLoading ? "Accessing Staff Records..." : "Select Doctor"}</option>
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>Dr. {d.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Consultation Date *</label>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="input-field py-3 font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Time Slot *</label>
                <select
                  required
                  value={timeSlot}
                  onChange={(e) => setTimeSlot(e.target.value)}
                  className="input-field py-3 font-bold"
                >
                  <option value="">Select Time</option>
                  {TIME_SLOTS.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Reason for Visit</label>
              <textarea
                placeholder="Briefly describe primary symptoms or objective..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="input-field py-3 min-h-[100px]"
                rows={3}
              />
            </div>

            <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row gap-4">
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="btn-primary flex-1 py-4 text-base shadow-lg shadow-emerald-600/20"
              >
                {createMutation.isPending ? "Syncing with Schedule..." : "Confirm Appointment"}
              </button>
              <Link
                href="/dashboard/appointments"
                className="btn-secondary px-8 py-4 text-center"
              >
                Cancel
              </Link>
            </div>
          </form>

          <section className="mt-8 ai-panel">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 shadow-sm">
                <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-emerald-900">AI Scheduling Note</h3>
            </div>
            <p className="text-emerald-800 text-sm leading-relaxed">
              Mornings usually have higher throughput. If the patient requires extensive diagnostics, consider booking before 11:00 AM.
            </p>
          </section>
        </div>
      </div>
    </RoleGuard>
  );
}
