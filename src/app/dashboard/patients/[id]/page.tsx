"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { patientApi, historyApi } from "@/api/clinic";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function PatientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();

  const { data: history, isLoading } = useQuery({
    queryKey: ["history", id],
    queryFn: () => historyApi.patient(id!),
    enabled: !!id,
  });

  const patient = history?.patient;
  const timeline = history?.timeline || [];
  const canEdit = ["admin", "receptionist"].includes(user?.role || "");
  const canPrescribe = ["admin", "doctor"].includes(user?.role || "");
  const canBook = ["admin", "doctor", "receptionist"].includes(user?.role || "");

  if (isLoading || !patient) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-teal-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/patients" className="text-teal-600 hover:underline dark:text-teal-400">
            ← Patients
          </Link>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{patient.name}</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          {canEdit && (
            <Link
              href={`/dashboard/patients/${id}/edit`}
              className="rounded-lg border border-teal-600 px-4 py-2 text-sm font-medium text-teal-600 hover:bg-teal-50 dark:border-teal-500 dark:text-teal-400 dark:hover:bg-teal-900/20"
            >
              Edit Patient
            </Link>
          )}
          {canBook && (
            <Link
              href={`/dashboard/appointments/new?patientId=${id}`}
              className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
            >
              Book Appointment
            </Link>
          )}
          {canPrescribe && (
            <Link
              href={`/dashboard/prescriptions/new?patientId=${id}`}
              className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
            >
              Add Prescription
            </Link>
          )}
        </div>
      </div>

      <div className="mb-8 grid gap-6 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800/50">
          <h2 className="mb-4 text-lg font-semibold text-slate-800 dark:text-slate-100">Profile</h2>
          <dl className="space-y-2 text-sm">
            <div><dt className="text-slate-500">Age</dt><dd>{patient.age}</dd></div>
            <div><dt className="text-slate-500">Gender</dt><dd className="capitalize">{patient.gender}</dd></div>
            <div><dt className="text-slate-500">Contact</dt><dd>{patient.contact}</dd></div>
            {patient.email && <div><dt className="text-slate-500">Email</dt><dd>{patient.email}</dd></div>}
            {patient.address && <div><dt className="text-slate-500">Address</dt><dd>{patient.address}</dd></div>}
            {patient.bloodGroup && <div><dt className="text-slate-500">Blood Group</dt><dd>{patient.bloodGroup}</dd></div>}
          </dl>
        </div>
      </div>

      <div>
        <h2 className="mb-4 text-lg font-semibold text-slate-800 dark:text-slate-100">Medical History</h2>
        <div className="space-y-4">
          {timeline.map((item: { type: string; date: string; id: string; data: unknown }) => (
            <div
              key={item.id}
              className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800/50"
            >
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <span className="rounded bg-slate-100 px-2 py-0.5 dark:bg-slate-700">{item.type}</span>
                <span>{new Date(item.date).toLocaleString()}</span>
              </div>
              {item.type === "prescription" && (
                <Link
                  href={`/dashboard/prescriptions/${item.id}`}
                  className="mt-2 block font-medium text-teal-600 hover:underline dark:text-teal-400"
                >
                  View Prescription →
                </Link>
              )}
            </div>
          ))}
          {timeline.length === 0 && <p className="text-slate-500">No history yet</p>}
        </div>
      </div>
    </div>
  );
}
