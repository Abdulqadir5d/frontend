"use client";

import { useQuery } from "@tanstack/react-query";
import { analyticsApi, aiApi } from "@/api/clinic";
import { useAuth } from "@/context/AuthContext";

export default function AnalyticsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const isDoctor = user?.role === "doctor";

  const { data: adminData } = useQuery({
    queryKey: ["analytics-admin"],
    queryFn: analyticsApi.admin,
    enabled: isAdmin,
  });

  const { data: doctorData } = useQuery({
    queryKey: ["analytics-doctor"],
    queryFn: analyticsApi.doctor,
    enabled: isDoctor,
  });

  const { data: aiSummary } = useQuery({
    queryKey: ["ai-analytics-summary"],
    queryFn: aiApi.analyticsSummary,
    enabled: isAdmin || isDoctor,
  });

  const topDiagnoses = isAdmin ? adminData?.topDiagnoses : [];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-slate-800 dark:text-slate-100">Analytics</h1>

      {isAdmin && adminData && (
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Total Patients" value={adminData.totalPatients} />
          <StatCard title="Doctors" value={adminData.totalDoctors} />
          <StatCard title="Appointments (Month)" value={adminData.appointmentsThisMonth} />
          <StatCard title="Revenue (Month)" value={`₹${(adminData.revenueThisMonth || 0).toLocaleString()}`} />
        </div>
      )}

      {isDoctor && doctorData && (
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <StatCard title="Today" value={doctorData.todayAppointments} />
          <StatCard title="This Month" value={doctorData.monthAppointments} />
          <StatCard title="Prescriptions" value={doctorData.prescriptionCount} />
        </div>
      )}

      {topDiagnoses && topDiagnoses.length > 0 && (
        <div className="mb-8 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800/50">
          <h2 className="mb-4 text-lg font-semibold">Top Diagnoses This Month</h2>
          <div className="space-y-2">
            {topDiagnoses.slice(0, 5).map((d: { _id: string; count: number }) => (
              <div key={d._id} className="flex items-center justify-between rounded bg-slate-50 px-3 py-2 dark:bg-slate-800">
                <span>{d._id || "—"}</span>
                <span className="font-medium">{d.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {aiSummary?.summary && (
        <div className="rounded-xl border border-teal-200 bg-teal-50/50 p-6 dark:border-teal-800 dark:bg-teal-900/20">
          <h2 className="mb-4 text-lg font-semibold text-teal-800 dark:text-teal-200">AI Insights</h2>
          <p className="whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300">{aiSummary.summary}</p>
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800/50">
      <p className="text-sm text-slate-500">{title}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </div>
  );
}
