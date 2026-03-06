"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { prescriptionApi, patientApi, doctorApi } from "@/api/clinic";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import axios from "axios";
import { toast } from "react-hot-toast";

export default function NewPrescriptionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const patientIdParam = searchParams.get("patientId");
  const isAdmin = user?.role === "admin";
  const isDoctor = user?.role === "doctor";

  const [patientId, setPatientId] = useState(patientIdParam || "");
  const [doctorId, setDoctorId] = useState(isDoctor ? (user?.id ?? "") : "");
  const [diagnosis, setDiagnosis] = useState("");
  const [medicines, setMedicines] = useState([{ name: "", dosage: "", frequency: "", duration: "" }]);
  const [instructions, setInstructions] = useState("");

  const { data: patientsData, isLoading: patientsLoading } = useQuery({
    queryKey: ["patients-list"],
    queryFn: () => patientApi.list({ limit: 100 }),
  });

  const { data: doctorsData, isLoading: doctorsLoading } = useQuery({
    queryKey: ["doctors"],
    queryFn: doctorApi.list,
    enabled: isAdmin,
  });

  const createMutation = useMutation({
    mutationFn: prescriptionApi.create,
    onSuccess: () => {
      toast.success("Prescription generated successfully!");
      router.push("/dashboard/prescriptions");
    },
    onError: (err) => {
      if (axios.isAxiosError(err)) {
        toast.error(err.response?.data?.message || "Failed to create prescription");
      } else {
        toast.error("An unexpected error occurred");
      }
    },
  });

  useEffect(() => {
    if (patientIdParam) setPatientId(patientIdParam);
  }, [patientIdParam]);

  const addMedicine = () => setMedicines((m) => [...m, { name: "", dosage: "", frequency: "", duration: "" }]);
  const removeMedicine = (i: number) => {
    if (medicines.length > 1) {
      setMedicines((m) => m.filter((_, idx) => idx !== i));
    }
  };
  const updateMedicine = (i: number, field: string, val: string) => {
    setMedicines((m) => {
      const n = [...m];
      (n[i] as Record<string, string>)[field] = val;
      return n;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId) {
      toast.error("Please select a patient");
      return;
    }
    const meds = medicines.filter((m) => m.name.trim() && m.dosage.trim());
    if (meds.length === 0) {
      toast.error("At least one medicine with name and dosage is required");
      return;
    }
    if (!doctorId) {
      toast.error("Doctor information is missing. Please re-login.");
      return;
    }

    createMutation.mutate({
      patientId,
      doctorId,
      diagnosis,
      medicines: meds,
      instructions,
    });
  };

  const patients = patientsData?.patients || [];

  return (
    <div className="p-8">
      <div className="mb-10 flex items-center gap-6">
        <Link
          href="/dashboard/prescriptions"
          className="h-10 w-10 rounded-xl bg-white border border-gray-100 shadow-sm flex items-center justify-center text-gray-400 hover:text-emerald-600 hover:border-emerald-100 transition-all font-bold"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Generate Prescription</h1>
          <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mt-1">Pharmacological Directive</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="card-premium p-10 space-y-10">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Assigned Patient *</label>
                <select
                  required
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  className="input-field py-3 font-bold bg-gray-50/30"
                  disabled={patientsLoading}
                >
                  <option value="">{patientsLoading ? "Retrieving Records..." : "Select Patient Record..."}</option>
                  {patients.map((p) => (
                    <option key={p._id} value={p._id}>{p.name} {p.contact !== "n/a" ? `— ${p.contact}` : ""}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Clinical Diagnosis</label>
                <input
                  type="text"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  className="input-field py-3 font-medium"
                  placeholder="e.g. Acute Bacterial Sinusitis"
                />
              </div>
            </div>

            {isAdmin && (
              <div className="p-6 rounded-[2rem] bg-amber-50/50 border border-amber-100 space-y-2">
                <label className="block text-[10px] font-black text-amber-600 uppercase tracking-widest ml-1">Prescribing Clinician *</label>
                <select
                  required
                  value={doctorId}
                  onChange={(e) => setDoctorId(e.target.value)}
                  className="w-full bg-white border border-amber-100 rounded-2xl py-3 px-4 text-sm font-bold focus:ring-2 focus:ring-amber-500/20 focus:outline-none"
                  disabled={doctorsLoading}
                >
                  <option value="">{doctorsLoading ? "Loading Medical Staff..." : "Authorize Clinician..."}</option>
                  {(doctorsData?.doctors || []).map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Medical Regimen</h3>
                <button
                  type="button"
                  onClick={addMedicine}
                  className="inline-flex items-center text-[10px] font-black text-emerald-600 uppercase tracking-widest hover:text-emerald-700 transition-colors"
                >
                  <svg className="h-3 w-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Medication
                </button>
              </div>

              <div className="space-y-4">
                {medicines.map((m, i) => (
                  <div key={i} className="flex flex-col md:flex-row gap-3 bg-gray-50/50 p-6 rounded-[2.5rem] border border-gray-100 group relative transition-all hover:border-emerald-200 hover:bg-white shadow-sm hover:shadow-md">
                    <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-tighter ml-1">Drug Name</label>
                        <input
                          placeholder="Amoxicillin"
                          value={m.name}
                          onChange={(e) => updateMedicine(i, "name", e.target.value)}
                          className="w-full bg-white border border-gray-100 rounded-xl py-2 px-3 text-xs font-bold focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-tighter ml-1">Dosage</label>
                        <input
                          placeholder="500mg"
                          value={m.dosage}
                          onChange={(e) => updateMedicine(i, "dosage", e.target.value)}
                          className="w-full bg-white border border-gray-100 rounded-xl py-2 px-3 text-xs font-bold focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-tighter ml-1">Frequency</label>
                        <input
                          placeholder="BD (Twice Daily)"
                          value={m.frequency}
                          onChange={(e) => updateMedicine(i, "frequency", e.target.value)}
                          className="w-full bg-white border border-gray-100 rounded-xl py-2 px-3 text-xs font-bold focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-tighter ml-1">Duration</label>
                        <input
                          placeholder="7 Days"
                          value={m.duration}
                          onChange={(e) => updateMedicine(i, "duration", e.target.value)}
                          className="w-full bg-white border border-gray-100 rounded-xl py-2 px-3 text-xs font-bold focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                        />
                      </div>
                    </div>
                    {medicines.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeMedicine(i)}
                        className="md:mt-5 p-2 text-gray-300 hover:text-red-500 transition-colors"
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Supplementary Instructions</label>
              <textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                className="input-field min-h-[120px] py-4 text-sm font-medium leading-relaxed"
                placeholder="e.g. To be taken post-meal. Avoid consumption of dairy within 2 hours of dose."
              />
            </div>

            <div className="flex gap-6 pt-6 border-t border-gray-100">
              <button type="submit" disabled={createMutation.isPending} className="btn-primary flex-1 py-4 text-xs shadow-xl shadow-emerald-600/20">
                {createMutation.isPending ? "Validating & Syncing..." : "Authorize & Issue Prescription"}
              </button>
              <Link href="/dashboard/prescriptions" className="btn-secondary px-10 py-4">Discard</Link>
            </div>
          </form>
        </div>

        <div className="space-y-8">
          <div className="ai-panel bg-emerald-900 border-none p-10 text-emerald-50">
            <div className="h-12 w-12 rounded-2xl bg-emerald-800 flex items-center justify-center mb-6 border border-emerald-700">
              <svg className="h-6 w-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-4 text-emerald-400">Clinical Verification</h3>
            <p className="text-[11px] leading-relaxed opacity-70 mb-6 font-medium">
              This directive will be instantly synchronized with the Pharmacy Hub. Ensure all dosages are cross-verified with patient history.
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-emerald-400/60">
                <div className="h-1 w-1 rounded-full bg-emerald-500" />
                Role-Based Authorization
              </div>
              <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-emerald-400/60">
                <div className="h-1 w-1 rounded-full bg-emerald-500" />
                Pharmacy Queue Sync
              </div>
            </div>
          </div>

          <div className="card-premium p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 h-24 w-24 bg-gray-50 rounded-bl-full -mr-12 -mt-12 border border-gray-100" />
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Patient Snapshot</h4>
            {patientId ? (
              <div className="space-y-1">
                <p className="text-sm font-bold text-gray-900">{patients.find(p => p._id === patientId)?.name || "Record Selected"}</p>
                <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-tighter">Active Clinical File</p>
              </div>
            ) : (
              <p className="text-xs text-gray-400 italic font-medium uppercase tracking-tighter">Awaiting patient selection...</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
