"use client";

import { useAuth } from "@/context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { prescriptionApi, labApi, vitalsApi } from "@/api/clinic";
import { useState } from "react";

export default function PatientHistoryPage() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<"prescriptions" | "labs" | "vitals">("prescriptions");

    const { data: prescriptionsData, isLoading: loadingRx } = useQuery({
        queryKey: ["history-prescriptions"],
        queryFn: () => prescriptionApi.list({}), // Backend filters by token for patients
    });
    const prescriptions = prescriptionsData?.prescriptions || [];

    const { data: labs = { reports: [] }, isLoading: loadingLabs } = useQuery({
        queryKey: ["history-labs"],
        queryFn: () => labApi.list({}),
    });

    const { data: vitals = [], isLoading: loadingVitals } = useQuery({
        queryKey: ["history-vitals", user?.patientId],
        queryFn: () => vitalsApi.list(user?.patientId!),
        enabled: !!user?.patientId,
    });

    return (
        <div className="p-8 space-y-8 animate-fadeIn">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Clinical History</h1>
                <p className="text-gray-500 font-medium mt-1">Access your comprehensive medical records and diagnostic history.</p>
            </div>

            <div className="flex gap-2 p-1 bg-gray-100 rounded-2xl w-fit">
                {(["prescriptions", "labs", "vitals"] as const).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-8 py-3 text-[10px] font-black uppercase tracking-widest transition-all rounded-xl ${activeTab === tab
                            ? "bg-white text-emerald-600 shadow-sm"
                            : "text-gray-400 hover:text-gray-600"
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            <div className="mt-8">
                {activeTab === "prescriptions" && (
                    <div className="space-y-4">
                        {prescriptions.length > 0 ? (
                            prescriptions.map((rx: any) => (
                                <div key={rx._id} className="card-premium p-6 hover-scale-sm">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <div className="flex items-center gap-3">
                                                <h3 className="text-lg font-bold text-gray-900">{rx.diagnosis || "General Consultation"}</h3>
                                                <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-wider">
                                                    {new Date(rx.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-500 font-medium mt-1">Dr. {rx.doctorId?.name || "Clinic Physician"}</p>

                                            <div className="mt-4 flex flex-wrap gap-2">
                                                {rx.medicines.map((m: any, idx: number) => (
                                                    <span key={idx} className="px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-lg text-xs font-bold text-gray-700">
                                                        {m.name} ({m.dosage})
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        <button className="btn-secondary !py-2 !text-[10px]">View Detail</button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <EmptyState icon="rx" title="No Prescriptions Found" />
                        )}
                    </div>
                )}

                {activeTab === "labs" && (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {labs.reports.length > 0 ? (
                            labs.reports.map((report: any) => (
                                <div key={report._id} className="card-premium p-6">
                                    <div className="h-10 w-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4">
                                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-base font-bold text-gray-900 uppercase tracking-tight">{report.testName}</h3>
                                    <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">{report.status}</p>
                                    <div className="mt-6 pt-6 border-t border-gray-50 flex justify-between items-center">
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{new Date(report.createdAt).toLocaleDateString()}</span>
                                        {report.status === "completed" && <button className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em]">View Results</button>}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <EmptyState icon="lab" title="No Lab Reports" />
                        )}
                    </div>
                )}

                {activeTab === "vitals" && (
                    <div className="card-premium p-8">
                        {vitals.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b border-gray-100">
                                            <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-4">Date</th>
                                            <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-4">BP</th>
                                            <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-4">BPM</th>
                                            <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-4">Temp</th>
                                            <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-4">SPO2</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {vitals.map((v: any) => (
                                            <tr key={v._id} className="group hover:bg-gray-50 transition-colors">
                                                <td className="py-4 px-4 text-xs font-bold text-gray-600">{new Date(v.createdAt).toLocaleDateString()}</td>
                                                <td className="py-4 px-4 text-xs font-black text-gray-900">{v.systolic}/{v.diastolic}</td>
                                                <td className="py-4 px-4 text-xs font-black text-gray-900">{v.heartRate}</td>
                                                <td className="py-4 px-4 text-xs font-black text-gray-900">{v.temperature}°F</td>
                                                <td className="py-4 px-4 text-xs font-black text-gray-900">{v.spo2}%</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <EmptyState icon="vitals" title="No Vitals Recorded" />
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

function EmptyState({ icon, title }: { icon: string; title: string }) {
    return (
        <div className="py-20 text-center border-2 border-dashed border-emerald-100 rounded-[2rem] bg-gray-50/50">
            <div className="h-16 w-16 bg-white rounded-2xl shadow-sm border border-emerald-50 flex items-center justify-center mx-auto mb-4">
                <svg className="h-8 w-8 text-emerald-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            </div>
            <p className="text-sm font-black text-emerald-900/40 uppercase tracking-[0.2em]">{title}</p>
        </div>
    );
}
