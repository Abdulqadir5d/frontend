"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { patientApi } from "@/api/clinic";
import Link from "next/link";
import { useState, useEffect } from "react";
import axios from "axios";

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
    onSuccess: () => router.push(`/dashboard/patients/${id}`),
    onError: (err) => {
      if (axios.isAxiosError(err)) setError(err.response?.data?.message || "Failed to update");
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
      <div className="flex justify-center py-12">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-teal-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <Link href={`/dashboard/patients/${id}`} className="text-teal-600 hover:underline">← Back</Link>
        <h1 className="text-2xl font-bold">Edit Patient</h1>
      </div>
      <form onSubmit={handleSubmit} className="mx-auto max-w-lg space-y-4 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800/50">
        {error && <p className="rounded bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400">{error}</p>}
        <div>
          <label className="mb-1 block text-sm font-medium">Name *</label>
          <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="input-field" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Age *</label>
            <input type="number" required min={0} max={150} value={age} onChange={(e) => setAge(e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Gender *</label>
            <select value={gender} onChange={(e) => setGender(e.target.value as typeof gender)} className="input-field">
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Contact *</label>
          <input type="text" required value={contact} onChange={(e) => setContact(e.target.value)} className="input-field" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Address</label>
          <textarea value={address} onChange={(e) => setAddress(e.target.value)} className="input-field min-h-[80px]" rows={3} />
        </div>
        <div className="flex gap-3">
          <button type="submit" disabled={updateMutation.isPending} className="btn-primary">
            {updateMutation.isPending ? "Saving..." : "Save Changes"}
          </button>
          <Link href={`/dashboard/patients/${id}`} className="btn-secondary">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
