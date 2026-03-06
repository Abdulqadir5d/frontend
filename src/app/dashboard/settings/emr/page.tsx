"use client";

import { useEMRTemplates, useCreateEMRTemplate } from "@/api/queries";
import { useState } from "react";
import { toast } from "react-hot-toast";

export default function EMRSettingsPage() {
    const { data: templates, isLoading } = useEMRTemplates();
    const createMutation = useCreateEMRTemplate();
    const [isAdding, setIsAdding] = useState(false);
    const [name, setName] = useState("");
    const [fields, setFields] = useState([{ label: "", type: "text", required: false }]);

    const handleAddField = () => setFields([...fields, { label: "", type: "text", required: false }]);

    const handleCreate = async () => {
        if (!name.trim()) {
            toast.error("Template name is required");
            return;
        }
        try {
            await createMutation.mutateAsync({ name, fields });
            toast.success("Clinical template saved successfully!");
            setIsAdding(false);
            setName("");
            setFields([{ label: "", type: "text", required: false }]);
        } catch (err) {
            toast.error("Failed to create template");
        }
    };

    return (
        <div className="p-8 space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">EMR Architecture</h1>
                    <p className="text-gray-500 font-medium mt-1">Design custom clinical documentation structures.</p>
                </div>
                <button
                    onClick={() => setIsAdding(true)}
                    className="btn-primary shadow-xl shadow-emerald-500/20"
                >
                    <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                    </svg>
                    New Architecture
                </button>
            </div>

            {isAdding && (
                <div className="card-premium p-10 border-2 border-emerald-100 bg-emerald-50/10 shadow-lg">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="h-10 w-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20">
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-black text-gray-900 tracking-tight">Design Clinical Template</h2>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Template Nomenclature *</label>
                            <input
                                type="text"
                                placeholder="e.g. Neurological Assessment, Pediatric Follow-up"
                                className="input-field py-3 font-bold"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-4">Field Specifications</h3>
                            <div className="grid gap-4">
                                {fields.map((f, i) => (
                                    <div key={i} className="flex gap-4 items-center bg-white p-4 rounded-2xl border border-gray-100 shadow-sm transition-all hover:border-emerald-200">
                                        <div className="flex-1">
                                            <input
                                                type="text"
                                                placeholder="Data Label (e.g. Patient History)"
                                                className="w-full bg-transparent border-none focus:ring-0 font-bold text-gray-700 text-sm"
                                                value={f.label}
                                                onChange={(e) => {
                                                    const n = [...fields];
                                                    n[i].label = e.target.value;
                                                    setFields(n);
                                                }}
                                            />
                                        </div>
                                        <div className="h-6 w-px bg-gray-100 mx-2" />
                                        <select
                                            className="bg-transparent border-none focus:ring-0 text-[10px] font-black uppercase text-gray-400 tracking-widest cursor-pointer"
                                            value={f.type}
                                            onChange={(e) => {
                                                const n = [...fields];
                                                n[i].type = e.target.value as any;
                                                setFields(n);
                                            }}
                                        >
                                            <option value="text">Short Text</option>
                                            <option value="multiline">Long Format</option>
                                            <option value="number">Numeric</option>
                                            <option value="select">Dropdown</option>
                                        </select>
                                    </div>
                                ))}
                            </div>
                            <button
                                onClick={handleAddField}
                                className="inline-flex items-center px-4 py-2 rounded-xl bg-white border border-gray-100 text-[10px] font-black text-emerald-600 uppercase tracking-widest shadow-sm hover:bg-emerald-50 transition-colors"
                            >
                                <svg className="h-3 w-3 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                Append Data Field
                            </button>
                        </div>

                        <div className="pt-8 border-t border-gray-100 flex gap-4">
                            <button
                                onClick={handleCreate}
                                disabled={createMutation.isPending}
                                className="btn-primary flex-1 py-4 text-xs shadow-xl shadow-emerald-600/20"
                            >
                                {createMutation.isPending ? "Syncing Schema..." : "Architect Template"}
                            </button>
                            <button onClick={() => setIsAdding(false)} className="btn-secondary px-8 py-4">Discard</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {isLoading ? (
                    <div className="col-span-full py-20 text-center">
                        <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent mx-auto" />
                    </div>
                ) : templates?.length === 0 ? (
                    <div className="col-span-full flex h-60 flex-col items-center justify-center rounded-[2.5rem] border-2 border-dashed border-gray-100 bg-gray-50/30">
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest italic">No clinical architectures defined.</p>
                    </div>
                ) : templates?.map((t: any) => (
                    <div key={t._id} className="card-premium p-8 group hover:border-emerald-200 transition-all flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-lg text-gray-900 tracking-tight">{t.name}</h3>
                                <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                            </div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">{t.fields.length} Custom Parameters</p>
                        </div>
                        <div className="flex gap-4 pt-4 border-t border-gray-50">
                            <button className="text-[10px] font-black text-emerald-600 uppercase tracking-widest hover:text-emerald-700 transition-colors">Edit Schema</button>
                            <button className="text-[10px] font-black text-red-400 uppercase tracking-widest hover:text-red-600 transition-colors">Retire</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
