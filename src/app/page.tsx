"use client";

import Link from "next/link";
import { useState } from "react";

export default function HomePage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-white selection:bg-emerald-100 selection:text-emerald-900 overflow-x-hidden">
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-emerald-50 rounded-full blur-[160px] opacity-40 animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] bg-emerald-50 rounded-full blur-[140px] opacity-30" />
        <div className="absolute top-[30%] right-[10%] w-[30%] h-[30%] bg-blue-50/30 rounded-full blur-[120px] opacity-20" />
      </div>

      {/* Navigation Bar */}
      <nav className="relative z-50 flex items-center justify-between px-6 md:px-8 py-6 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="h-10 w-10 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-xl flex items-center justify-center text-white shadow-xl shadow-emerald-200 group-hover:rotate-6 transition-all duration-300 border border-emerald-400/20">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="text-xl font-black text-gray-900 tracking-tight">Shifa<span className="text-emerald-600 italic">AI</span></span>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {/* <Link href="#features" className="text-xs font-black uppercase tracking-widest text-gray-400 hover:text-emerald-600 transition-colors">Specialties</Link>
          <Link href="#analytics" className="text-xs font-black uppercase tracking-widest text-gray-400 hover:text-emerald-600 transition-colors">Precision</Link> */}
          <Link href="/login" className="btn-secondary px-6 py-2.5 text-[10px] border-none shadow-none hover:bg-emerald-50 bg-transparent">Clinician Portal</Link>
          <Link href="/register" className="btn-primary px-6 py-2.5 text-[10px] shadow-emerald-100">Get Started</Link>
        </div>

        {/* Mobile Toggle */}
        <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden text-gray-900 p-2">
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Mobile Menu Drawer */}
        <div className={`fixed inset-0 z-[100] bg-white transition-transform duration-500 md:hidden ${isMobileMenuOpen ? "translate-x-0" : "translate-x-full"}`}>
          <div className="p-8 h-full flex flex-col">
            <div className="flex items-center justify-between mb-12">
              <span className="text-xl font-black text-gray-900">ShifaAI</span>
              <button onClick={() => setIsMobileMenuOpen(false)} className="text-gray-900 p-2">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex flex-col gap-8">
              <Link href="#features" onClick={() => setIsMobileMenuOpen(false)} className="text-2xl font-black text-gray-900 uppercase tracking-tighter">Specialties</Link>
              <Link href="#analytics" onClick={() => setIsMobileMenuOpen(false)} className="text-2xl font-black text-gray-900 uppercase tracking-tighter">Precision</Link>
              <div className="h-px bg-gray-100 w-full my-4" />
              <Link href="/login" className="text-xl font-bold text-emerald-600">Clinician Portal</Link>
              <Link href="/register" className="btn-primary py-5 text-sm shadow-2xl shadow-emerald-500/20">Provision Your Clinic</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 flex flex-col items-center justify-center px-6 pt-20 pb-32 text-center max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 mb-8 animate-fade-in">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[9px] font-black text-emerald-800 uppercase tracking-[0.3em]">Intelligence-Driven Clinic</span>
        </div>

        <h1 className="text-6xl md:text-8xl font-black text-gray-900 tracking-tighter leading-[0.95] mb-8">
          The Future of <br />
          <span className="text-emerald-600 italic drop-shadow-sm">Modern Medicine</span>
        </h1>

        <p className="mx-auto max-w-2xl text-lg md:text-xl text-gray-500 font-medium leading-relaxed mb-12">
          ShifaAI unifies symptom diagnostic assistance, pharmacy fulfillment, and
          real-time lab analytics into a singular, medical-grade emerald ecosystem.
        </p>

        <div className="flex flex-col sm:flex-row gap-5 items-center justify-center">
          <Link
            href="/register"
            className="btn-primary px-12 py-5 text-xs shadow-2xl shadow-emerald-500/20 group uppercase tracking-widest"
          >
            Provision Your Clinic
            <svg className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
          <Link
            href="/login"
            className="btn-secondary px-12 py-5 text-xs border-2 uppercase tracking-widest hover:border-emerald-600 bg-white"
          >
            Login
          </Link>
        </div>
      </main>

      {/* Feature Grid */}
      <section id="features" className="relative z-10 py-32 bg-gray-50/50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />}
              title="AI Symptom Core"
              description="High-precision neurological and physiological diagnostic assistance powered by advanced clinical LLMs."
            />
            <FeatureCard
              icon={<path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />}
              title="Emerald Pharmacy"
              description="Automated prescription fulfillment queue with real-time patient notifications and inventory tracking."
            />
            <FeatureCard
              icon={<path d="M13 10V3L4 14h7v7l9-11h-7z" />}
              title="Precision Lab Hub"
              description="Direct integration with laboratory data, featuring automated status alerts and trend analysis."
            />
          </div>
        </div>
      </section>

      {/* Social Proof / Stats */}
      <section className="relative z-10 py-24">
        <div className="max-w-7xl mx-auto px-8 grid grid-cols-2 md:grid-cols-4 gap-12 text-center opacity-60">
          <div>
            <div className="text-4xl font-black text-gray-900 mb-1">99.9%</div>
            <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">System Uptime</div>
          </div>
          <div>
            <div className="text-4xl font-black text-gray-900 mb-1">50ms</div>
            <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">AI latency</div>
          </div>
          <div>
            <div className="text-4xl font-black text-gray-900 mb-1">256-bit</div>
            <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Bio-Security</div>
          </div>
          <div>
            <div className="text-4xl font-black text-gray-900 mb-1">100+</div>
            <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Partner Clinics</div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-12 px-8 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">© 2026 ShifaAI Clinical Technologies. All Rights Reserved.</p>
        <div className="flex gap-8">
          <Link href="#" className="text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:text-emerald-600 transition-colors">Privacy Shield</Link>
          <Link href="#" className="text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:text-emerald-600 transition-colors">Compliance</Link>
          <Link href="#" className="text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:text-emerald-600 transition-colors">Integrations</Link>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="card-premium p-10 hover-scale-sm group">
      <div className="h-14 w-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mb-8 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-500 shadow-sm border border-emerald-100">
        <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {icon}
        </svg>
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-3 tracking-tight">{title}</h3>
      <p className="text-sm text-gray-500 font-medium leading-relaxed">{description}</p>
    </div>
  );
}
