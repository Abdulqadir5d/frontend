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
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Prescriptions</h1>
        {canCreate && (
          <Link href="/dashboard/prescriptions/new" className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700">
            Add Prescription
          </Link>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-teal-500 border-t-transparent" />
        </div>
      ) : (
        <div className="space-y-4">
          {(data?.prescriptions || []).map((rx) => {
            const patient = typeof rx.patientId === "object" ? rx.patientId : null;
            const doctor = typeof rx.doctorId === "object" ? rx.doctorId : null;
            return (
              <div key={rx._id} className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{patient?.name ?? "—"}</p>
                    <p className="text-sm text-slate-500">{rx.diagnosis || "No diagnosis"}</p>
                  </div>
                  <div className="text-right text-sm text-slate-500">
                    <p>{doctor?.name ?? "—"}</p>
                    <p>{new Date(rx.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <Link href={`/dashboard/prescriptions/${rx._id}`} className="mt-2 inline-block text-sm font-medium text-teal-600 hover:underline dark:text-teal-400">
                  View details →
                </Link>
              </div>
            );
          })}
          {(!data?.prescriptions || data.prescriptions.length === 0) && (
            <p className="py-8 text-center text-slate-500">No prescriptions</p>
          )}
        </div>
      )}
    </div>
  );
}
