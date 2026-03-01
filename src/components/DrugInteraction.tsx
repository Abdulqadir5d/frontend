"use client";

import { useState } from "react";
import { useDrugInteractions } from "@/api/queries";

export default function DrugInteraction() {
    const [medicines, setMedicines] = useState<string[]>(["", ""]);
    const { mutateAsync, isPending, data } = useDrugInteractions();
    const [error, setError] = useState<string | null>(null);

    const handleAddMed = () => setMedicines([...medicines, ""]);
    const handleRemoveMed = (index: number) => {
        if (medicines.length > 2) {
            const newMeds = [...medicines];
            newMeds.splice(index, 1);
            setMedicines(newMeds);
        }
    };

    const handleCheck = async () => {
        setError(null);
        const filtered = medicines.filter(m => m.trim().length > 0);
        if (filtered.length < 2) {
            setError("Provide at least 2 medicines to check.");
            return;
        }
        try {
            await mutateAsync(filtered);
        } catch (err: any) {
            setError(err.response?.data?.message || "Check failed");
        }
    };

    return (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <h2 className="mb-4 text-xl font-semibold">AI Drug Interaction Checker</h2>
            <p className="mb-6 text-sm text-gray-500">Analyze potential conflicts between multiple medications.</p>

            <div className="space-y-3">
                {medicines.map((med, index) => (
                    <div key={index} className="flex gap-2">
                        <input
                            type="text"
                            placeholder={`Medicine ${index + 1}`}
                            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-950"
                            value={med}
                            onChange={(e) => {
                                const newMeds = [...medicines];
                                newMeds[index] = e.target.value;
                                setMedicines(newMeds);
                            }}
                        />
                        {medicines.length > 2 && (
                            <button
                                onClick={() => handleRemoveMed(index)}
                                className="text-red-500 hover:text-red-700"
                            >
                                &times;
                            </button>
                        )}
                    </div>
                ))}
            </div>

            <div className="mt-4 flex gap-4">
                <button
                    onClick={handleAddMed}
                    className="text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                    + Add Medicine
                </button>
                <button
                    onClick={handleCheck}
                    disabled={isPending}
                    className="rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
                >
                    {isPending ? "Analyzing..." : "Check Interactions"}
                </button>
            </div>

            {error && <p className="mt-4 text-sm text-red-500">{error}</p>}

            {data && (
                <div className={`mt-6 rounded-lg p-4 ${data.hasInteraction ? 'bg-red-50 dark:bg-red-900/10' : 'bg-green-50 dark:bg-green-900/10'}`}>
                    <div className="flex items-center gap-2 mb-2">
                        <div className={`h-3 w-3 rounded-full ${data.hasInteraction ? 'bg-red-500' : 'bg-green-500'}`} />
                        <h3 className="font-bold uppercase text-xs tracking-wider">
                            {data.hasInteraction ? `Interaction Found (${data.severity})` : "No Major Interactions"}
                        </h3>
                    </div>
                    <p className="text-sm">{data.summary}</p>

                    {data.conflictingPairs?.length > 0 && (
                        <div className="mt-4 space-y-2">
                            {data.conflictingPairs.map((pair: any, i: number) => (
                                <div key={i} className="border-t border-red-200 dark:border-red-800 pt-2 text-xs">
                                    <span className="font-bold">{pair.med1} + {pair.med2}:</span> {pair.description}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
