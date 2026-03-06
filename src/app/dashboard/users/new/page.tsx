"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { userApi } from "@/api/clinic";
import RoleGuard from "@/components/RoleGuard";
import Link from "next/link";
import axios from "axios";
import { toast } from "react-hot-toast";

const ROLES = ["admin", "doctor", "receptionist", "patient", "nurse", "pharmacist", "lab_technician"] as const;

export default function NewUserPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<typeof ROLES[number]>("doctor");
  const [specialization, setSpecialization] = useState("");
  const [error, setError] = useState("");

  const createMutation = useMutation({
    mutationFn: userApi.create,
    onSuccess: () => {
      toast.success("Staff account provisioned successfully");
      router.push("/dashboard/users");
    },
    onError: (err) => {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Failed to create user");
        toast.error(err.response?.data?.message || "Creation failed");
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name?.trim() || !email?.trim() || !password) {
      setError("Name, email and password are required");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    createMutation.mutate({
      name: name.trim(),
      email: email.trim(),
      password,
      role,
      specialization: specialization?.trim() || undefined,
    });
  };

  return (
    <RoleGuard roles={["admin"]}>
      <div className="p-8">
        <div className="mb-10 flex items-center gap-6">
          <Link
            href="/dashboard/users"
            className="h-10 w-10 rounded-xl bg-white border border-gray-100 shadow-sm flex items-center justify-center text-gray-400 hover:text-emerald-600 hover:border-emerald-100 transition-all"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Provision Staff Account</h1>
            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mt-1">Administrative Access Control</p>
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
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Legal Full Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input-field py-3 font-medium"
                    placeholder="e.g. Dr. Sarah Chen"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Staff Email Address *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-field py-3 font-medium"
                    placeholder="s.chen@clinic.com"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Secure Password *</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field py-3"
                    placeholder="••••••••"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Platform Role *</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as typeof ROLES[number])}
                    className="input-field py-3 font-black bg-gray-50/50"
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1).replace("_", " ")}</option>
                    ))}
                  </select>
                </div>
              </div>

              {role === "doctor" && (
                <div className="pt-4 border-t border-gray-100">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Medical Specialization</label>
                  <input
                    type="text"
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                    className="input-field py-3 font-medium"
                    placeholder="e.g. Cardiology, Pediatrics"
                  />
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="btn-primary flex-1 py-4 text-xs shadow-xl shadow-emerald-600/20"
                >
                  {createMutation.isPending ? "Syncing Identity..." : "Create Staff Account"}
                </button>
                <Link href="/dashboard/users" className="btn-secondary px-8 py-4">Discard</Link>
              </div>
            </form>
          </div>

          <div className="space-y-6">
            <div className="ai-panel bg-emerald-900 border-none p-8 text-emerald-50">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-4 text-emerald-400">Identity Guidelines</h3>
              <ul className="space-y-4">
                <li className="flex gap-3 text-[11px] leading-relaxed opacity-80">
                  <span className="h-5 w-5 rounded-full bg-emerald-800 flex items-center justify-center shrink-0">1</span>
                  <span className="text-emerald-800">Ensure staff emails are clinic-verified for internal communications.</span>
                </li>
                <li className="flex gap-3 text-[11px] leading-relaxed opacity-80">
                  <span className="h-5 w-5 rounded-full bg-emerald-800 flex items-center justify-center shrink-0">2</span>
                  <span className="text-emerald-800"> Roles determine system-wide access permissions and patient record visibility.
                  </span></li>
                <li className="flex gap-3 text-[11px] leading-relaxed opacity-80">
                  <span className="h-5 w-5 rounded-full bg-emerald-800 flex items-center justify-center shrink-0">3</span>
                  <span className="text-emerald-800"> Doctors require a specialization entry for proper appointment routing.</span>
                </li>
              </ul>
            </div>

            <div className="card-premium p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active System Logs</h4>
              </div>
              <p className="text-xs text-gray-400 font-medium">Currently monitoring account provisioning for compliance.</p>
            </div>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}
