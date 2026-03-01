import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-slate-50 to-teal-50/30 dark:from-slate-900 dark:to-slate-950">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-4xl font-bold text-teal-600 dark:text-teal-400">AI Clinic Management</h1>
        <p className="mt-3 text-lg text-slate-600 dark:text-slate-400">
          Smart Diagnosis SaaS – Digitize your clinic operations with AI assistance
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link
            href="/login"
            className="rounded-lg bg-teal-600 px-6 py-3 font-medium text-white hover:bg-teal-700"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="rounded-lg border border-teal-600 px-6 py-3 font-medium text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/20"
          >
            Register
          </Link>
        </div>
      </div>
    </div>
  );
}
