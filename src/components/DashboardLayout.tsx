"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useEffect } from "react";

const roleNav: Record<string, { label: string; href: string }[]> = {
  admin: [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Users", href: "/dashboard/users" },
    { label: "Patients", href: "/dashboard/patients" },
    { label: "Appointments", href: "/dashboard/appointments" },
    { label: "Analytics", href: "/dashboard/analytics" },
  ],
  doctor: [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Appointments", href: "/dashboard/appointments" },
    { label: "Patients", href: "/dashboard/patients" },
    { label: "Prescriptions", href: "/dashboard/prescriptions" },
    { label: "AI Assistant", href: "/dashboard/ai" },
    { label: "Analytics", href: "/dashboard/analytics" },
  ],
  receptionist: [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Patients", href: "/dashboard/patients" },
    { label: "Appointments", href: "/dashboard/appointments" },
  ],
  patient: [
    { label: "Profile", href: "/dashboard" },
    { label: "Appointments", href: "/dashboard/appointments" },
    { label: "Prescriptions", href: "/dashboard/prescriptions" },
  ],
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-teal-500 border-t-transparent" />
      </div>
    );
  }

  const nav = roleNav[user.role] || roleNav.patient;

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 flex-shrink-0 border-r border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/50">
        <div className="sticky top-0 flex h-screen flex-col">
          <div className="border-b border-slate-200 p-4 dark:border-slate-800">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-600 text-white">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <span className="font-semibold text-slate-800 dark:text-slate-100">AI Clinic</span>
            </Link>
          </div>
          <nav className="flex-1 space-y-1 p-3">
            {nav.map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                className={`block rounded-lg px-3 py-2 text-sm font-medium transition ${
                  pathname === href || pathname?.startsWith(href + "/")
                    ? "bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300"
                    : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>
          <div className="border-t border-slate-200 p-3 dark:border-slate-800">
            <div className="rounded-lg bg-slate-100 dark:bg-slate-800 p-3">
              <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-200">{user.name}</p>
              <p className="truncate text-xs text-slate-500">{user.role}</p>
            </div>
            <button
              onClick={() => logout().then(() => router.push("/login"))}
              className="mt-2 w-full rounded-lg px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              Logout
            </button>
          </div>
        </div>
      </aside>
      <main className="flex-1 overflow-auto bg-slate-50/50 dark:bg-slate-950/50 p-6">
        {children}
      </main>
    </div>
  );
}
