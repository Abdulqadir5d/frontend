"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { userApi } from "@/api/clinic";
import Link from "next/link";
import axios from "axios";

const ROLES = ["admin", "doctor", "receptionist", "patient"] as const;

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
    onSuccess: () => router.push("/dashboard/users"),
    onError: (err) => {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Failed to create user");
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
    <div>
      <div className="mb-6 flex items-center gap-4">
        <Link href="/dashboard/users" className="text-teal-600 hover:underline dark:text-teal-400">
          ← Back
        </Link>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Add User</h1>
      </div>

      <form onSubmit={handleSubmit} className="mx-auto max-w-lg space-y-4 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800/50">
        {error && (
          <p className="rounded bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400">
            {error}
          </p>
        )}
        <div>
          <label className="mb-1 block text-sm font-medium">Name *</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input-field"
            placeholder="Full name"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Email *</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-field"
            placeholder="user@clinic.com"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Password * (min 6 characters)</label>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-field"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Role *</label>
          <select value={role} onChange={(e) => setRole(e.target.value as typeof ROLES[number])} className="input-field">
            {ROLES.map((r) => (
              <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
            ))}
          </select>
        </div>
        {role === "doctor" && (
          <div>
            <label className="mb-1 block text-sm font-medium">Specialization</label>
            <input
              type="text"
              value={specialization}
              onChange={(e) => setSpecialization(e.target.value)}
              className="input-field"
              placeholder="e.g. General Physician"
            />
          </div>
        )}
        <div className="flex gap-3">
          <button type="submit" disabled={createMutation.isPending} className="btn-primary">
            {createMutation.isPending ? "Creating..." : "Create User"}
          </button>
          <Link href="/dashboard/users" className="btn-secondary">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
