"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { aiApi } from "@/api/clinic";
import { useAuth } from "@/context/AuthContext";

export default function AIPage() {
  const { user } = useAuth();
  const [symptoms, setSymptoms] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [history, setHistory] = useState("");
  const [result, setResult] = useState<{
    possibleConditions?: string[];
    riskLevel?: string;
    suggestedTests?: string[];
    aiEnabled?: boolean;
  } | null>(null);

  const symptomMutation = useMutation({
    mutationFn: aiApi.checkSymptoms,
    onSuccess: (data) => setResult(data),
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

  const hasPro = user?.subscriptionPlan === "pro";

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-slate-800 dark:text-slate-100">AI Symptom Checker</h1>

      {!hasPro && (
        <div className="mb-6 rounded-lg bg-amber-50 p-4 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200">
          <p className="text-sm">Pro plan required for full AI analysis. Basic suggestions will be shown.</p>
        </div>
      )}

      <form onSubmit={handleCheck} className="mb-8 max-w-xl space-y-4 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800/50">
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
          {symptomMutation.isPending ? "Analyzing..." : "Analyze"}
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
              {user?.role === "admin" && (
                <p className="mt-3 rounded border border-amber-300 bg-white/50 p-2 text-xs text-slate-600 dark:border-amber-700 dark:bg-slate-800/50 dark:text-slate-400">
                  To enable AI: set <code className="rounded bg-slate-200 px-1 dark:bg-slate-700">GEMINI_API_KEY</code> in the backend <code className="rounded bg-slate-200 px-1 dark:bg-slate-700">.env</code> and restart the server.
                </p>
              )}
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
                  {(result.possibleConditions || []).map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>
              {result.riskLevel && (
                <div>
                  <p className="text-sm font-medium text-slate-500">Risk level</p>
                  <p className={`mt-1 font-medium capitalize ${
                    result.riskLevel === "high" ? "text-red-600" :
                    result.riskLevel === "medium" ? "text-amber-600" : "text-green-600"
                  }`}>{result.riskLevel}</p>
                </div>
              )}
              {result.suggestedTests?.length ? (
                <div>
                  <p className="text-sm font-medium text-slate-500">Suggested tests</p>
                  <ul className="mt-1 list-inside list-disc text-sm">
                    {result.suggestedTests.map((t, i) => (
                      <li key={i}>{t}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
