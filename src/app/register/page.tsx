"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { useClinic } from "@/context/ClinicContext";
import { toast } from "react-hot-toast";

export default function RegisterPage() {
  const { register } = useAuth();
  const { clinic } = useClinic();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<"patient" | "doctor" | "receptionist" | "nurse" | "lab_technician" | "pharmacist">("patient");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Access codes do not match");
      return;
    }

    setLoading(true);
    try {
      await register({
        name,
        email,
        password,
        role,
        clinicId: clinic?._id
      });

      if (role === "patient") {
        toast.success("Clinical membership enrolled");
        router.push("/dashboard");
      } else {
        toast.success("Registration received. Pending clinical verification.", { duration: 6000 });
        router.push("/login");
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        toast.error(err.response?.data?.message || "Enrollment failed");
      } else {
        toast.error("Registration failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-6 bg-slate-50/30 selection:bg-emerald-100">
      <div className="w-full max-w-lg space-y-10">
        <div className="text-center">
          <Link href="/" className="inline-flex h-16 w-16 mb-6 rounded-3xl bg-gradient-to-br from-emerald-500 to-emerald-700 items-center justify-center text-white shadow-2xl shadow-emerald-600/30 hover:scale-105 transition-all duration-500 border border-emerald-400/20">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </Link>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Clinical Staff Enrollment</h1>
          <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] mt-2">Initialize your specialized role profile</p>
        </div>

        <div className="card-premium p-10 shadow-2xl shadow-gray-200/50">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="name" className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-field py-3.5 font-medium"
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="role" className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                  Clinical Role
                </label>
                <select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value as typeof role)}
                  className="input-field py-3.5 font-bold bg-gray-50/50"
                >
                  <option value="patient">Patient Client</option>
                  <option value="doctor">Medical Doctor</option>
                  <option value="nurse">Nurse</option>
                  <option value="receptionist">Receptionist</option>
                  <option value="lab_technician">Lab Technician</option>
                  <option value="pharmacist">Pharmacist</option>
                </select>
              </div>
            </div>

            {role !== "patient" && (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-100 flex items-start gap-3 animate-pulse-slow">
                <svg className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p className="text-[10px] font-bold text-amber-800 leading-relaxed uppercase tracking-widest">
                  Important: {role} accounts require manual clinical verification by an administrator before access is granted.
                </p>
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="email" className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                Professional Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field py-3.5 font-medium"
                placeholder="you@example.com"
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="password" className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                  Access Code
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field py-3.5 font-medium"
                  placeholder="Min 6 chars"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                  Confirm Access
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input-field py-3.5 font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-4 text-xs shadow-xl shadow-emerald-600/20 mt-6"
            >
              {loading ? "Processing Enrollment..." : "Finalize Profile Creation"}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-gray-50 text-center">
            <p className="text-sm text-gray-400 font-medium">
              Already possess clinical access?{" "}
              <Link href="/login" className="font-bold text-emerald-600 hover:underline">
                Secure Login
              </Link>
            </p>
          </div>
        </div>

        <div className="text-center opacity-30">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em]">Institutional Data Protection Active</p>
        </div>
      </div>
    </div>
  );
}
