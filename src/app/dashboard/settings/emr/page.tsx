"use client";

import { useEMRTemplates, useCreateEMRTemplate } from "@/api/queries";
import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";

export default function EMRSettingsPage() {
    const { data: templates, isLoading } = useEMRTemplates();
    const createMutation = useCreateEMRTemplate();
    const [isAdding, setIsAdding] = useState(false);
    const [name, setName] = useState("");
    const [fields, setFields] = useState([{ label: "", type: "text", required: false }]);

    const handleAddField = () => setFields([...fields, { label: "", type: "text", required: false }]);

    const handleCreate = async () => {
        try {
            await createMutation.mutateAsync({ name, fields });
            setIsAdding(false);
            setName("");
            setFields([{ label: "", type: "text", required: false }]);
        } catch (err) {
            alert("Failed to create template");
        }
    };

    return (
        <DashboardLayout>
            <div className="p-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold">EMR Templates</h1>
                        <p className="text-gray-500">Design custom forms for patient visits.</p>
                    </div>
                    <button
                        onClick={() => setIsAdding(true)}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                    >
                        Create Template
                    </button>
                </div>

                {isAdding && (
                    <div className="mb-12 p-6 border rounded-xl bg-white dark:bg-gray-950 dark:border-gray-800">
                        <h2 className="text-xl font-bold mb-4">New Template</h2>
                        <div className="space-y-4">
                            <input
                                type="text"
                                placeholder="Template Name (e.g. Dental Checkup)"
                                className="w-full p-2 border rounded-lg dark:bg-gray-900 dark:border-gray-800"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />

                            <div className="space-y-4">
                                <h3 className="font-semibold text-sm uppercase text-gray-400">Fields</h3>
                                {fields.map((f, i) => (
                                    <div key={i} className="flex gap-4 items-center">
                                        <input
                                            type="text"
                                            placeholder="Field Label"
                                            className="flex-1 p-2 border rounded-lg dark:bg-gray-900 dark:border-gray-800"
                                            value={f.label}
                                            onChange={(e) => {
                                                const n = [...fields];
                                                n[i].label = e.target.value;
                                                setFields(n);
                                            }}
                                        />
                                        <select
                                            className="p-2 border rounded-lg dark:bg-gray-900 dark:border-gray-800"
                                            value={f.type}
                                            onChange={(e) => {
                                                const n = [...fields];
                                                n[i].type = e.target.value as any;
                                                setFields(n);
                                            }}
                                        >
                                            <option value="text">Short Text</option>
                                            <option value="multiline">Long Text</option>
                                            <option value="number">Number</option>
                                            <option value="select">Dropdown</option>
                                        </select>
                                    </div>
                                ))}
                                <button onClick={handleAddField} className="text-blue-500 text-sm font-medium">+ Add Field</button>
                            </div>

                            <div className="pt-4 flex gap-4">
                                <button
                                    onClick={handleCreate}
                                    disabled={createMutation.isPending}
                                    className="bg-green-600 text-white px-6 py-2 rounded-lg"
                                >
                                    Save Template
                                </button>
                                <button onClick={() => setIsAdding(false)} className="text-gray-500">Cancel</button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {isLoading ? <p>Loading templates...</p> : templates?.map((t: any) => (
                        <div key={t._id} className="p-6 border rounded-xl bg-white dark:bg-gray-900 dark:border-gray-800">
                            <h3 className="font-bold text-lg mb-2">{t.name}</h3>
                            <p className="text-sm text-gray-500 mb-4">{t.fields.length} Custom Fields</p>
                            <div className="flex gap-2">
                                <button className="text-sm text-blue-500 hover:underline">Edit</button>
                                <button className="text-sm text-red-500 hover:underline">Delete</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </DashboardLayout>
    );
}
