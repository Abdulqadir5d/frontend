"use client";

import { useQuery } from "@tanstack/react-query";
import { prescriptionApi } from "@/api/clinic";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

export default function PrescriptionsPage() {
  const { user } = useAuth();

  const params: Record<string, string> = {};
  if (user?.role === "doctor") params.doctorId = user.id;
  if (user?.role === "patient" && user?.patientId) params.patientId = user.patientId;

  const { data, isLoading } = useQuery({
    queryKey: ["prescriptions", params],
    queryFn: () => prescriptionApi.list(params),
  });

  const canCreate = ["admin", "doctor"].includes(user?.role || "");

  return (
    <div className="p-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Prescriptions</h1>
          <p className="text-gray-500 mt-1">Manage and track patient medication and dosage history.</p>
        </div>
        {canCreate && (
          <Link href="/dashboard/prescriptions/new" className="btn-primary">
            <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1" />
            </svg>
            Write Prescription
          </Link>
        )}
      </div>

      {isLoading ? (
        <div className="flex h-[40vh] items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {(data?.prescriptions || []).map((rx) => {
            const patient = typeof rx.patientId === "object" ? rx.patientId : null;
            const doctor = typeof rx.doctorId === "object" ? rx.doctorId : null;
            return (
              <div key={rx._id} className="card-premium p-6 group hover:border-emerald-300 transition-all hover-scale-sm cursor-default shadow-md hover:shadow-xl hover:shadow-emerald-600/5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1" />
                    </svg>
                  </div>
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{new Date(rx.createdAt).toLocaleDateString()}</span>
                </div>

                <h3 className="font-bold text-gray-900 group-hover:text-emerald-700 transition-colors uppercase tracking-tight">{patient?.name ?? "—"}</h3>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2 min-h-[32px]">{rx.diagnosis || "No specific diagnosis recorded."}</p>

                <div className="mt-6 pt-6 border-t border-gray-100 flex items-center justify-between">
                  <div className="text-[10px] font-bold text-gray-400">ISSUED BY DR. {doctor?.name?.toUpperCase() ?? "—"}</div>
                  <Link href={`/dashboard/prescriptions/${rx._id}`} className="inline-flex items-center text-xs font-black text-emerald-600 uppercase tracking-widest group-hover:translate-x-1 transition-transform">
                    View
                    <svg className="h-3 w-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            );
          })}
          {(!data?.prescriptions || data.prescriptions.length === 0) && (
            <div className="col-span-full py-24 text-center card-premium border-2 border-dashed border-emerald-100 bg-emerald-50/10 relative overflow-hidden group">
              <div className="absolute inset-0 opacity-5 pointer-events-none">
                <svg className="h-full w-full" fill="none" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <pattern id="rx-grid" width="12" height="12" patternUnits="userSpaceOnUse">
                    <circle cx="2" cy="2" r="1" fill="currentColor" />
                  </pattern>
                  <rect width="100" height="100" fill="url(#rx-grid)" />
                </svg>
              </div>
              <div className="h-20 w-20 rounded-3xl bg-white shadow-xl shadow-emerald-600/5 flex items-center justify-center mx-auto mb-6 border border-emerald-50 group-hover:rotate-12 transition-transform">
                <svg className="h-10 w-10 text-emerald-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-black text-emerald-900/40 uppercase tracking-[0.3em]">No Active Prescriptions</p>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-relaxed max-w-sm mx-auto">The centralized medication repository is currently empty <br /> initiate waitlist or consultation to issue therapeutic records</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
