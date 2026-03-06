"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { patientApi } from "@/api/clinic";
import Link from "next/link";
import axios from "axios";

export default function NewPatientPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState<"male" | "female" | "other">("male");
  const [contact, setContact] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");

  const createMutation = useMutation({
    mutationFn: patientApi.create,
    onSuccess: (p) => {
      router.push(`/dashboard/patients/${p._id}`);
    },
    onError: (err) => {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Failed to create patient");
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
    createMutation.mutate({
      name,
      age: ageNum,
      gender,
      contact,
      email: email || undefined,
      address: address || undefined,
    });
  };

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center gap-4">
        <Link href="/dashboard/patients" className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-gray-200 text-gray-400 hover:text-emerald-600 hover:border-emerald-200 transition-all shadow-sm">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Patient Registration</h1>
          <p className="text-gray-500 font-medium">Add a new record to your clinic database.</p>
        </div>
      </div>

      <div className="max-w-2xl">
        <form onSubmit={handleSubmit} className="card-premium p-8 space-y-6">
          {error && (
            <div className="rounded-xl bg-red-50 p-4 border border-red-100 flex gap-3">
              <svg className="h-5 w-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="text-sm text-red-800 font-bold">{error}</p>
            </div>
          )}

          <div className="grid gap-6 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Full Name *</label>
              <input
                type="text"
                required
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field py-3"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Age *</label>
              <input
                type="number"
                required
                min={0}
                max={150}
                placeholder="25"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="input-field py-3"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Gender *</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as typeof gender)}
                className="input-field py-3 font-bold"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Contact Number *</label>
              <input
                type="text"
                required
                placeholder="+91 98765 43210"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                className="input-field py-3"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Email Address</label>
              <input
                type="email"
                placeholder="patient@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field py-3"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Residential Address</label>
              <textarea
                placeholder="Street, City, State, ZIP..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="input-field py-3 min-h-[100px]"
                rows={3}
              />
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row gap-4">
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="btn-primary flex-1 py-4 text-base shadow-lg shadow-emerald-600/20"
            >
              {createMutation.isPending ? "Creating Permanent Record..." : "Register New Patient"}
            </button>
            <Link
              href="/dashboard/patients"
              className="btn-secondary px-8 py-4 text-center"
            >
              Cancel
            </Link>
          </div>
        </form>

        <div className="mt-8 ai-panel">
          <div className="flex items-center gap-2 mb-3">
            <span className="ai-badge">AI ASSISTANT</span>
            <h4 className="text-sm font-bold text-emerald-900">Registration Tip</h4>
          </div>
          <p className="text-xs text-emerald-800/80 leading-relaxed">
            Ensure the contact number is correct to enable automated appointment reminders and health report notifications.
          </p>
        </div>
      </div>
    </div>
  );
}
