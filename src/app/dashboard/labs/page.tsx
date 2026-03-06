"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { labApi, patientApi } from "@/api/clinic";
import { useAuth } from "@/context/AuthContext";
import RoleGuard from "@/components/RoleGuard";
import { toast } from "react-hot-toast";

export default function LabsPage() {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [showOrderModal, setShowOrderModal] = useState(false);
    const [showResultModal, setShowResultModal] = useState<string | null>(null);

    // Form states
    const [orderForm, setOrderForm] = useState({ patientId: "", testName: "", description: "" });
    const [resultForm, setResultForm] = useState({ results: "", status: "completed" });

    const { data: patients } = useQuery({
        queryKey: ["patients"],
        queryFn: () => patientApi.list({ limit: 100 }),
        enabled: user?.role === "admin" || user?.role === "doctor",
    });

    const { data: reports, isLoading } = useQuery({
        queryKey: ["lab-reports"],
        queryFn: () => labApi.list(),
    });

    const orderMutation = useMutation({
        mutationFn: labApi.order,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["lab-reports"] });
            setShowOrderModal(false);
            setOrderForm({ patientId: "", testName: "", description: "" });
            toast.success("Lab test ordered successfully");
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => labApi.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["lab-reports"] });
            setShowResultModal(null);
            setResultForm({ results: "", status: "completed" });
            toast.success("Lab report updated");
        },
    });

    const handleOrderSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        orderMutation.mutate(orderForm);
    };

    const handleResultSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (showResultModal) {
            updateMutation.mutate({ id: showResultModal, data: resultForm });
        }
    };

    const isTech = user?.role === "lab_technician";
    const isDoc = user?.role === "doctor" || user?.role === "admin";

    return (
        <RoleGuard roles={["admin", "doctor", "lab_technician", "receptionist"]}>
            <div className="p-8 space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Laboratory Center</h1>
                        <p className="text-gray-500 font-medium mt-1">Manage diagnostic requests and clinical results.</p>
                    </div>
                    {isDoc && (
                        <button onClick={() => setShowOrderModal(true)} className="btn-primary">
                            <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Order New Test
                        </button>
                    )}
                </div>

                <div className="card-premium overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50/50">
                                    <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">Patient</th>
                                    <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">Diagnostic Test</th>
                                    <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">Processing Status</th>
                                    <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">Requested By</th>
                                    <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">Date</th>
                                    <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-widest text-gray-400">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {isLoading ? (
                                    <tr><td colSpan={6} className="py-20 text-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent mx-auto" /></td></tr>
                                ) : reports?.reports.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="py-20 text-center">
                                            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">No diagnostic reports active.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    reports?.reports.map((r) => (
                                        <tr key={r._id} className="hover:bg-emerald-50/30 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-gray-900">{(r.patientId as any).name}</div>
                                                <div className="text-[10px] text-gray-400 uppercase font-black tracking-tighter">CLINICAL RECORD</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-100 w-fit">{r.testName}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest shadow-sm ${r.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                                                        r.status === 'ordered' ? 'bg-amber-100 text-amber-800' :
                                                            'bg-blue-100 text-blue-800'
                                                    }`}>
                                                    <span className={`mr-2 h-1.5 w-1.5 rounded-full ${r.status === 'completed' ? 'bg-emerald-600' :
                                                            r.status === 'ordered' ? 'bg-amber-600' : 'bg-blue-600'
                                                        }`} />
                                                    {r.status.replace('-', ' ')}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-xs font-bold text-gray-600">Dr. {(r.doctorId as any).name}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-xs font-bold text-gray-400">{new Date(r.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {isTech && r.status !== 'completed' && (
                                                    <button
                                                        onClick={() => {
                                                            setShowResultModal(r._id);
                                                            setResultForm({ ...resultForm, status: r.status === 'ordered' ? 'sample-collected' : 'completed' });
                                                        }}
                                                        className="text-emerald-600 hover:text-emerald-700 text-xs font-black uppercase tracking-widest"
                                                    >
                                                        Update
                                                    </button>
                                                )}
                                                {r.status === 'completed' && (
                                                    <button
                                                        onClick={() => alert(`Results Detail: ${r.results}`)}
                                                        className="text-gray-400 hover:text-emerald-600 text-xs font-black uppercase tracking-widest ml-3"
                                                    >
                                                        View Findings
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Order Modal */}
                {showOrderModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-emerald-950/20 backdrop-blur-md p-4">
                        <div className="w-full max-w-lg rounded-[2.5rem] bg-white p-10 shadow-2xl border border-gray-100">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="h-12 w-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20">
                                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                    </svg>
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">Diagnostic Order</h2>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Laboratory Request</p>
                                </div>
                            </div>

                            <form onSubmit={handleOrderSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Assigned Patient *</label>
                                    <select
                                        required
                                        className="input-field py-3 font-bold"
                                        value={orderForm.patientId}
                                        onChange={(e) => setOrderForm({ ...orderForm, patientId: e.target.value })}
                                    >
                                        <option value="">Select Record...</option>
                                        {patients?.patients.map(p => (
                                            <option key={p._id} value={p._id}>{p.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Test Classification *</label>
                                    <input
                                        required
                                        className="input-field py-3 font-medium"
                                        placeholder="e.g. Complete Blood Count (CBC)"
                                        value={orderForm.testName}
                                        onChange={(e) => setOrderForm({ ...orderForm, testName: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Clinical Manifestations</label>
                                    <textarea
                                        className="input-field min-h-[100px] py-3 text-sm"
                                        placeholder="Note primary symptoms or specific analysis requirements..."
                                        value={orderForm.description}
                                        onChange={(e) => setOrderForm({ ...orderForm, description: e.target.value })}
                                    />
                                </div>
                                <div className="flex gap-4 pt-4 border-t border-gray-100">
                                    <button type="submit" disabled={orderMutation.isPending} className="btn-primary flex-1 py-4 text-xs shadow-lg shadow-emerald-500/20">
                                        {orderMutation.isPending ? "Submitting Request..." : "Issue Diagnostic Order"}
                                    </button>
                                    <button type="button" onClick={() => setShowOrderModal(false)} className="btn-secondary px-8 py-4">
                                        Discard
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Status/Result Modal */}
                {showResultModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-emerald-950/20 backdrop-blur-md p-4">
                        <div className="w-full max-w-lg rounded-[2.5rem] bg-white p-10 shadow-2xl border border-gray-100">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="h-12 w-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20">
                                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">Report Progression</h2>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Technician Interface</p>
                                </div>
                            </div>

                            <form onSubmit={handleResultSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Current Lifecycle Status *</label>
                                    <select
                                        className="input-field py-3 font-bold"
                                        value={resultForm.status}
                                        onChange={(e) => setResultForm({ ...resultForm, status: e.target.value })}
                                    >
                                        <option value="sample-collected">Sample Collected</option>
                                        <option value="processing">Processing</option>
                                        <option value="completed">Completed & Finalized</option>
                                        <option value="cancelled">Analysis Voided</option>
                                    </select>
                                </div>
                                {resultForm.status === 'completed' && (
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Definitive Test Results *</label>
                                        <textarea
                                            required
                                            className="input-field min-h-[180px] py-4 text-sm font-mono leading-relaxed bg-gray-50"
                                            placeholder="Enter structured findings, values, and reference ranges..."
                                            value={resultForm.results}
                                            onChange={(e) => setResultForm({ ...resultForm, results: e.target.value })}
                                        />
                                    </div>
                                )}
                                <div className="flex gap-4 pt-4 border-t border-gray-100">
                                    <button type="submit" disabled={updateMutation.isPending} className="btn-primary flex-1 py-4 text-xs shadow-lg shadow-emerald-500/20">
                                        {updateMutation.isPending ? "Syncing Results..." : "Seal Diagnostic Report"}
                                    </button>
                                    <button type="button" onClick={() => setShowResultModal(null)} className="btn-secondary px-8 py-4">
                                        Cancel
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
