"use client";

import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { appointmentApi } from "@/api/clinic";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { useState } from "react";
import axios from "axios";

export default function AppointmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState("");

  const { data: appointment, isLoading } = useQuery({
    queryKey: ["appointment", id],
    queryFn: () => appointmentApi.get(id!),
    enabled: !!id,
  });

  const updateMutation = useMutation({
    mutationFn: (data: { status: string }) => appointmentApi.update(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointment", id] });
      setStatus("");
    },
    onError: (err) => {
      if (axios.isAxiosError(err)) {
        alert(err.response?.data?.message || "Failed to update");
      }
    },
  });

  const canUpdate = ["admin", "doctor", "receptionist"].includes(user?.role || "");

  if (isLoading || !appointment) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-teal-500 border-t-transparent" />
      </div>
    );
  }

  const patient = typeof appointment.patientId === "object" ? appointment.patientId : null;
  const doctor = typeof appointment.doctorId === "object" ? appointment.doctorId : null;

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <Link href="/dashboard/appointments" className="text-teal-600 hover:underline">← Appointments</Link>
        <h1 className="text-2xl font-bold">Appointment Details</h1>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800/50">
        <dl className="space-y-3">
          <div><dt className="text-sm text-slate-500">Patient</dt><dd className="font-medium">{patient?.name ?? "—"}</dd></div>
          <div><dt className="text-sm text-slate-500">Doctor</dt><dd>{doctor?.name ?? "—"}</dd></div>
          <div><dt className="text-sm text-slate-500">Date</dt><dd>{new Date(appointment.date).toLocaleDateString()}</dd></div>
          <div><dt className="text-sm text-slate-500">Time</dt><dd>{appointment.timeSlot}</dd></div>
          <div><dt className="text-sm text-slate-500">Status</dt><dd><span className={`rounded px-2 py-0.5 text-sm capitalize ${
            appointment.status === "completed" ? "bg-green-100 text-green-800" :
            appointment.status === "cancelled" ? "bg-red-100 text-red-800" :
            appointment.status === "confirmed" ? "bg-blue-100 text-blue-800" :
            "bg-amber-100 text-amber-800"
          }`}>{appointment.status}</span></dd></div>
          {appointment.reason && <div><dt className="text-sm text-slate-500">Reason</dt><dd>{appointment.reason}</dd></div>}
        </dl>

        {canUpdate && (
          <div className="mt-6 flex items-center gap-2">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="rounded border border-slate-300 px-3 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-800"
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
              className="rounded bg-teal-600 px-3 py-1.5 text-sm text-white hover:bg-teal-700 disabled:opacity-50"
            >
              Update
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
