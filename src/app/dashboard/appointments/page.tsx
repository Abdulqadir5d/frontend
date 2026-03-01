"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { appointmentApi } from "@/api/clinic";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

export default function AppointmentsPage() {
  const { user } = useAuth();
  const [status, setStatus] = useState<string>("");
  const [date, setDate] = useState("");
  const [page, setPage] = useState(1);

  const params: Record<string, string | number> = { page, limit: 15 };
  if (user?.role === "doctor") params.doctorId = user.id;
  if (user?.role === "patient" && user?.patientId) params.patientId = user.patientId;
  if (status) params.status = status;
  if (date) params.date = date;

  const { data, isLoading } = useQuery({
    queryKey: ["appointments", params],
    queryFn: () => appointmentApi.list(params),
  });

  const canCreate = ["admin", "doctor", "receptionist", "patient"].includes(user?.role || "");

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Appointments</h1>
        {canCreate && (
          <Link
            href="/dashboard/appointments/new"
            className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
          >
            Book Appointment
          </Link>
        )}
      </div>

      <div className="mb-4 flex flex-wrap gap-3">
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800"
        >
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <input
          type="date"
          value={date}
          onChange={(e) => { setDate(e.target.value); setPage(1); }}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800"
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-teal-500 border-t-transparent" />
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800/50">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
                <th className="px-4 py-3 text-left text-sm font-medium">Patient</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Doctor</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Date</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Time</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                <th className="px-4 py-3 text-right text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(data?.appointments || []).map((a) => {
                const patient = typeof a.patientId === "object" ? a.patientId : null;
                const doctor = typeof a.doctorId === "object" ? a.doctorId : null;
                return (
                  <tr key={a._id} className="border-b border-slate-100 hover:bg-slate-50 dark:border-slate-700/50 dark:hover:bg-slate-800/50">
                    <td className="px-4 py-3">{patient?.name ?? "—"}</td>
                    <td className="px-4 py-3">{doctor?.name ?? "—"}</td>
                    <td className="px-4 py-3">{new Date(a.date).toLocaleDateString()}</td>
                    <td className="px-4 py-3">{a.timeSlot}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded px-2 py-0.5 text-xs capitalize ${
                        a.status === "completed" ? "bg-green-100 text-green-800 dark:bg-green-900/30" :
                        a.status === "cancelled" ? "bg-red-100 text-red-800 dark:bg-red-900/30" :
                        a.status === "confirmed" ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30" :
                        "bg-amber-100 text-amber-800 dark:bg-amber-900/30"
                      }`}>
                        {a.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/dashboard/appointments/${a._id}`} className="text-sm font-medium text-teal-600 hover:underline">
                        View
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {(!data?.appointments || data.appointments.length === 0) && (
            <p className="py-8 text-center text-slate-500">No appointments found</p>
          )}
        </div>
      )}
    </div>
  );
}
