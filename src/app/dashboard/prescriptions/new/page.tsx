"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { prescriptionApi, patientApi } from "@/api/clinic";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import axios from "axios";

export default function NewPrescriptionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const patientIdParam = searchParams.get("patientId");

  const [patientId, setPatientId] = useState(patientIdParam || "");
  const [diagnosis, setDiagnosis] = useState("");
  const [medicines, setMedicines] = useState([{ name: "", dosage: "", frequency: "", duration: "" }]);
  const [instructions, setInstructions] = useState("");

  const { user } = useAuth();
  const doctorId = user?.id ?? "";

  const { data: patientsData } = useQuery({
    queryKey: ["patients-list"],
    queryFn: () => patientApi.list({ limit: 100 }),
  });

  const createMutation = useMutation({
    mutationFn: prescriptionApi.create,
    onSuccess: () => router.push("/dashboard/prescriptions"),
    onError: (err) => {
      if (axios.isAxiosError(err)) {
        alert(err.response?.data?.message || "Failed");
      }
    },
  });

  useEffect(() => {
    if (patientIdParam) setPatientId(patientIdParam);
  }, [patientIdParam]);

  const addMedicine = () => setMedicines((m) => [...m, { name: "", dosage: "", frequency: "", duration: "" }]);
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
      alert("Please select a patient");
      return;
    }
    const meds = medicines.filter((m) => m.name.trim() && m.dosage.trim());
    if (meds.length === 0) {
      alert("At least one medicine with name and dosage is required");
      return;
    }
    if (!doctorId) {
      alert("Doctor information is missing. Please re-login.");
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
    <div>
      <div className="mb-6 flex items-center gap-4">
        <Link href="/dashboard/prescriptions" className="text-teal-600 hover:underline">← Back</Link>
        <h1 className="text-2xl font-bold">Add Prescription</h1>
      </div>

      <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-4 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800/50">
        <div>
          <label className="mb-1 block text-sm font-medium">Patient *</label>
          <select required value={patientId} onChange={(e) => setPatientId(e.target.value)} className="input-field">
            <option value="">Select patient</option>
            {patients.map((p) => (
              <option key={p._id} value={p._id}>{p.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Diagnosis</label>
          <input type="text" value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} className="input-field" />
        </div>
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="text-sm font-medium">Medicines *</label>
            <button type="button" onClick={addMedicine} className="text-sm text-teal-600 hover:underline">+ Add</button>
          </div>
          <div className="space-y-3">
            {medicines.map((m, i) => (
              <div key={i} className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <input
                  placeholder="Name"
                  value={m.name}
                  onChange={(e) => updateMedicine(i, "name", e.target.value)}
                  className="rounded border px-2 py-1.5 text-sm"
                />
                <input
                  placeholder="Dosage"
                  value={m.dosage}
                  onChange={(e) => updateMedicine(i, "dosage", e.target.value)}
                  className="rounded border px-2 py-1.5 text-sm"
                />
                <input
                  placeholder="Frequency"
                  value={m.frequency}
                  onChange={(e) => updateMedicine(i, "frequency", e.target.value)}
                  className="rounded border px-2 py-1.5 text-sm"
                />
                <input
                  placeholder="Duration"
                  value={m.duration}
                  onChange={(e) => updateMedicine(i, "duration", e.target.value)}
                  className="rounded border px-2 py-1.5 text-sm"
                />
              </div>
            ))}
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Instructions</label>
          <textarea value={instructions} onChange={(e) => setInstructions(e.target.value)} className="input-field min-h-[80px]" />
        </div>
        <div className="flex gap-3">
          <button type="submit" disabled={createMutation.isPending} className="btn-primary">
            {createMutation.isPending ? "Saving..." : "Save Prescription"}
          </button>
          <Link href="/dashboard/prescriptions" className="btn-secondary">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
