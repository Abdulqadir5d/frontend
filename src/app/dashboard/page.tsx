"use client";

import { useAuth } from "@/context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { analyticsApi } from "@/api/clinic";
import Link from "next/link";

export default function DashboardPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const isDoctor = user?.role === "doctor";
  const isReceptionist = user?.role === "receptionist";

  const { data: adminStats, isError: adminError } = useQuery({
    queryKey: ["analytics", "admin"],
    queryFn: analyticsApi.admin,
    enabled: isAdmin,
  });

  const { data: doctorStats, isError: doctorError } = useQuery({
    queryKey: ["analytics", "doctor"],
    queryFn: analyticsApi.doctor,
    enabled: isDoctor,
  });

  const { data: receptionistStats, isError: receptionistError } = useQuery({
    queryKey: ["analytics", "receptionist"],
    queryFn: analyticsApi.receptionist,
    enabled: isReceptionist,
  });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-slate-800 dark:text-slate-100">
        Welcome, {user?.name}
      </h1>

      {isAdmin && adminStats && (
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Total Patients" value={adminStats.totalPatients} />
          <StatCard title="Doctors" value={adminStats.totalDoctors} />
          <StatCard title="Appointments (Month)" value={adminStats.appointmentsThisMonth} />
          <StatCard
            title="Revenue (Month)"
            value={`₹${(adminStats.revenueThisMonth || 0).toLocaleString()}`}
          />
        </div>
      )}

      {isDoctor && doctorStats && (
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard title="Today's Appointments" value={doctorStats.todayAppointments} />
          <StatCard title="Monthly Appointments" value={doctorStats.monthAppointments} />
          <StatCard title="Prescriptions (Month)" value={doctorStats.prescriptionCount} />
        </div>
      )}

      {isReceptionist && receptionistStats && (
        <div className="mb-8 grid gap-4 sm:grid-cols-2">
          <StatCard title="Today's Appointments" value={receptionistStats.todayAppointments} />
          <StatCard title="Total Patients" value={receptionistStats.totalPatients} />
        </div>
      )}

      {(adminError || doctorError || receptionistError) && (
        <p className="mb-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-900/30 dark:text-amber-200">
          Could not load some statistics. You can still use all features.
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {user?.role !== "patient" && (
          <Link
            href="/dashboard/patients"
            className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-teal-300 dark:border-slate-700 dark:bg-slate-800/50 hover:dark:border-teal-700"
          >
            <h2 className="text-lg font-semibold text-teal-600 dark:text-teal-400">Patients</h2>
            <p className="mt-1 text-sm text-slate-500">Manage patient records</p>
          </Link>
        )}
        <Link
          href="/dashboard/appointments"
          className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-teal-300 dark:border-slate-700 dark:bg-slate-800/50 hover:dark:border-teal-700"
        >
          <h2 className="text-lg font-semibold text-teal-600 dark:text-teal-400">Appointments</h2>
          <p className="mt-1 text-sm text-slate-500">View and manage schedule</p>
        </Link>
        {(isDoctor || user?.role === "patient") && (
          <Link
            href="/dashboard/prescriptions"
            className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-teal-300 dark:border-slate-700 dark:bg-slate-800/50 hover:dark:border-teal-700"
          >
            <h2 className="text-lg font-semibold text-teal-600 dark:text-teal-400">Prescriptions</h2>
            <p className="mt-1 text-sm text-slate-500">View prescription history</p>
          </Link>
        )}
      </div>
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800/50">
      <p className="text-sm text-slate-500">{title}</p>
      <p className="mt-1 text-2xl font-bold text-slate-800 dark:text-slate-100">{value}</p>
    </div>
  );
}
