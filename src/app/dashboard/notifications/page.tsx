"use client";

import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationApi } from "@/api/clinic";

export default function NotificationsPage() {
    const { user } = useAuth();
    const [filter, setFilter] = useState<"all" | "unread" | "lab" | "appointment" | "prescription">("all");
    const queryClient = useQueryClient();

    const { data: notifications = [], isLoading } = useQuery({
        queryKey: ["notifications"],
        queryFn: notificationApi.list,
    });

    const markReadMutation = useMutation({
        mutationFn: notificationApi.markAsRead,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
    });

    const markAllReadMutation = useMutation({
        mutationFn: notificationApi.markAllAsRead,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
    });

    const filtered = notifications.filter((n: any) => {
        if (filter === "all") return true;
        if (filter === "unread") return !n.isRead;
        return n.type === filter;
    });

    return (
        <div className="p-8 space-y-8 animate-fadeIn">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Clinical Alerts</h1>
                    <p className="text-gray-500 font-medium mt-1">Monitor real-time system notifications and patient status changes.</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => markAllReadMutation.mutate()}
                        className="btn-primary py-2.5 px-6 text-xs shadow-emerald-glow"
                        disabled={markAllReadMutation.isPending}
                    >
                        {markAllReadMutation.isPending ? "Processing..." : "Mark All as Read"}
                    </button>
                </div>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {(["all", "unread", "lab", "appointment", "prescription"] as const).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setFilter(tab)}
                        className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${filter === tab
                            ? "bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-600/20"
                            : "bg-white text-gray-400 border-gray-100 hover:border-emerald-200 hover:text-emerald-600"
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            <div className="space-y-4">
                {isLoading ? (
                    <div className="py-20 flex justify-center">
                        <div className="h-10 w-10 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
                    </div>
                ) : filtered.map((n: any) => (
                    <div
                        key={n._id}
                        onClick={() => markReadMutation.mutate(n._id)}
                        className={`group card-premium p-6 transition-all hover-scale-sm cursor-pointer border-l-4 ${!n.isRead ? "border-l-emerald-500 bg-white" : "border-l-gray-200 bg-gray-50/30"
                            }`}
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex gap-5">
                                <div className={`mt-1 h-12 w-12 rounded-2xl flex items-center justify-center flex-shrink-0 border ${n.type === 'lab' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                    n.type === 'appointment' ? 'bg-purple-50 text-purple-600 border-purple-100' :
                                        n.type === 'prescription' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                            'bg-emerald-50 text-emerald-600 border-emerald-100'
                                    }`}>
                                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        {n.type === 'lab' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />}
                                        {n.type === 'appointment' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />}
                                        {n.type === 'prescription' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />}
                                        {n.type === 'system' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />}
                                    </svg>
                                </div>
                                <div>
                                    <div className="flex items-center gap-3">
                                        <h3 className={`text-lg font-bold tracking-tight ${!n.isRead ? "text-gray-900" : "text-gray-600"}`}>{n.title}</h3>
                                        {n.priority === 'high' && <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest bg-red-100 text-red-600">Urgent</span>}
                                    </div>
                                    <p className="text-sm text-gray-500 mt-1 max-w-2xl leading-relaxed">{n.message}</p>
                                    <div className="flex items-center gap-4 mt-3">
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{new Date(n.createdAt).toLocaleString()}</span>
                                        <span className="h-1 w-1 rounded-full bg-gray-200" />
                                        <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest group-hover:underline">Clear Alert</span>
                                    </div>
                                </div>
                            </div>
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                <button className="h-8 w-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400">
                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {filtered.length === 0 && (
                    <div className="py-20 text-center card-premium border-2 border-dashed border-emerald-100 bg-emerald-50/10">
                        <div className="h-20 w-20 rounded-3xl bg-white shadow-xl flex items-center justify-center mx-auto mb-6 border border-emerald-50">
                            <svg className="h-10 w-10 text-emerald-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0a2 2 0 01-2 2H6a2 2 0 01-2-2m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                            </svg>
                        </div>
                        <p className="text-sm font-black text-emerald-900/40 uppercase tracking-[0.3em]">No Active Alerts</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">All clinical systems are currently operating within nominal parameters.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
