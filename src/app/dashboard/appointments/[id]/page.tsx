"use client";

import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { appointmentApi, Appointment } from "@/api/clinic";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";

export default function AppointmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<Appointment["status"] | "">("");

  const { data: appointment, isLoading } = useQuery({
    queryKey: ["appointment", id],
    queryFn: () => appointmentApi.get(id!),
    enabled: !!id,
  });

  const updateMutation = useMutation({
    mutationFn: (data: { status: Appointment["status"] }) => appointmentApi.update(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointment", id] });
      toast.success("Appointment updated successfully!");
      setStatus("");
    },
    onError: (err) => {
      if (axios.isAxiosError(err)) {
        toast.error(err.response?.data?.message || "Failed to update");
      } else {
        toast.error("An unexpected error occurred");
      }
    },
  });

  const canUpdate = ["admin", "doctor", "receptionist", "nurse"].includes(user?.role || "");

  if (isLoading || !appointment) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
      </div>
    );
  }

  const patient = typeof appointment.patientId === "object" ? appointment.patientId : null;
  const doctor = typeof appointment.doctorId === "object" ? appointment.doctorId : null;

  return (
    <div className="p-8">
      {/* Breadcrumbs */}
      <div className="mb-8 flex items-center gap-4">
        <Link href="/dashboard/appointments" className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-gray-200 text-gray-400 hover:text-emerald-600 hover:border-emerald-200 transition-all shadow-sm">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Appointment Details</h1>
          <p className="text-gray-500 font-medium">Record ID: #{id?.slice(0, 8).toUpperCase()}</p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Detail Card */}
        <div className="lg:col-span-2 space-y-8">
          <div className="card-premium p-8">
            <div className="flex items-center justify-between mb-8 border-b border-gray-100 pb-6">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Consultation Session</h3>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Scheduled Event</p>
                </div>
              </div>
              <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-black uppercase tracking-wider shadow-sm ${appointment.status === "completed" ? "bg-emerald-100 text-emerald-800" :
                  appointment.status === "cancelled" ? "bg-red-100 text-red-800" :
                    appointment.status === "confirmed" ? "bg-blue-100 text-blue-800" :
                      "bg-amber-100 text-amber-800"
                }`}>
                <span className={`mr-2 h-2 w-2 rounded-full ${appointment.status === "completed" ? "bg-emerald-600" :
                    appointment.status === "cancelled" ? "bg-red-600" :
                      appointment.status === "confirmed" ? "bg-blue-600" :
                        "bg-amber-600"
                  }`} />
                {appointment.status}
              </span>
            </div>

            <div className="grid gap-8 sm:grid-cols-2">
              <InfoSection label="Patient Information">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-gray-50 flex items-center justify-center font-bold text-gray-400 border border-gray-100">
                    {patient?.name?.charAt(0) || "P"}
                  </div>
                  <div className="font-bold text-gray-900">{patient?.name ?? "—"}</div>
                </div>
              </InfoSection>

              <InfoSection label="Practitioner">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-emerald-50 flex items-center justify-center font-bold text-emerald-600 border border-emerald-100">
                    D
                  </div>
                  <div className="font-bold text-gray-900">Dr. {doctor?.name ?? "—"}</div>
                </div>
              </InfoSection>

              <InfoSection label="Date & Time">
                <div className="space-y-1">
                  <div className="text-sm font-bold text-gray-900">{new Date(appointment.date).toLocaleDateString([], { dateStyle: 'full' })}</div>
                  <div className="text-sm font-black text-emerald-600">{appointment.timeSlot}</div>
                </div>
              </InfoSection>

              <InfoSection label="Symptoms / Reason">
                <p className="text-sm text-gray-600 leading-relaxed font-medium">
                  {appointment.reason || "No specific reason provided for this consultation."}
                </p>
              </InfoSection>
            </div>
          </div>
        </div>

        {/* Sidebar Controls */}
        <div className="space-y-8">
          {canUpdate && (
            <section className="card-premium p-6">
              <h4 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Manage Status</h4>
              <div className="space-y-4">
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as Appointment["status"] | "")}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-emerald-600 focus:bg-white transition-all font-bold"
                >
                  <option value="">Update status...</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <button
                  onClick={() => status && updateMutation.mutate({ status })}
                  disabled={!status || updateMutation.isPending}
                  className="btn-primary w-full py-3 shadow-lg shadow-emerald-600/20"
                >
                  {updateMutation.isPending ? "Updating..." : "Confirm Status Change"}
                </button>
              </div>
            </section>
          )}

          <section className="ai-panel">
            <div className="flex items-center gap-2 mb-3">
              <span className="ai-badge">AI ASSISTANT</span>
              <h4 className="text-sm font-bold text-emerald-900">Smart Preview</h4>
            </div>
            <p className="text-xs text-emerald-800/80 leading-loose">
              Based on the patient's record, this session is likely for a routine follow-up. Ensure to review previous lab results before the meeting.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

function InfoSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</h4>
      <div className="mt-1">{children}</div>
    </div>
  );
}
