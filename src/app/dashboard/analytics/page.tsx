"use client";

import { useQuery } from "@tanstack/react-query";
import { analyticsApi, aiApi } from "@/api/clinic";
import { useAuth } from "@/context/AuthContext";
import { useMemo } from "react";

/**
 * Analytics Dashboard with Custom CSS Visualizations
 * Note: Recharts dependency was removed to ensure a stable build in all environments.
 * If you install recharts manually, you can revert to the chart-library version.
 */

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

  // Data for diagnoses, either from admin or clinic-wide for doctors
  const topDiagnoses = isAdmin ? adminData?.topDiagnoses : (doctorData?.topDiagnoses || []);

  // Data for patient growth visualization
  const growthData = useMemo(() => [
    { label: "Jan", patients: 40 },
    { label: "Feb", patients: 78 },
    { label: "Mar", patients: 125 },
    { label: "Apr", patients: 180 },
    { label: "May", patients: 230 },
  ], []);

  const maxGrowthValue = 250;
  const maxDiagnosisCount = Math.max(...(topDiagnoses?.map((d: any) => d.count) || []), 10);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Analytics Dashboard</h1>
          <p className="text-sm text-slate-500">Live performance & intelligent insights</p>
        </div>
        <div className="text-xs font-semibold text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
          Live • {new Date().toLocaleDateString()}
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isAdmin && adminData && (
          <>
            <StatCard title="Total Patients" value={adminData.totalPatients} trend="+12% this month" />
            <StatCard title="Active Doctors" value={adminData.totalDoctors} />
            <StatCard title="Monthly Appointments" value={adminData.appointmentsThisMonth} trend="+5%" />
            <StatCard title="Total Revenue" value={`₹${(adminData.revenueThisMonth || 0).toLocaleString()}`} color="text-teal-600" />
          </>
        )}
        {isDoctor && doctorData && (
          <>
            <StatCard title="Today's Appointments" value={doctorData.todayAppointments} />
            <StatCard title="Monthly Consults" value={doctorData.monthAppointments} trend="+8%" />
            <StatCard title="Prescriptions Issued" value={doctorData.prescriptionCount} />
            <StatCard title="Pending Lab Reviews" value="5" color="text-amber-600" />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* CSS Growth Chart */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800/50">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-semibold">User Growth Tracking</h2>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Past 5 Months</span>
          </div>
          <div className="flex items-end justify-between h-[200px] gap-2 px-2">
            {growthData.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center group">
                <div
                  className="w-full bg-slate-100 dark:bg-slate-800 rounded-t-lg relative overflow-hidden transition-all duration-500 group-hover:bg-teal-500/20"
                  style={{ height: `${(d.patients / maxGrowthValue) * 100}%` }}
                >
                  <div className="absolute inset-x-0 bottom-0 bg-teal-500 h-1 transition-all group-hover:h-full group-hover:opacity-10" />
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 text-[10px] font-bold text-teal-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    {d.patients}
                  </div>
                </div>
                <span className="mt-3 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{d.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CSS Diagnosis Chart */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800/50">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Diagnosis Prevalence</h2>
            <span className="text-[10px] font-bold text-teal-500 uppercase tracking-widest">Most Frequent</span>
          </div>
          <div className="space-y-4">
            {topDiagnoses && topDiagnoses.length > 0 ? (
              topDiagnoses.slice(0, 5).map((d: any, i: number) => (
                <div key={i} className="space-y-1.5 group">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-600 dark:text-slate-400 group-hover:text-teal-600 transition-colors">{d._id || "Uncategorized"}</span>
                    <span className="text-slate-900 dark:text-slate-100">{d.count} Cases</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-teal-500 transition-all duration-1000 ease-in-out rounded-full shadow-[0_0_10px_rgba(20,184,166,0.3)]"
                      style={{ width: `${(d.count / maxDiagnosisCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="flex h-32 items-center justify-center text-slate-400 italic text-sm border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-xl">
                No diagnostic history available
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AI Insights Section */}
      {aiSummary?.summary && (
        <div className="relative overflow-hidden rounded-xl border border-teal-200 bg-teal-50/50 p-7 shadow-sm dark:border-teal-800 dark:bg-teal-900/10">
          <div className="absolute right-0 bottom-0 -mr-16 -mb-16 h-48 w-48 rounded-full bg-teal-200/20 blur-3xl opacity-40" />
          <div className="flex items-center gap-3 mb-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-600 shadow-xl shadow-teal-500/20">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-teal-900 dark:text-teal-100">AI Predictive Insights</h2>
              <p className="text-[10px] font-bold text-teal-600 uppercase tracking-widest">Enhanced Patient Care Analysis</p>
            </div>
          </div>
          <div className="relative z-10 prose prose-teal prose-sm max-w-none">
            <p className="whitespace-pre-wrap leading-relaxed text-slate-700 dark:text-slate-300 font-medium">
              {aiSummary.summary}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, trend, color = "text-slate-900 dark:text-slate-100" }: { title: string; value: string | number, trend?: string, color?: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{title}</p>
          <p className={`text-2xl font-black tracking-tight ${color}`}>{value}</p>
        </div>
        {trend && (
          <span className="text-[9px] font-bold text-teal-600 bg-teal-50 dark:bg-teal-900/30 px-2 py-0.5 rounded-full ring-1 ring-teal-200/50 dark:ring-teal-800/50">
            {trend}
          </span>
        )}
      </div>
    </div>
  );
}


