"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { appointmentApi, patientApi, doctorApi } from "@/api/clinic";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import axios from "axios";

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

  const { data: patientsData } = useQuery({
    queryKey: ["patients-list"],
    queryFn: () => patientApi.list({ limit: 100 }),
  });
  const { data: doctorsData } = useQuery({
    queryKey: ["doctors"],
    queryFn: doctorApi.list,
  });

  const createMutation = useMutation({
    mutationFn: appointmentApi.create,
    onSuccess: () => router.push("/dashboard/appointments"),
    onError: (err) => {
      if (axios.isAxiosError(err)) {
        alert(err.response?.data?.message || "Failed to book");
      }
    },
  });

  useEffect(() => {
    if (patientIdParam) setPatientId(patientIdParam);
  }, [patientIdParam]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctorId) {
      alert("Please select a doctor");
      return;
    }
    if (!date) {
      alert("Please select a date");
      return;
    }
    if (!timeSlot) {
      alert("Please select a time slot");
      return;
    }
    if (!isPatient && !patientId) {
      alert("Please select a patient");
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
    <div>
      <div className="mb-6 flex items-center gap-4">
        <Link href="/dashboard/appointments" className="text-teal-600 hover:underline">← Back</Link>
        <h1 className="text-2xl font-bold">Book Appointment</h1>
      </div>

      <form onSubmit={handleSubmit} className="mx-auto max-w-lg space-y-4 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800/50">
        {!isPatient && (
          <div>
            <label className="mb-1 block text-sm font-medium">Patient *</label>
            <select required value={patientId} onChange={(e) => setPatientId(e.target.value)} className="input-field">
              <option value="">Select patient</option>
              {patients.map((p) => (
                <option key={p._id} value={p._id}>{p.name} – {p.contact}</option>
              ))}
            </select>
          </div>
        )}
        {isPatient && (
          <p className="rounded-lg bg-slate-100 py-2 text-sm text-slate-600 dark:bg-slate-800 dark:text-slate-400">
            Booking for yourself. Ensure your account is linked to a patient record.
          </p>
        )}
        <div>
          <label className="mb-1 block text-sm font-medium">Doctor *</label>
          <select required value={doctorId} onChange={(e) => setDoctorId(e.target.value)} className="input-field">
            <option value="">Select doctor</option>
            {doctors.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Date *</label>
            <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Time *</label>
            <select required value={timeSlot} onChange={(e) => setTimeSlot(e.target.value)} className="input-field">
              <option value="">Select time</option>
              {TIME_SLOTS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Reason</label>
          <input type="text" value={reason} onChange={(e) => setReason(e.target.value)} className="input-field" />
        </div>
        <div className="flex gap-3">
          <button type="submit" disabled={createMutation.isPending} className="btn-primary">
            {createMutation.isPending ? "Booking..." : "Book"}
          </button>
          <Link href="/dashboard/appointments" className="btn-secondary">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
