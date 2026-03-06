"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { aiApi } from "@/api/clinic";
import { useAuth } from "@/context/AuthContext";

export default function AIPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const isDoctor = user?.role === "doctor";
  const [activeTab, setActiveTab] = useState<"symptoms" | "lab" | "analytics" | "risk">("symptoms");

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
    <div className="p-8">
      <div className="mb-8 overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center p-1.5 gap-2 w-fit">
        <button
          onClick={() => setActiveTab("symptoms")}
          className={`px-8 py-3 text-xs font-black uppercase tracking-widest transition-all rounded-xl ${activeTab === "symptoms"
            ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20"
            : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
            }`}
        >
          Symptom Checker
        </button>
        <button
          onClick={() => setActiveTab("lab")}
          className={`px-8 py-3 text-xs font-black uppercase tracking-widest transition-all rounded-xl ${activeTab === "lab"
            ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20"
            : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
            }`}
        >
          Lab Interpreter
        </button>
        {(isAdmin || isDoctor) && (
          <button
            onClick={() => setActiveTab("analytics")}
            className={`px-8 py-3 text-xs font-black uppercase tracking-widest transition-all rounded-xl ${activeTab === "analytics"
              ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20"
              : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
              }`}
          >
            Predictive Trends
          </button>
        )}
        {isDoctor && (
          <button
            onClick={() => setActiveTab("risk")}
            className={`px-8 py-3 text-xs font-black uppercase tracking-widest transition-all rounded-xl ${activeTab === "risk"
              ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20"
              : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
              }`}
          >
            Risk Flagging
          </button>
        )}
      </div>

      {!hasPro && (
        <div className="mb-8 rounded-2xl bg-amber-50 p-5 border border-amber-100 flex items-center gap-4">
          <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-white text-amber-600 shadow-sm border border-amber-50">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-bold text-amber-900 leading-tight">Standard Plan Active</p>
            <p className="text-xs text-amber-700 mt-1 font-medium">Upgrade to Pro for full neurological and deep-tissue AI analysis.</p>
          </div>
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-8">
          {activeTab === "symptoms" ? (
            <section className="card-premium p-8">
              <div className="flex items-center gap-3 mb-8">
                <div className="h-10 w-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-900 tracking-tight">AI Symptom Diagnostic</h2>
              </div>
              <form onSubmit={handleCheck} className="space-y-5">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Presenting Symptoms *</label>
                  <input
                    type="text"
                    required
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    placeholder="e.g. chronic headache, mild fever, dry cough"
                    className="input-field py-3 font-medium"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Patient Age</label>
                    <input type="number" value={age} onChange={(e) => setAge(e.target.value)} className="input-field py-3" placeholder="30" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Biological Gender</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="input-field py-3 font-bold"
                    >
                      <option value="">Select</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Anamnesis / History</label>
                  <textarea
                    value={history}
                    onChange={(e) => setHistory(e.target.value)}
                    className="input-field min-h-[120px] py-3 text-sm leading-relaxed"
                    placeholder="Document relevant past conditions or surgeries..."
                  />
                </div>
                <button
                  type="submit"
                  disabled={symptomMutation.isPending}
                  className="btn-primary w-full py-4 text-sm shadow-xl shadow-emerald-600/20"
                >
                  {symptomMutation.isPending ? "Generating Diagnosis..." : "Check Symptoms via AI"}
                </button>
              </form>
            </section>
          ) : activeTab === "lab" ? (
            <section className="card-premium p-8">
              <div className="flex items-center gap-3 mb-8">
                <div className="h-10 w-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-900 tracking-tight">AI Lab Report Interpreter</h2>
              </div>
              <form onSubmit={handleLabCheck} className="space-y-5">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Raw Report Data / Observations *</label>
                  <textarea
                    required
                    value={labData}
                    onChange={(e) => setLabData(e.target.value)}
                    placeholder="Example: Hb: 11.2 (Low), Platelets: 250k, RBC Morphology: Normal..."
                    className="input-field min-h-[220px] py-4 text-sm font-mono leading-relaxed"
                  />
                </div>
                <button
                  type="submit"
                  disabled={labMutation.isPending}
                  className="btn-primary w-full py-4 text-sm shadow-xl shadow-emerald-600/30"
                >
                  {labMutation.isPending ? "Processing Clinical Data..." : "Generate AI Interpretation"}
                </button>
              </form>
            </section>
          ) : (
            <div className="card-premium p-10 bg-emerald-50/30 border-dashed border-2 border-emerald-100 text-center">
              <div className="h-16 w-16 bg-white rounded-3xl shadow-sm border border-emerald-50 flex items-center justify-center mx-auto mb-6">
                <svg className="h-8 w-8 text-emerald-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-emerald-900 uppercase tracking-tight mb-2">Advanced Engine Ready</h3>
              <p className="text-xs text-emerald-700 font-medium leading-relaxed">
                The HealthAI clinical modeling interface is active. Select insights on the right to begin data synthesis and predictive audit.
              </p>
            </div>
          )}
        </div>

        <div className="space-y-8">
          {activeTab === "symptoms" ? (
            result ? (
              <div className="card-premium p-8 overflow-hidden relative">
                <div className="absolute top-0 right-0 h-32 w-32 bg-emerald-50 rounded-bl-full -mr-16 -mt-16 opacity-50 border-emerald-100 border" />
                <h2 className="text-xl font-bold text-gray-900 mb-6 tracking-tight relative z-10">Diagnostic Profile</h2>
                <div className="space-y-8 relative z-10">
                  <div>
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Detected Patterns</h4>
                    <ul className="grid gap-2">
                      {(result.possibleConditions || []).map((c: any, i: number) => (
                        <li key={i} className="flex items-center text-sm font-bold text-gray-700 bg-gray-50 p-3 rounded-xl border border-gray-100">
                          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-3 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                          {c}
                        </li>
                      ))}
                    </ul>
                  </div>
                  {result.riskLevel && (
                    <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-between">
                      <h4 className="text-[10px] font-black text-emerald-800 uppercase tracking-widest">Clinical Security Level</h4>
                      <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${result.riskLevel === "high" ? "bg-red-500 text-white" :
                        result.riskLevel === "medium" ? "bg-amber-500 text-white" : "bg-emerald-600 text-white"
                        }`}>{result.riskLevel} Risk</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center py-20 bg-gray-50/30 rounded-3xl border-2 border-dashed border-gray-100">
                <div className="h-16 w-16 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center mb-4">
                  <svg className="h-8 w-8 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Awaiting Input</p>
              </div>
            )
          ) : activeTab === "lab" ? (
            labResult ? (
              <div className="card-premium p-8 space-y-8">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900 tracking-tight">Report Intelligence</h2>
                  <span className="ai-badge">HIGH CONFIDENCE</span>
                </div>

                <div className="ai-panel border-none p-6 text-emerald-800 text-sm leading-relaxed font-medium italic">
                  "{labResult.summary}"
                </div>

                {labResult.criticalFlags?.length > 0 && (
                  <div className="rounded-2xl bg-red-50 p-6 border border-red-100">
                    <p className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-3">Critical Alert Flags</p>
                    <ul className="space-y-2">
                      {labResult.criticalFlags.map((f: any, i: number) => (
                        <li key={i} className="text-xs font-bold text-red-800 flex items-center">
                          <svg className="h-3 w-3 mr-2 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <div>
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Full Analytical Findings</h4>
                  <div className="text-sm text-gray-600 leading-relaxed font-medium whitespace-pre-wrap bg-gray-50 border border-gray-100 rounded-2xl p-6">
                    {labResult.findings}
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center py-20 bg-gray-50/30 rounded-3xl border-2 border-dashed border-gray-100">
                <div className="h-16 w-16 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center mb-4">
                  <svg className="h-8 w-8 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Awaiting Report Data</p>
              </div>
            )
          ) : activeTab === "analytics" ? (
            <div className="space-y-6">
              <div className="card-premium p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-10 w-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 tracking-tight">Predictive Modeling</h2>
                </div>
                <div className="space-y-4">
                  <div className="p-6 rounded-2xl bg-gray-50 border border-gray-100">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Trend Accuracy</p>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 w-[94%]" />
                      </div>
                      <span className="text-xs font-black text-emerald-600">94.2%</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-emerald-900 text-white p-8 rounded-[2rem] shadow-xl">
                <p className="text-xs font-black text-emerald-400 uppercase tracking-widest mb-4">AI Insight Preview</p>
                <p className="text-sm leading-relaxed opacity-90 italic">"Recent data indicates a rise in seasonal cases. Cross-referencing with inventory is recommended."</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="card-premium p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-10 w-10 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-red-600">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 tracking-tight">Risk Pattern Detection</h2>
                </div>
                <div className="p-8 rounded-[2rem] border-2 border-dashed border-gray-200 text-center">
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Awaiting Audit Initialization</p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-[#1B5E20] text-white rounded-[2rem] border-none p-8 shadow-2xl shadow-emerald-900/20 relative overflow-hidden group">
            <div className="absolute inset-0 animate-shimmer opacity-[0.03] pointer-events-none" />
            <h4 className="text-xs font-black uppercase tracking-[0.2em] mb-4 text-[#A5D6A7] relative z-10">Clinical Safety Shield</h4>
            <p className="text-xs leading-loose opacity-90 font-medium relative z-10 text-white">
              This AI model is for clinical assistance and secondary confirmation. Always cross-verify with physical examination and established medical protocols.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
