"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useClinic } from "@/context/ClinicContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { toast } from "react-hot-toast";

export default function LoginPage() {
  const { login } = useAuth();
  const { clinic, loading: clinicLoading } = useClinic();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Clinical access granted");
      router.push("/dashboard");
    } catch (err) {
      if (axios.isAxiosError(err)) {
        toast.error(err.response?.data?.message || "Authentication failed");
      } else {
        toast.error("Access denied");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-6 bg-slate-50/30 selection:bg-emerald-100">
      <div className="w-full max-w-md space-y-10">
        <div className="flex flex-col items-center gap-6">
          <Link href="/" className="flex flex-col items-center gap-4 group">
            <div className="h-20 w-20 rounded-[2rem] bg-emerald-600 flex items-center justify-center text-white text-3xl font-black shadow-2xl shadow-emerald-600/30 group-hover:scale-105 transition-transform">
              {clinic?.name?.[0] || "H"}
            </div>
            <div className="text-center">
              <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                {clinic?.name ? clinic.name : "ShifaAI Portal"}
              </h1>
              <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mt-1">Authorized Personnel Only</p>
            </div>
          </Link>
        </div>

        <div className="card-premium p-10 shadow-2xl shadow-gray-200/50">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="clinician@shifaai.com"
                className="input-field py-3.5 font-medium focus:ring-emerald-500/10"
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label htmlFor="password" className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  Password
                </label>
                <Link href="#" className="text-[10px] font-bold text-emerald-600 hover:underline uppercase tracking-widest">Forgot?</Link>
              </div>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input-field py-3.5 font-medium focus:ring-emerald-500/10"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-4 text-xs shadow-xl shadow-emerald-600/20 mt-4"
            >
              {loading ? "Verifying Credentials..." : "Grant Secure Access"}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-gray-50 text-center">
            <p className="text-sm text-gray-400 font-medium">
              New institution or staff?{" "}
              <Link href="/register" className="font-bold text-emerald-600 hover:underline">
                Create Registry
              </Link>
            </p>
          </div>
        </div>

        <div className="text-center opacity-30">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em]">Encrypted Clinical Environment</p>
        </div>
      </div>
    </div>
  );
}
