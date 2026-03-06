"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { patientApi } from "@/api/clinic";
import Link from "next/link";
import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";

export default function EditPatientPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState<"male" | "female" | "other">("male");
  const [contact, setContact] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");

  const { data: patient, isLoading } = useQuery({
    queryKey: ["patient", id],
    queryFn: () => patientApi.get(id!),
    enabled: !!id,
  });

  useEffect(() => {
    if (patient) {
      setName(patient.name || "");
      setAge(String(patient.age ?? ""));
      setGender((patient.gender as "male" | "female" | "other") || "male");
      setContact(patient.contact || "");
      setEmail(patient.email || "");
      setAddress(patient.address || "");
    }
  }, [patient]);

  const updateMutation = useMutation({
    mutationFn: (data: Parameters<typeof patientApi.update>[1]) => patientApi.update(id!, data),
    onSuccess: () => {
      toast.success("Clinical record updated");
      router.push(`/dashboard/patients/${id}`);
    },
    onError: (err) => {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Failed to update");
        toast.error(err.response?.data?.message || "Submission failed");
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const ageNum = parseInt(age, 10);
    if (!name?.trim() || !contact?.trim()) {
      setError("Name and contact are required");
      return;
    }
    if (isNaN(ageNum) || ageNum < 0 || ageNum > 150) {
      setError("Age must be between 0 and 150");
      return;
    }
    updateMutation.mutate({
      name: name.trim(),
      age: ageNum,
      gender,
      contact: contact.trim(),
      email: email?.trim() || undefined,
      address: address?.trim() || undefined,
    });
  };

  if (isLoading || !patient) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-10 flex items-center gap-6">
        <Link
          href={`/dashboard/patients/${id}`}
          className="h-10 w-10 rounded-xl bg-white border border-gray-100 shadow-sm flex items-center justify-center text-gray-400 hover:text-emerald-600 hover:border-emerald-100 transition-all font-bold"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Modify Clinical Record</h1>
          <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mt-1">Patient Profile Adjustment</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="card-premium p-10 space-y-8">
            {error && (
              <div className="rounded-2xl bg-red-50 p-4 border border-red-100 flex items-center gap-3">
                <svg className="h-5 w-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-xs font-bold text-red-700">{error}</p>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Legal Full Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-field py-3 font-medium"
                  placeholder="e.g. Jonathan Doe"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Current Age *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    max={150}
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="input-field py-3 font-bold text-center"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Biological Sex *</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as typeof gender)}
                    className="input-field py-3 font-bold bg-gray-50/50"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Contact Phone *</label>
                <input
                  type="text"
                  required
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  className="input-field py-3 font-medium"
                  placeholder="+1 (555) 000-0000"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field py-3 font-medium"
                  placeholder="patient@email.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Residential Address</label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="input-field min-h-[100px] py-4 text-sm font-medium leading-relaxed"
                rows={3}
                placeholder="Enter full physical address..."
              />
            </div>

            <div className="flex gap-4 pt-6 border-t border-gray-100">
              <button
                type="submit"
                disabled={updateMutation.isPending}
                className="btn-primary flex-1 py-4 text-xs shadow-xl shadow-emerald-600/20"
              >
                {updateMutation.isPending ? "Updating Repository..." : "Finalize Changes"}
              </button>
              <Link href={`/dashboard/patients/${id}`} className="btn-secondary px-10 py-4">Discard</Link>
            </div>
          </form>
        </div>

        <div className="space-y-8">
          <div className="rounded-3xl bg-emerald-950 p-10 text-emerald-50 border border-emerald-900 shadow-2xl shadow-emerald-950/40 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-50" />
            <div className="relative z-10">
              <div className="h-12 w-12 rounded-2xl bg-emerald-900/50 flex items-center justify-center mb-6 border border-emerald-800 backdrop-blur-sm group-hover:scale-110 transition-transform duration-500">
                <svg className="h-6 w-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-4 text-emerald-400">Record Sensitivity</h3>
              <p className="text-[11px] leading-relaxed text-emerald-50 font-medium">
                You are modifying a controlled clinical record. All changes are logged into the audit trail for compliance and data integrity.
              </p>
            </div>
          </div>

          <div className="card-premium p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 h-24 w-24 bg-gray-50 rounded-bl-full -mr-12 -mt-12 border border-gray-100" />
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Account Metadata</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-[10px] font-bold">
                <span className="text-gray-400 uppercase tracking-widest">Internal ID</span>
                <span className="text-gray-900 font-black">#{id?.slice(-8).toUpperCase()}</span>
              </div>
              <div className="flex justify-between items-center text-[10px] font-bold">
                <span className="text-gray-400 uppercase tracking-widest">Last Modified</span>
                <span className="text-gray-900 font-black">{new Date(patient.updatedAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
