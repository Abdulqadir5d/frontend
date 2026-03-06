"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { prescriptionApi } from "@/api/clinic";
import { useAuth } from "@/context/AuthContext";
import RoleGuard from "@/components/RoleGuard";
import Link from "next/link";
import { toast } from "react-hot-toast";

export default function PharmacyPage() {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: ["prescriptions", "pharmacy-queue"],
        queryFn: () => prescriptionApi.list({}),
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, status }: { id: string; status: string }) =>
            prescriptionApi.updateFulfillment(id, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["prescriptions"] });
            toast.success("Prescription status updated");
        },
    });

    const pendingPrescriptions = data?.prescriptions || [];
    const stats = {
        pending: pendingPrescriptions.filter(p => p.fulfillmentStatus === 'pending').length,
        processed: pendingPrescriptions.filter(p => p.fulfillmentStatus === 'processed').length,
    };

    return (
        <RoleGuard roles={["admin", "pharmacist"]}>
            <div className="p-8 space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Pharmacy Hub</h1>
                        <p className="text-gray-500 font-medium mt-1">Dispensing and medication fulfillment queue.</p>
                    </div>
                    <div className="flex gap-4">
                        <div className="card-premium px-6 py-3 flex flex-col items-center">
                            <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Awaiting</span>
                            <span className="text-xl font-black text-gray-900">{stats.pending}</span>
                        </div>
                        <div className="card-premium px-6 py-3 flex flex-col items-center">
                            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Dispensed</span>
                            <span className="text-xl font-black text-gray-900">{stats.processed}</span>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    {isLoading ? (
                        <div className="flex h-[40vh] items-center justify-center">
                            <div className="h-10 w-10 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
                        </div>
                    ) : pendingPrescriptions.length === 0 ? (
                        <div className="flex h-80 flex-col items-center justify-center rounded-[2.5rem] border-2 border-dashed border-gray-100 bg-gray-50/30">
                            <div className="h-16 w-16 rounded-2xl bg-white shadow-sm border border-gray-100 flex items-center justify-center mb-4">
                                <svg className="h-8 w-8 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1" />
                                </svg>
                            </div>
                            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Queue is Clear</p>
                        </div>
                    ) : (
                        <div className="grid gap-6">
                            {pendingPrescriptions.map((rx) => (
                                <div key={rx._id} className="card-premium p-8 group hover:border-emerald-200 transition-all">
                                    <div className="flex flex-col lg:flex-row gap-8">
                                        <div className="flex-1 space-y-6">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-12 w-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 font-black border border-gray-100 uppercase">
                                                        {typeof rx.patientId === 'object' ? rx.patientId.name.charAt(0) : 'P'}
                                                    </div>
                                                    <div>
                                                        <h3 className="text-lg font-bold text-gray-900 tracking-tight flex items-center gap-2">
                                                            {typeof rx.patientId === 'object' ? rx.patientId.name : 'Unknown Patient'}
                                                            <Link
                                                                href={`/dashboard/patients/${typeof rx.patientId === 'object' ? rx.patientId._id : rx.patientId}`}
                                                                className="p-1 hover:bg-emerald-50 rounded-lg text-emerald-600 transition-colors"
                                                                title="View Profile"
                                                            >
                                                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                                </svg>
                                                            </Link>
                                                        </h3>
                                                        <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">
                                                            Prescribed by Dr. {typeof rx.doctorId === 'object' ? rx.doctorId.name : 'Unknown'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <span className={`inline-flex items-center rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest shadow-sm ${rx.fulfillmentStatus === 'processed' ? 'bg-emerald-100 text-emerald-800' :
                                                    rx.fulfillmentStatus === 'pending' ? 'bg-amber-100 text-amber-800' :
                                                        'bg-gray-100 text-gray-800'
                                                    }`}>
                                                    <span className={`mr-2 h-1.5 w-1.5 rounded-full ${rx.fulfillmentStatus === 'processed' ? 'bg-emerald-600' :
                                                        rx.fulfillmentStatus === 'pending' ? 'bg-amber-600' : 'bg-gray-600'
                                                        }`} />
                                                    {rx.fulfillmentStatus}
                                                </span>
                                            </div>

                                            <div className="grid sm:grid-cols-2 gap-6 p-6 rounded-[2rem] bg-gray-50/50 border border-gray-100">
                                                {rx.medicines.map((m, i) => (
                                                    <div key={i} className="flex flex-col gap-1 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                                                        <div className="flex items-center gap-2">
                                                            <div className="h-2 w-2 rounded-full bg-emerald-500" />
                                                            <span className="text-sm font-bold text-gray-900">{m.name}</span>
                                                        </div>
                                                        <div className="flex items-center justify-between mt-2">
                                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Dosage</span>
                                                            <span className="text-xs font-bold text-emerald-700">{m.dosage}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="flex items-center gap-4 text-[10px] font-bold text-gray-400">
                                                <div className="flex items-center gap-1.5">
                                                    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    {new Date(rx.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                                <div className="h-1 w-1 rounded-full bg-gray-200" />
                                                <span className="uppercase tracking-widest">INV #{rx._id.slice(-6).toUpperCase()}</span>
                                            </div>
                                        </div>

                                        <div className="lg:w-64 flex flex-col gap-3 justify-center">
                                            <button
                                                onClick={() => updateMutation.mutate({ id: rx._id, status: 'processed' })}
                                                disabled={rx.fulfillmentStatus === 'processed' || updateMutation.isPending}
                                                className="btn-primary w-full py-4 text-xs shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:shadow-none"
                                            >
                                                Mark as Dispensed
                                            </button>
                                            <button
                                                onClick={() => updateMutation.mutate({ id: rx._id, status: 'out-of-stock' })}
                                                disabled={rx.fulfillmentStatus === 'out-of-stock' || rx.fulfillmentStatus === 'processed' || updateMutation.isPending}
                                                className="w-full rounded-2xl border-2 border-red-100 bg-white py-4 text-[10px] font-black uppercase tracking-widest text-red-600 hover:bg-red-50 hover:border-red-200 transition-all disabled:opacity-30 disabled:grayscale"
                                            >
                                                Set Out of Stock
                                            </button>
                                            <Link
                                                href={`/dashboard/prescriptions/${rx._id}`}
                                                className="inline-flex items-center justify-center text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mt-2 hover:text-emerald-600 transition-colors"
                                            >
                                                Full Record
                                                <svg className="h-3 w-3 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </RoleGuard>
    );
}
