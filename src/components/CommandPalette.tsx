"use client";

import { useState, useEffect, useCallback } from "react";
import { useGlobalSearch } from "@/api/queries";
import { useRouter } from "next/navigation";

export default function CommandPalette() {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState("");
    const router = useRouter();
    const { data, isLoading } = useGlobalSearch(query);

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (e.ctrlKey && e.key === "k") {
            e.preventDefault();
            setIsOpen((prev) => !prev);
        }
        if (e.key === "Escape") {
            setIsOpen(false);
        }
    }, []);

    useEffect(() => {
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [handleKeyDown]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 pt-[15vh] backdrop-blur-sm">
            <div className="w-full max-w-xl rounded-xl bg-white shadow-2xl dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                <div className="p-4 border-b dark:border-gray-800">
                    <input
                        autoFocus
                        type="text"
                        placeholder="Search patients, appointments, prescriptions... (Esc to close)"
                        className="w-full bg-transparent text-lg outline-none"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                </div>

                <div className="max-h-[60vh] overflow-y-auto p-2">
                    {isLoading && <p className="p-4 text-center text-gray-500">Searching...</p>}

                    {data && (
                        <div className="space-y-4">
                            {data.patients.length > 0 && (
                                <div>
                                    <h3 className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-gray-400">Patients</h3>
                                    {data.patients.map((p: any) => (
                                        <button
                                            key={p.id}
                                            onClick={() => { router.push(`/dashboard/patients/${p.id}`); setIsOpen(false); }}
                                            className="flex w-full flex-col px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                                        >
                                            <span className="font-medium">{p.title}</span>
                                            <span className="text-xs text-gray-500">{p.subtitle}</span>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {data.appointments.length > 0 && (
                                <div>
                                    <h3 className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-gray-400">Appointments</h3>
                                    {data.appointments.map((a: any) => (
                                        <button
                                            key={a.id}
                                            onClick={() => { router.push(`/dashboard/appointments`); setIsOpen(false); }}
                                            className="flex w-full flex-col px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                                        >
                                            <span className="font-medium">{a.title}</span>
                                            <span className="text-xs text-gray-500">{a.subtitle}</span>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {data.prescriptions.length > 0 && (
                                <div>
                                    <h3 className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-gray-400">Prescriptions</h3>
                                    {data.prescriptions.map((pr: any) => (
                                        <button
                                            key={pr.id}
                                            onClick={() => { router.push(`/dashboard/prescriptions`); setIsOpen(false); }}
                                            className="flex w-full flex-col px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                                        >
                                            <span className="font-medium">{pr.title}</span>
                                            <span className="text-xs text-gray-500">{pr.subtitle}</span>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {!data.patients.length && !data.appointments.length && !data.prescriptions.length && query.length >= 2 && (
                                <p className="p-4 text-center text-gray-500">No results found for "{query}"</p>
                            )}
                        </div>
                    )}

                    {query.length < 2 && (
                        <p className="p-4 text-center text-sm text-gray-400">Type at least 2 characters to search...</p>
                    )}
                </div>
            </div>
        </div>
    );
}
