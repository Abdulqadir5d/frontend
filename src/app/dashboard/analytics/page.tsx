"use client";

import { useQuery } from "@tanstack/react-query";
import { analyticsApi, aiApi } from "@/api/clinic";
import { useAuth } from "@/context/AuthContext";
import { useMemo } from "react";
import Link from "next/link";

/**
 * Analytics Dashboard with Custom CSS Visualizations
 * Refined for Premium Emerald Theme
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

  const topDiagnoses = isAdmin ? adminData?.topDiagnoses : (doctorData?.topDiagnoses || []);

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
    <div className="p-4 sm:p-8 space-y-6 sm:space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Analytics Dashboard</h1>
          <p className="text-gray-500 font-medium mt-1">Live performance metrics and intelligent clinic insights.</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest leading-none">Live Data</span>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {isAdmin && adminData && (
          <>
            <AnalyticsStatCard title="Total Patients" value={adminData.totalPatients} trend="+12%" icon="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            <AnalyticsStatCard title="Staff Count" value={adminData.totalDoctors} icon="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            <AnalyticsStatCard title="Monthly Appts" value={adminData.appointmentsThisMonth} trend="+5%" icon="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            <AnalyticsStatCard title="Total Revenue" value={`₹${(adminData.revenueThisMonth || 0).toLocaleString()}`} icon="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2" highlight />
          </>
        )}
        {isDoctor && doctorData && (
          <>
            <AnalyticsStatCard title="Today's Load" value={doctorData.todayAppointments} icon="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            <AnalyticsStatCard title="Monthly Total" value={doctorData.monthAppointments} trend="+8%" icon="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            <AnalyticsStatCard title="Rx Issued" value={doctorData.prescriptionCount} icon="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1" />
            <AnalyticsStatCard title="Pending Review" value="5" color="text-amber-600" icon="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* CSS Growth Chart */}
        <div className="card-premium p-4 sm:p-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900 tracking-tight">Patient Acquisition</h2>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Growth Tracking (5 Months)</p>
            </div>
          </div>
          <div className="flex items-end justify-between h-[240px] gap-4 px-2">
            {growthData.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center group">
                <div
                  className="w-full bg-emerald-500/90 rounded-t-2xl relative overflow-hidden transition-all duration-500 hover:scale-x-105 hover:bg-emerald-600 group-hover:shadow-emerald-glow cursor-pointer"
                  style={{ height: `${Math.max((d.patients / maxGrowthValue) * 100, 5)}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent" />
                  <div className="absolute inset-0 animate-shimmer opacity-20 pointer-events-none" />
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 text-[10px] font-black text-white drop-shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {d.patients} NEW
                  </div>
                </div>
                <span className="mt-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">{d.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CSS Diagnosis Chart */}
        <div className="card-premium p-4 sm:p-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900 tracking-tight">Clinical Prevalence</h2>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Top Diagnoses Distribution</p>
            </div>
            <span className="ai-badge">AI CLASSIFIED</span>
          </div>
          <div className="space-y-6">
            {topDiagnoses && topDiagnoses.length > 0 ? (
              topDiagnoses.slice(0, 5).map((d: any, i: number) => (
                <div key={i} className="space-y-2 group">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-gray-500 group-hover:text-emerald-700 transition-colors uppercase tracking-tight">{d._id || "Uncategorized"}</span>
                    <span className="text-gray-900">{d.count} Cases</span>
                  </div>
                  <div className="h-3 w-full bg-gray-50 rounded-full overflow-hidden border border-gray-100">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-1000 ease-out rounded-full shadow-sm"
                      style={{ width: `${(d.count / maxDiagnosisCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col gap-4 py-12 items-center justify-center text-gray-400 border-2 border-dashed border-gray-100 rounded-3xl bg-gray-50/30">
                <div className="h-14 w-14 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-2 border border-gray-100">
                  <svg className="w-6 h-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div className="text-center px-8">
                  <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Awaiting Clinical Data</p>
                  <p className="text-[10px] text-gray-400 mt-2 leading-relaxed max-w-[240px]">Issue prescriptions with standardized diagnoses to begin visualizing healthcare trends.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AI Insights Section */}
      {aiSummary?.summary && (
        <section className="ai-panel p-6 sm:p-10 relative overflow-hidden shadow-emerald-glow border-emerald-200/50">
          <div className="absolute inset-0 animate-shimmer opacity-[0.03] pointer-events-none" />
          <div className="flex items-center gap-4 mb-6 relative z-10">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 shadow-xl shadow-emerald-500/30">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-black text-emerald-900 tracking-tight">Executive Intelligence</h2>
              <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] mt-1">AI-Powered Predictive Modeling</p>
            </div>
          </div>
          <div className="prose prose-emerald max-w-none">
            <p className="whitespace-pre-wrap leading-relaxed text-emerald-800 font-medium text-base">
              {aiSummary.summary}
            </p>
          </div>
          <div className="mt-8 pt-8 border-t border-emerald-200/50 flex gap-6">
            <Link href="/dashboard/ai" className="text-xs font-black text-emerald-700 uppercase tracking-widest flex items-center hover:text-emerald-900">
              Run Advanced Diagnostics
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}

function AnalyticsStatCard({ title, value, trend, icon, highlight, color = "text-gray-900" }: { title: string; value: string | number, trend?: string, icon?: string, highlight?: boolean, color?: string }) {
  return (
    <div className={`card-premium p-6 group transition-all duration-300 ${highlight ? 'bg-emerald-600 !border-none shadow-lg shadow-emerald-600/20' : ''}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${highlight ? 'text-emerald-100' : 'text-gray-400'}`}>{title}</p>
          <p className={`text-2xl font-black tracking-tight ${highlight ? 'text-white' : color}`}>{value}</p>
        </div>
        {icon && (
          <div className={`h-10 w-10 flex items-center justify-center rounded-xl ${highlight ? 'bg-white/10 text-white' : 'bg-gray-50 text-emerald-600 border border-gray-100 group-hover:bg-emerald-50'} transition-all`}>
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
            </svg>
          </div>
        )}
      </div>
      {trend && (
        <div className={`mt-4 flex items-center text-[10px] font-black uppercase tracking-wider ${highlight ? 'text-emerald-200' : 'text-emerald-600'}`}>
          <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
          {trend}
          <span className={`font-medium lowercase ml-1 ${highlight ? 'text-emerald-200/60' : 'text-gray-400'}`}>vs last period</span>
        </div>
      )}
    </div>
  );
}
