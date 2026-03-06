"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { patientApi, historyApi, TimelineItem } from "@/api/clinic";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";

export default function PatientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState("history");
  const { user } = useAuth();

  const { data: history, isLoading } = useQuery({
    queryKey: ["history", id],
    queryFn: () => historyApi.patient(id!),
    enabled: !!id,
  });

  const patient = history?.patient;
  const timeline = history?.timeline || [];
  const canEdit = ["admin", "receptionist", "nurse"].includes(user?.role || "");
  const canPrescribe = ["admin", "doctor"].includes(user?.role || "");
  const canBook = ["admin", "doctor", "receptionist", "nurse"].includes(user?.role || "");

  if (isLoading || !patient) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header & Actions */}
      <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/patients" className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-gray-200 text-gray-400 hover:text-emerald-600 hover:border-emerald-200 transition-all">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{patient.name}</h1>
              <span className="ai-badge">VETERAN PATIENT</span>
            </div>
            <p className="text-gray-500 font-medium">ID: #{id?.slice(0, 8).toUpperCase()}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          {canEdit && (
            <Link href={`/dashboard/patients/${id}/edit`} className="btn-secondary">
              <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              Edit Profile
            </Link>
          )}
          {canBook && (
            <Link href={`/dashboard/appointments/new?patientId=${id}`} className="btn-primary">
              <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Book Appointment
            </Link>
          )}
          {canPrescribe && (
            <Link href={`/dashboard/prescriptions/new?patientId=${id}`} className="btn-primary">
              <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1" />
              </svg>
              New Prescription
            </Link>
          )}
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Profile Card & Bio */}
        <div className="space-y-8">
          <div className="card-premium overflow-hidden">
            <div className="h-24 bg-gradient-to-r from-emerald-600 to-emerald-800" />
            <div className="px-6 pb-6 mt-[-3rem]">
              <div className="relative mb-4 h-24 w-24 overflow-hidden rounded-2xl border-4 border-white bg-emerald-50 shadow-md">
                <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-emerald-600">
                  {patient.name.charAt(0)}
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900">{patient.name}</h3>
                <div className="mt-1 flex items-center gap-2">
                  <span className="flex h-2 w-2 rounded-full bg-emerald-600" />
                  <p className="text-sm font-semibold text-emerald-600">Active Records</p>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-gray-100">
                <InfoItem label="Age" value={`${patient.age} years`} />
                <InfoItem label="Gender" value={patient.gender} capitalize />
                <InfoItem label="Blood Group" value={patient.bloodGroup || "—"} />
                <InfoItem label="Contact" value={patient.contact} />
                <InfoItem label="Email" value={patient.email || "—"} />
              </div>

              <div className="mt-8 rounded-xl bg-gray-50 p-4 border border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Health Risk Score</span>
                  <span className="text-xs font-bold text-emerald-600">Low Risk</span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-200 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full" style={{ width: '15%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AI Summary & Timeline */}
        <div className="lg:col-span-2 space-y-8">
          {/* AI Panel */}
          <section className="ai-panel">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 shadow-sm">
                <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-emerald-900">AI Medical Summary</h3>
            </div>
            <p className="text-emerald-800 text-sm leading-relaxed">
              Patient is a {patient.age}-year-old {patient.gender} with a stable clinical history. Based on recent vitals and lab reports, there are no immediate red flags. Recommend follow-up for routine screening in 3 months. Last dosage of prescribed antibiotics was successfully completed.
            </p>
          </section>

          {/* Activity Tabs */}
          <section>
            <div className="mb-6 flex gap-8 border-b border-gray-200">
              <TabButton active={activeTab === "history"} onClick={() => setActiveTab("history")} label="Timeline" />
              <TabButton active={activeTab === "vitals"} onClick={() => setActiveTab("vitals")} label="Vitals" />
              <TabButton active={activeTab === "labs"} onClick={() => setActiveTab("labs")} label="Lab Results" />
            </div>

            <div className="space-y-4">
              {activeTab === "history" && (
                <>
                  {timeline.map((item: TimelineItem) => (
                    <div key={item.id} className="card-premium group p-5 hover:border-emerald-200 transition-all">
                      <div className="flex items-start justify-between">
                        <div className="flex gap-4">
                          <div className={`mt-1 flex h-10 w-10 items-center justify-center rounded-xl ${item.type === 'prescription' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'
                            }`}>
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              {item.type === 'prescription'
                                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1" />
                                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              }
                            </svg>
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900 group-hover:text-emerald-700 capitalize">{item.type} Recorded</h4>
                            <p className="text-xs text-gray-500 mt-0.5">{new Date(item.date).toLocaleString([], { dateStyle: 'long', timeStyle: 'short' })}</p>
                            {item.type === "prescription" && (
                              <Link href={`/dashboard/prescriptions/${item.id}`} className="mt-3 inline-flex items-center text-xs font-bold text-emerald-600 hover:text-emerald-700 uppercase tracking-wider">
                                View Detailed Record
                                <svg className="h-3 w-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {timeline.length === 0 && (
                    <div className="text-center py-12 rounded-2xl border-2 border-dashed border-gray-200">
                      <p className="text-gray-400 font-medium font-sans">No clinical history records found for this patient.</p>
                    </div>
                  )}
                </>
              )}
              {activeTab !== "history" && (
                <div className="text-center py-12 rounded-2xl border-2 border-dashed border-gray-200">
                  <p className="text-gray-400 font-medium">Record viewing for {activeTab} is coming in the next update.</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function InfoItem({ label, value, capitalize }: { label: string; value: string | number; capitalize?: boolean }) {
  return (
    <div className="flex justify-between items-center text-sm">
      <dt className="text-gray-400 font-medium">{label}</dt>
      <dd className={`font-bold text-gray-800 ${capitalize ? 'capitalize' : ''}`}>{value}</dd>
    </div>
  );
}

function TabButton({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`pb-3 text-sm font-bold tracking-tight transition-all ${active
        ? "border-b-2 border-emerald-600 text-emerald-700"
        : "text-gray-400 hover:text-gray-600"
        }`}
    >
      {label}
    </button>
  );
}
