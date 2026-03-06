"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { vitalsApi, patientApi } from "@/api/clinic";
import { useAuth } from "@/context/AuthContext";
import RoleGuard from "@/components/RoleGuard";
import { toast } from "react-hot-toast";

export default function VitalsPage() {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [selectedPatientId, setSelectedPatientId] = useState("");
    const [showAddModal, setShowAddModal] = useState(false);

    // Form state
    const [vitalsForm, setVitalsForm] = useState({
        weight: "",
        height: "",
        temperature: "",
        systolic: "",
        diastolic: "",
        pulse: "",
        oxygenSaturation: "",
    });

    const { data: patients } = useQuery({
        queryKey: ["patients"],
        queryFn: () => patientApi.list({ limit: 100 }),
    });

    const { data: vitalsHistory, isLoading: loadingVitals } = useQuery({
        queryKey: ["vitals", selectedPatientId],
        queryFn: () => vitalsApi.list(selectedPatientId),
        enabled: !!selectedPatientId,
    });

    const recordMutation = useMutation({
        mutationFn: vitalsApi.record,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["vitals", selectedPatientId] });
            setShowAddModal(false);
            setVitalsForm({
                weight: "",
                height: "",
                temperature: "",
                systolic: "",
                diastolic: "",
                pulse: "",
                oxygenSaturation: "",
            });
            toast.success("Vitals recorded successfully");
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedPatientId) return;

        recordMutation.mutate({
            patientId: selectedPatientId,
            weight: vitalsForm.weight ? Number(vitalsForm.weight) : undefined,
            height: vitalsForm.height ? Number(vitalsForm.height) : undefined,
            temperature: vitalsForm.temperature ? Number(vitalsForm.temperature) : undefined,
            bloodPressure: {
                systolic: vitalsForm.systolic ? Number(vitalsForm.systolic) : undefined,
                diastolic: vitalsForm.diastolic ? Number(vitalsForm.diastolic) : undefined,
            },
            pulse: vitalsForm.pulse ? Number(vitalsForm.pulse) : undefined,
            oxygenSaturation: vitalsForm.oxygenSaturation ? Number(vitalsForm.oxygenSaturation) : undefined,
        });
    };

    return (
        <RoleGuard roles={["admin", "doctor", "nurse"]}>
            <div className="p-8 space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Vitals Monitor</h1>
                        <p className="text-gray-500 font-medium mt-1">Track and record physiological parameters of patients.</p>
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        disabled={!selectedPatientId}
                        className="btn-primary disabled:opacity-50 shadow-xl shadow-emerald-500/20"
                    >
                        <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                        </svg>
                        New Entry
                    </button>
                </div>

                <div className="card-premium p-6 max-w-xl">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Select Patient to View History</label>
                    <select
                        value={selectedPatientId}
                        onChange={(e) => setSelectedPatientId(e.target.value)}
                        className="input-field py-3 font-bold bg-gray-50/50"
                    >
                        <option value="">Choose a patient record...</option>
                        {patients?.patients.map((p) => (
                            <option key={p._id} value={p._id}>
                                {p.name} {p.contact !== "n/a" ? `— ${p.contact}` : ""}
                            </option>
                        ))}
                    </select>
                </div>

                {selectedPatientId ? (
                    <div className="card-premium overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-100 bg-gray-50/50">
                                        <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">Timestamp</th>
                                        <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">Anthropometry</th>
                                        <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">Cardiovascular (BP)</th>
                                        <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">Core Temp</th>
                                        <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">Pulse/SpO2</th>
                                        <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">Recorded By</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {loadingVitals ? (
                                        <tr><td colSpan={6} className="py-20 text-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent mx-auto" /></td></tr>
                                    ) : vitalsHistory?.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="py-20 text-center">
                                                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">No vital history found for this patient.</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        vitalsHistory?.map((v) => (
                                            <tr key={v._id} className="hover:bg-emerald-50/50 transition-all group hover-scale-sm cursor-default">
                                                <td className="px-6 py-4">
                                                    <div className="text-xs font-bold text-gray-900">{new Date(v.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}</div>
                                                    <div className="text-[10px] text-gray-400 uppercase font-black">{new Date(v.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-bold text-gray-700">
                                                        {v.weight ? `${v.weight}kg` : "—"} / {v.height ? `${v.height}cm` : "—"}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-black text-emerald-600">
                                                        {v.bloodPressure?.systolic}/{v.bloodPressure?.diastolic} <span className="text-[10px] font-bold text-gray-400 ml-1">mmHg</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-bold text-gray-700">
                                                        {v.temperature ? `${v.temperature}°C` : "—"}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-xs font-bold text-gray-700">
                                                        {v.pulse ? `${v.pulse} bpm` : "—"} <span className="text-gray-300 mx-1">|</span> {v.oxygenSaturation ? `${v.oxygenSaturation}% SpO2` : "—"}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-xs font-bold text-gray-500">{v.recordedBy.name}</div>
                                                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">{v.recordedBy.role}</div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="flex h-80 flex-col items-center justify-center rounded-[2.5rem] border-2 border-dashed border-emerald-100 bg-emerald-50/10 relative overflow-hidden group">
                        <div className="absolute inset-0 opacity-5 pointer-events-none">
                            <svg className="h-full w-full" fill="none" viewBox="0 0 100 100" preserveAspectRatio="none">
                                <pattern id="medical-grid" width="10" height="10" patternUnits="userSpaceOnUse">
                                    <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5" />
                                </pattern>
                                <rect width="100" height="100" fill="url(#medical-grid)" />
                            </svg>
                        </div>
                        <div className="h-20 w-20 rounded-3xl bg-white shadow-xl shadow-emerald-600/5 flex items-center justify-center mb-6 border border-emerald-50 group-hover:scale-110 transition-transform">
                            <svg className="h-10 w-10 text-emerald-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                        </div>
                        <div className="text-center space-y-2">
                            <p className="text-sm font-black text-emerald-900/40 uppercase tracking-[0.3em]">Patient Data Staging</p>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-relaxed">Select a legal record from the repository above <br /> to initialize physiological history monitor</p>
                        </div>
                    </div>
                )}

                {/* Add Vitals Modal */}
                {showAddModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-emerald-950/20 backdrop-blur-md p-4">
                        <div className="w-full max-w-xl rounded-[2.5rem] bg-white p-10 shadow-2xl border border-gray-100 overflow-y-auto max-h-[90vh]">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="h-12 w-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20">
                                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">Record Vitals</h2>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Nursing Observation Log</p>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <VitalsInputField label="Weight" unit="KG" value={vitalsForm.weight} onChange={(v) => setVitalsForm({ ...vitalsForm, weight: v })} placeholder="70.5" />
                                    <VitalsInputField label="Height" unit="CM" value={vitalsForm.height} onChange={(v) => setVitalsForm({ ...vitalsForm, height: v })} placeholder="175" />
                                    <VitalsInputField label="BP Systolic" unit="mmHg" value={vitalsForm.systolic} onChange={(v) => setVitalsForm({ ...vitalsForm, systolic: v })} placeholder="120" />
                                    <VitalsInputField label="BP Diastolic" unit="mmHg" value={vitalsForm.diastolic} onChange={(v) => setVitalsForm({ ...vitalsForm, diastolic: v })} placeholder="80" />
                                    <VitalsInputField label="Temperature" unit="°C" value={vitalsForm.temperature} onChange={(v) => setVitalsForm({ ...vitalsForm, temperature: v })} placeholder="36.6" />
                                    <VitalsInputField label="Pulse Rate" unit="BPM" value={vitalsForm.pulse} onChange={(v) => setVitalsForm({ ...vitalsForm, pulse: v })} placeholder="72" />
                                    <div className="col-span-2">
                                        <VitalsInputField label="Oxygen Saturation (SpO2)" unit="%" value={vitalsForm.oxygenSaturation} onChange={(v) => setVitalsForm({ ...vitalsForm, oxygenSaturation: v })} placeholder="98" />
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-6 border-t border-gray-100">
                                    <button type="submit" disabled={recordMutation.isPending} className="btn-primary flex-1 py-4 text-xs shadow-lg shadow-emerald-500/20">
                                        {recordMutation.isPending ? "Recording Vital Data..." : "Finalize Vitals Entry"}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowAddModal(false)}
                                        className="btn-secondary px-8 py-4"
                                    >
                                        Discard
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </RoleGuard>
    );
}

function VitalsInputField({ label, unit, value, onChange, placeholder }: { label: string; unit: string; value: string; onChange: (v: string) => void; placeholder: string }) {
    return (
        <div className="space-y-2">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">{label} ({unit})</label>
            <div className="relative group">
                <input
                    type="number"
                    step="any"
                    placeholder={placeholder}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="input-field py-3 font-bold text-center pr-12"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-emerald-600/40 uppercase group-hover:text-emerald-600 transition-colors">
                    {unit}
                </span>
            </div>
        </div>
    );
}
