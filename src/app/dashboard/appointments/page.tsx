"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { appointmentApi } from "@/api/clinic";
import { useAuth } from "@/context/AuthContext";
import RoleGuard from "@/components/RoleGuard";
import Link from "next/link";

export default function AppointmentsPage() {
  const { user } = useAuth();
  const [status, setStatus] = useState<string>("");
  const [date, setDate] = useState("");
  const [page, setPage] = useState(1);

  const allowedRoles = ["admin", "doctor", "receptionist", "patient", "nurse", "pharmacist", "lab_technician"];
  const isAllowed = user?.role && allowedRoles.includes(user.role);

  const params: Record<string, string | number> = { page, limit: 15 };
  if (user?.role === "doctor") params.doctorId = user.id;
  if (user?.role === "patient" && user?.patientId) params.patientId = user.patientId;
  if (status) params.status = status;
  if (date) params.date = date;

  const { data, isLoading } = useQuery({
    queryKey: ["appointments", params],
    queryFn: () => appointmentApi.list(params),
    enabled: !!isAllowed,
  });

  const canCreate = ["admin", "doctor", "receptionist", "patient", "nurse"].includes(user?.role || "");

  return (
    <RoleGuard roles={allowedRoles}>
      <div className="p-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Appointments</h1>
            <p className="text-gray-500 mt-1">Track and manage clinical consultations and follow-ups.</p>
          </div>
          {canCreate && (
            <Link href="/dashboard/appointments/new" className="btn-primary">
              <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Schedule Appointment
            </Link>
          )}
        </div>

        <div className="mb-6 card-premium p-5 flex flex-wrap items-center gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 ml-1">Status Filter</label>
            <select
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(1); }}
              className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 text-sm outline-none focus:border-emerald-600 focus:bg-white transition-all min-w-[160px]"
            >
              <option value="">All statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 ml-1">Schedule Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => { setDate(e.target.value); setPage(1); }}
              className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 text-sm outline-none focus:border-emerald-600 focus:bg-white transition-all"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex h-[40vh] items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
          </div>
        ) : (
          <div className="card-premium overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">Patient</th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">Practitioner</th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">Schedule</th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">Status</th>
                    <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {(data?.appointments || []).map((a) => {
                    const patient = typeof a.patientId === "object" ? a.patientId : null;
                    const doctor = typeof a.doctorId === "object" ? a.doctorId : null;
                    return (
                      <tr key={a._id} className="hover:bg-emerald-50/30 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="font-bold text-gray-900">{patient?.name ?? "—"}</div>
                          <div className="text-[10px] text-gray-400 font-medium">PATIENT RECORD</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-semibold text-gray-700">Dr. {doctor?.name ?? "—"}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-bold text-gray-900">{new Date(a.date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                          <div className="text-xs text-emerald-600 font-bold">{a.timeSlot}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider shadow-sm ${a.status === "completed" ? "bg-emerald-100 text-emerald-800" :
                              a.status === "cancelled" ? "bg-red-100 text-red-800" :
                                a.status === "confirmed" ? "bg-blue-100 text-blue-800" :
                                  "bg-amber-100 text-amber-800"
                            }`}>
                            <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${a.status === "completed" ? "bg-emerald-600" :
                                a.status === "cancelled" ? "bg-red-600" :
                                  a.status === "confirmed" ? "bg-blue-600" :
                                    "bg-amber-600"
                              }`} />
                            {a.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link href={`/dashboard/appointments/${a._id}`} className="inline-flex items-center text-sm font-bold text-emerald-600 hover:text-emerald-700 uppercase tracking-wider">
                            Details
                            <svg className="h-4 w-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {(!data?.appointments || data.appointments.length === 0) && (
              <div className="py-20 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="mt-4 text-gray-400 font-medium">No appointments scheduled.</p>
              </div>
            )}
          </div>
        )}

        {data && data.total > 15 && (
          <div className="mt-8 flex items-center justify-center gap-4">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="btn-secondary px-4 py-2 disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">
              Page {page} of {Math.ceil(data.total / 15)}
            </span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= Math.ceil(data.total / 15)}
              className="btn-secondary px-4 py-2 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </RoleGuard>
  );
}
