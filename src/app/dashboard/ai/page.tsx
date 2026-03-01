"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { aiApi } from "@/api/clinic";
import { useAuth } from "@/context/AuthContext";

export default function AIPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"symptoms" | "lab">("symptoms");

  // Symptoms state
  const [symptoms, setSymptoms] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [history, setHistory] = useState("");
  const [result, setResult] = useState<any>(null);

  // Lab state
  const [labData, setLabData] = useState("");
  const [labResult, setLabResult] = useState<any>(null);

  const symptomMutation = useMutation({
    mutationFn: (data: any) => aiApi.checkSymptoms(data),
    onSuccess: (data) => setResult(data),
  });

  const labMutation = useMutation({
    mutationFn: (data: string) => aiApi.interpretLab(data),
    onSuccess: (data) => setLabResult(data),
  });

  const handleCheck = (e: React.FormEvent) => {
    e.preventDefault();
    const symList = symptoms.split(",").map((s) => s.trim()).filter(Boolean);
    if (!symList.length) return;
    setResult(null);
    symptomMutation.mutate({
      symptoms: symList,
      age: age ? parseInt(age, 10) : undefined,
      gender: gender || undefined,
      history: history || undefined,
    });
  };

  const handleLabCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!labData.trim()) return;
    setLabResult(null);
    labMutation.mutate(labData);
  };

  const hasPro = user?.subscriptionPlan === "pro";

  return (
    <div>
      <div className="flex items-center gap-8 mb-8 border-b dark:border-slate-700">
        <button
          onClick={() => setActiveTab("symptoms")}
          className={`pb-4 text-sm font-bold uppercase tracking-wider transition-colors ${activeTab === "symptoms" ? "border-b-2 border-blue-600 text-blue-600" : "text-slate-400 hover:text-slate-600"}`}
        >
          Symptom Checker
        </button>
        <button
          onClick={() => setActiveTab("lab")}
          className={`pb-4 text-sm font-bold uppercase tracking-wider transition-colors ${activeTab === "lab" ? "border-b-2 border-blue-600 text-blue-600" : "text-slate-400 hover:text-slate-600"}`}
        >
          Lab Interpreter
        </button>
      </div>

      {!hasPro && (
        <div className="mb-6 rounded-lg bg-amber-50 p-4 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200">
          <p className="text-sm">Pro plan required for full AI analysis. Basic suggestions will be shown.</p>
        </div>
      )}

      {activeTab === "symptoms" ? (
        <>
          <h2 className="mb-6 text-xl font-bold text-slate-800 dark:text-slate-100">AI Symptom Checker</h2>
          <form onSubmit={handleCheck} className="mb-8 max-w-xl space-y-4 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800/50">
            {/* ... Existing Symptom Form ... */}

            <div>
              <label className="mb-1 block text-sm font-medium">Symptoms * (comma-separated)</label>
              <input
                type="text"
                required
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder="e.g. headache, fever, cough"
                className="input-field"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium">Age</label>
                <input type="number" value={age} onChange={(e) => setAge(e.target.value)} className="input-field" placeholder="30" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Gender</label>
                <select value={gender} onChange={(e) => setGender(e.target.value)} className="input-field">
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Medical history</label>
              <textarea value={history} onChange={(e) => setHistory(e.target.value)} className="input-field min-h-[80px]" placeholder="Any relevant history..." />
            </div>
            <button type="submit" disabled={symptomMutation.isPending} className="btn-primary">
              {symptomMutation.isPending ? "Analyzing..." : "Check Symptoms"}
            </button>
          </form>

          {result && (() => {
            const fallbackMsg = "Unable to analyze - AI unavailable. Please consult manually.";
            const isUnavailable = result.possibleConditions?.length === 1 &&
              result.possibleConditions[0] === fallbackMsg;
            if (isUnavailable) {
              return (
                <div className="max-w-xl rounded-xl border border-amber-200 bg-amber-50 p-6 dark:border-amber-800 dark:bg-amber-900/20">
                  <h2 className="mb-2 font-semibold text-amber-800 dark:text-amber-200">AI analysis not available</h2>
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    AI analysis is not available right now. Please consult a healthcare provider for medical advice.
                  </p>
                </div>
              );
            }
            return (
              <div className="max-w-xl rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800/50">
                <h2 className="mb-4 font-semibold">Results</h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-slate-500">Possible conditions</p>
                    <ul className="mt-1 list-inside list-disc text-sm">
                      {(result.possibleConditions || []).map((c: any, i: number) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  </div>
                  {result.riskLevel && (
                    <div>
                      <p className="text-sm font-medium text-slate-500">Risk level</p>
                      <p className={`mt-1 font-medium capitalize ${result.riskLevel === "high" ? "text-red-600" :
                        result.riskLevel === "medium" ? "text-amber-600" : "text-green-600"
                        }`}>{result.riskLevel}</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
        </>
      ) : (
        <>
          <h2 className="mb-6 text-xl font-bold text-slate-800 dark:text-slate-100">AI Lab Interpreter</h2>
          <form onSubmit={handleLabCheck} className="mb-8 max-w-xl space-y-4 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800/50">
            <div>
              <label className="mb-1 block text-sm font-medium">Lab Report Data / Observations</label>
              <textarea
                required
                value={labData}
                onChange={(e) => setLabData(e.target.value)}
                placeholder="e.g. Hemoglobin: 11.5, WBC: 12000, Neutrophils: 80%..."
                className="input-field min-h-[150px]"
              />
            </div>
            <button type="submit" disabled={labMutation.isPending} className="btn-primary">
              {labMutation.isPending ? "Interpreting..." : "Interpret Report"}
            </button>
          </form>

          {labResult && (
            <div className="max-w-xl rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800/50">
              <h2 className="mb-4 font-semibold">AI Interpretation</h2>
              <div className="space-y-4">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg text-sm italic">
                  {labResult.summary}
                </div>
                {labResult.criticalFlags?.length > 0 && (
                  <div>
                    <p className="text-sm font-bold text-red-600 mb-1">Critical Flags</p>
                    <ul className="list-inside list-disc text-sm text-red-700 dark:text-red-400">
                      {labResult.criticalFlags.map((f: any, i: number) => <li key={i}>{f}</li>)}
                    </ul>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-slate-500">Key Findings</p>
                  <p className="text-sm whitespace-pre-wrap">{labResult.findings}</p>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

