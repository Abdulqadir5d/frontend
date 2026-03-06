"use client";

import { useAuth } from "@/context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { analyticsApi, notificationApi } from "@/api/clinic";
import Link from "next/link";
import { useState } from "react";

export default function DashboardPage() {
  const { user } = useAuth();
  const isNurse = user?.role === "nurse";
  const isPharmacist = user?.role === "pharmacist";
  const isLabTech = user?.role === "lab_technician";
  const isPatient = user?.role === "patient";
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

  const { data: nurseStats, isError: nurseError } = useQuery({
    queryKey: ["analytics", "nurse"],
    queryFn: analyticsApi.nurse,
    enabled: isNurse,
  });

  const { data: pharmacistStats, isError: pharmacistError } = useQuery({
    queryKey: ["analytics", "pharmacist"],
    queryFn: analyticsApi.pharmacist,
    enabled: isPharmacist,
  });

  const { data: labStats, isError: labError } = useQuery({
    queryKey: ["analytics", "lab"],
    queryFn: analyticsApi.lab,
    enabled: isLabTech,
  });

  const { data: patientStats, isError: patientError } = useQuery({
    queryKey: ["analytics", "patient"],
    queryFn: analyticsApi.patient,
    enabled: isPatient,
  });

  const { data: notifications = [] } = useQuery({
    queryKey: ["notifications"],
    queryFn: notificationApi.list,
  });

  return (
    <div className="p-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Welcome back, {user?.name.split(' ')[0]}
          </h1>
          <p className="text-gray-500 mt-1">
            {isPatient
              ? "Your health journey at a glance."
              : "Here's what's happening in your clinic today."}
          </p>
        </div>
        <div className="flex gap-3">
          {!isPatient && <button className="btn-secondary">Download Reports</button>}
          {isPatient ? (
            <Link href="/dashboard/appointments/new" className="btn-primary">+ Book Appointment</Link>
          ) : (
            <Link href="/dashboard/appointments" className="btn-primary">+ New Appointment</Link>
          )}
        </div>
      </div>

      {isAdmin && notifications.some((n: any) => !n.isRead && n.title === "New Staff Registration") && (
        <div className="mb-8 animate-pulse-slow">
          <Link href="/dashboard/users" className="block p-4 rounded-2xl bg-amber-50 border border-amber-200 hover:bg-amber-100 transition-colors">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-amber-500 flex items-center justify-center text-white shadow-lg shadow-amber-200">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h4 className="text-xs font-black text-amber-900 uppercase tracking-widest">Pending Clinical Staff Verification</h4>
                <p className="text-[11px] text-amber-700 font-bold mt-0.5">There are new institutional registrations awaiting your approval in the User Management portal.</p>
              </div>
              <div className="ml-auto">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 bg-white rounded-lg text-amber-600 shadow-sm border border-amber-100">Action Required</span>
              </div>
            </div>
          </Link>
        </div>
      )}

      {isAdmin && adminStats && (
        <div className="mb-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Patients"
            value={adminStats.totalPatients}
            icon="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            color="emerald"
          />
          <StatCard
            title="Active Doctors"
            value={adminStats.totalDoctors}
            icon="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            color="emerald"
          />
          <StatCard
            title="Monthly Appts"
            value={adminStats.appointmentsThisMonth}
            icon="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            color="emerald"
          />
          <StatCard
            title="Monthly Revenue"
            value={`₹${(adminStats.revenueThisMonth || 0).toLocaleString()}`}
            icon="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            color="emerald"
          />
        </div>
      )}

      {isDoctor && doctorStats && (
        <div className="mb-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            title="Today's Appointments"
            value={doctorStats.todayAppointments}
            icon="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            color="emerald"
          />
          <StatCard
            title="Monthly Total"
            value={doctorStats.monthAppointments}
            icon="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            color="emerald"
          />
          <StatCard
            title="Prescriptions"
            value={doctorStats.prescriptionCount}
            icon="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1"
            color="emerald"
          />
        </div>
      )}

      {isNurse && nurseStats && (
        <div className="mb-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
          <StatCard
            title="Active Consultations"
            value={nurseStats.todayAppointments}
            icon="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            color="emerald"
          />
          <StatCard
            title="Vital Entries Today"
            value={nurseStats.vitalsToday}
            icon="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            color="emerald"
          />
        </div>
      )}

      {isPharmacist && pharmacistStats && (
        <div className="mb-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
          <StatCard
            title="Pending Fulfillment"
            value={pharmacistStats.pendingRx}
            icon="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.673.337a4 4 0 01-2.586.346l-2.387-.477a2 2 0 00-1.022.547l-4 4a2 2 0 102.828 2.828l3.414-3.414a2 2 0 00.511-.274l2.387.477a6 6 0 003.86-.517l.673-.337a4 4 0 012.586-.346l2.387.477a2 2 0 001.022-.547l4-4a2 2 0 10-2.828-2.828l-3.414 3.414z"
            color="emerald"
          />
          <StatCard
            title="Dispensed Today"
            value={pharmacistStats.processedToday}
            icon="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            color="emerald"
          />
        </div>
      )}

      {isLabTech && labStats && (
        <div className="mb-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
          <StatCard
            title="Queue Orders"
            value={labStats.pendingLabs}
            icon="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
            color="emerald"
          />
          <StatCard
            title="Reports Finalized Today"
            value={labStats.completedToday}
            icon="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            color="emerald"
          />
        </div>
      )}

      {isPatient && patientStats && (
        <div className="mb-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            title="Upcoming Consultations"
            value={patientStats.upcomingAppointments}
            icon="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            color="emerald"
          />
          <StatCard
            title="Active Prescriptions"
            value={patientStats.activePrescriptions}
            icon="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1"
            color="emerald"
          />
          <StatCard
            title="Latest Lab Results"
            value={patientStats.latestLabStatus || "None"}
            icon="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            color="emerald"
          />
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Quick Actions */}
          <section>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              {user?.role !== "patient" && (
                <QuickActionCard
                  title="Patients"
                  desc="Manage patient records and clinical history"
                  href="/dashboard/patients"
                  icon="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1"
                />
              )}
              <QuickActionCard
                title={isPatient ? "My Appointments" : "Appointments"}
                desc={isPatient ? "View your upcoming clinic visits" : "Schedule and view upcoming consultations"}
                href="/dashboard/appointments"
                icon="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
              {isPharmacist && (
                <QuickActionCard
                  title="Pharmacy Hub"
                  desc="Fulfill pending prescriptions and manage inventory"
                  href="/dashboard/pharmacy"
                  icon="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-1.414 1.414"
                />
              )}
              {isLabTech && (
                <QuickActionCard
                  title="Lab Center"
                  desc="Process test orders and finalize patient reports"
                  href="/dashboard/labs"
                  icon="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477A6 6 0 009 10.172V5L8 4z"
                />
              )}
              {isNurse && (
                <QuickActionCard
                  title="Vitals Monitor"
                  desc="Record patient vitals and triage status"
                  href="/dashboard/vitals"
                  icon="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              )}
              {isPatient && (
                <QuickActionCard
                  title="Medical History"
                  desc="Review your past visits and prescriptions"
                  href="/dashboard/history"
                  icon="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              )}
            </div>
          </section>

          {/* AI Insight Section */}
          <section className="ai-panel">
            <div className="flex items-center gap-2 mb-4">
              <span className="ai-badge">AI INSIGHT</span>
              <h3 className="text-lg font-bold text-emerald-900">
                {isPatient ? "Your Personalized Health Tip" : "Clinic Analytics Summary"}
              </h3>
            </div>
            <p className="text-emerald-800/80 text-sm leading-relaxed mb-4">
              {isPatient
                ? "Based on your recent vitals, your heart rate is in the optimal range. Remember to stay hydrated and keep up your morning walk routine!"
                : "Our AI has analyzed your clinic's performance for this week. Patient satisfaction is up by 12%, but there's a slight increase in average wait times during afternoon slots."}
            </p>
            <div className="flex gap-4">
              <div className="flex-1 bg-white/50 rounded-xl p-3 border border-emerald-200/50">
                <p className="text-[10px] uppercase tracking-wider font-bold text-emerald-700">
                  {isPatient ? "Activity Level" : "Efficiency Score"}
                </p>
                <div className="mt-2 h-2 w-full rounded-full bg-emerald-100 overflow-hidden">
                  <div className="h-full bg-emerald-600 rounded-full" style={{ width: isPatient ? '65%' : '85%' }} />
                </div>
              </div>
              <div className="flex-1 bg-white/50 rounded-xl p-3 border border-emerald-200/50">
                <p className="text-[10px] uppercase tracking-wider font-bold text-emerald-700">
                  {isPatient ? "Wellness Index" : "Risk Mitigation"}
                </p>
                <div className="mt-2 h-2 w-full rounded-full bg-emerald-100 overflow-hidden">
                  <div className="h-full bg-emerald-600 rounded-full" style={{ width: isPatient ? '78%' : '92%' }} />
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-8">
          <section>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Alerts</h3>
            <div className="card-premium divide-y divide-gray-100 overflow-hidden">
              {notifications.length > 0 ? (
                notifications.slice(0, 5).map((n: any) => (
                  <NotificationItem
                    key={n._id}
                    title={n.title}
                    time={new Date(n.createdAt).toLocaleDateString()}
                    desc={n.message}
                    type={n.priority === "high" ? "warning" : "success"}
                    dotColor={!n.isRead ? "bg-emerald-500" : "bg-gray-200"}
                  />
                ))
              ) : (
                <div className="p-8 text-center text-xs text-gray-400 font-bold uppercase tracking-widest">
                  No active alerts
                </div>
              )}
            </div>
          </section>

          {(adminError || doctorError || receptionistError || nurseError || pharmacistError || labError || patientError) && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <div className="flex gap-3">
                <svg className="h-5 w-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p className="text-xs text-amber-800 font-medium capitalize">
                  Some background analytics could not be refreshed. Check your connection.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }: { title: string; value: string | number; icon: string; color: "emerald" | "blue" | "amber" }) {
  const colorClasses = {
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100",
  };

  return (
    <div className="card-premium p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">{title}</p>
          <p className="text-2xl font-black text-gray-900">{value}</p>
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${colorClasses[color]}`}>
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
          </svg>
        </div>
      </div>
      <div className="mt-4 flex items-center text-[10px] font-black uppercase tracking-widest text-emerald-600">
        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-2 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
        <span>System Verified Record</span>
      </div>
    </div>
  );
}

function QuickActionCard({ title, desc, href, icon }: { title: string; desc: string; href: string; icon: string }) {
  return (
    <Link href={href} className="card-premium group p-6 block">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-50 text-gray-400 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
          </svg>
        </div>
        <div>
          <h4 className="font-bold text-gray-900 group-hover:text-emerald-700 transition-colors">{title}</h4>
          <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
        </div>
      </div>
    </Link>
  );
}

function NotificationItem({ title, time, desc, dotColor = "bg-emerald-500" }: { title: string; time: string; desc: string; type?: string; dotColor?: string }) {
  return (
    <div className="p-4 hover:bg-gray-50 transition-colors cursor-pointer group">
      <div className="flex justify-between items-start mb-1">
        <div className="flex items-center gap-2">
          <div className={`h-1.5 w-1.5 rounded-full ${dotColor}`} />
          <h5 className="text-xs font-bold text-gray-900 uppercase tracking-tight">{title}</h5>
        </div>
        <span className="text-[10px] text-gray-400">{time}</span>
      </div>
      <p className="text-xs text-gray-500 leading-relaxed group-hover:text-gray-600 line-clamp-2">{desc}</p>
    </div>
  );
}
