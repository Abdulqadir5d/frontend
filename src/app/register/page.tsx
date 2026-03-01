"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRegisterClinic } from "@/api/queries";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";

export default function RegisterPage() {
  const { register } = useAuth();
  const registerClinic = useRegisterClinic();
  const router = useRouter();

  const [mode, setMode] = useState<"user" | "clinic">("user");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<"patient" | "doctor" | "receptionist">("patient");

  // Clinic Fields
  const [clinicName, setClinicName] = useState("");
  const [subdomain, setSubdomain] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      if (mode === "clinic") {
        await registerClinic.mutateAsync({
          clinicName,
          subdomain,
          adminName: name,
          adminEmail: email,
          password,
        });
      } else {
        await register({ name, email, password, role });
      }
      router.push("/dashboard");
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Registration failed");
      } else {
        setError("Registration failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 dark:bg-slate-900">
      <div className="w-full max-w-md space-y-6 rounded-xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-teal-600 dark:text-teal-400">AI Clinic</h1>
          <div className="mt-4 flex rounded-lg bg-slate-100 p-1 dark:bg-slate-900">
            <button
              onClick={() => setMode("user")}
              className={`flex-1 rounded-md py-1.5 text-xs font-medium transition-all ${mode === "user" ? "bg-white shadow-sm dark:bg-slate-800" : "text-slate-500 hover:text-slate-700"}`}
            >
              User Account
            </button>
            <button
              onClick={() => setMode("clinic")}
              className={`flex-1 rounded-md py-1.5 text-xs font-medium transition-all ${mode === "clinic" ? "bg-white shadow-sm dark:bg-slate-800" : "text-slate-500 hover:text-slate-700"}`}
            >
              Clinic Signup
            </button>
          </div>
        </div>
        {error && (
          <p className="rounded-lg bg-red-50 p-3 text-center text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400">
            {error}
          </p>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field"
              placeholder="John Doe"
            />
          </div>


          {mode === "clinic" ? (
            <>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Clinic Name</label>
                <input
                  type="text"
                  required
                  value={clinicName}
                  onChange={(e) => setClinicName(e.target.value)}
                  className="input-field"
                  placeholder="City Health Clinic"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Subdomain</label>
                <div className="flex">
                  <input
                    type="text"
                    required
                    value={subdomain}
                    onChange={(e) => setSubdomain(e.target.value.toLowerCase().replace(/\s+/g, ""))}
                    className="input-field rounded-r-none"
                    placeholder="city-health"
                  />
                  <span className="flex items-center rounded-r-lg border border-l-0 border-slate-300 bg-slate-50 px-3 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-950">
                    .aiclinic.com
                  </span>
                </div>
              </div>
            </>
          ) : (
            <div>
              <label htmlFor="role" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Role
              </label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value as typeof role)}
                className="input-field"
              >
                <option value="patient">Patient</option>
                <option value="doctor">Doctor</option>
                <option value="receptionist">Receptionist</option>
              </select>
            </div>
          )}

          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              placeholder={mode === "clinic" ? "Admin Email" : "you@example.com"}
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              placeholder="Min 6 characters"
            />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="input-field"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-teal-600 px-4 py-2 font-medium text-white hover:bg-teal-700 disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Register"}
          </button>
        </form>
        <p className="text-center text-sm text-slate-600 dark:text-slate-400">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-teal-600 hover:underline dark:text-teal-400">
            Login
          </Link>
        </p>
      </div >
    </div >
  );
}
