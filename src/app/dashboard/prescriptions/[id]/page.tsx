"use client";

import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { prescriptionApi } from "@/api/clinic";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { toast } from "react-hot-toast";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

export default function PrescriptionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: rx, isLoading } = useQuery({
    queryKey: ["prescription", id],
    queryFn: () => prescriptionApi.get(id!),
    enabled: !!id,
  });

  const downloadPdf = () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
    if (!token) return;
    const url = `${API_URL}/prescriptions/${id}/pdf`;
    const win = window.open("", "_blank");
    if (win) {
      toast.loading("Preparing medical document...", { id: "pdf-load" });
      fetch(url, { headers: { Authorization: `Bearer ${token}` } })
        .then((r) => (r.ok ? r.text() : Promise.reject(new Error("Failed to load PDF"))))
        .then((html) => {
          toast.success("Document ready for printing", { id: "pdf-load" });
          win.document.write(html);
          win.document.close();
          win.print();
        })
        .catch(() => {
          toast.error("Failed to generate PDF", { id: "pdf-load" });
          win?.close();
        });
    }
  };

  const generateMutation = useMutation({
    mutationFn: () => prescriptionApi.generateExplanation(id!),
    onSuccess: (data) => {
      queryClient.setQueryData(["prescription", id], data);
      toast.success("AI clinical explanation generated");
    },
    onError: () => {
      toast.error("Failed to reach AI engine");
    }
  });

  const canGenerateAi = (user?.role === "doctor" || user?.role === "admin") && user?.subscriptionPlan === "pro";

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
      </div>
    );
  }

  if (!rx) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold text-gray-900">Prescription not found</h2>
        <Link href="/dashboard/prescriptions" className="text-emerald-600 hover:underline mt-4 block">Return to Archives</Link>
      </div>
    );
  }

  const patient = typeof rx.patientId === "object" ? rx.patientId : null;
  const doctor = typeof rx.doctorId === "object" ? rx.doctorId : null;

  return (
    <div className="p-8">
      <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <Link
            href="/dashboard/prescriptions"
            className="h-10 w-10 rounded-xl bg-white border border-gray-100 shadow-sm flex items-center justify-center text-gray-400 hover:text-emerald-600 hover:border-emerald-100 transition-all"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Prescription Record</h1>
            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mt-1">Authorized Medical Directive</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {canGenerateAi && !rx.aiExplanation && (
            <button
              onClick={() => generateMutation.mutate()}
              disabled={generateMutation.isPending}
              className="inline-flex items-center rounded-2xl bg-emerald-50 border border-emerald-100 px-5 py-2.5 text-xs font-black text-emerald-700 uppercase tracking-widest hover:bg-emerald-100 transition-all disabled:opacity-50"
            >
              <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              {generateMutation.isPending ? "Analyzing..." : "AI Intelligence Insight"}
            </button>
          )}
          <button
            onClick={downloadPdf}
            className="btn-primary px-6 py-2.5 text-xs shadow-xl shadow-emerald-600/20"
          >
            <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print Directive
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="card-premium overflow-hidden">
            <div className="p-8 border-b border-gray-100 bg-gray-50/30 flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold text-gray-900 tracking-tight">{rx.diagnosis || "General Consultation"}</h3>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Diagnosis Confirmed</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Issue Date</div>
                <div className="text-sm font-bold text-gray-700">{new Date(rx.createdAt).toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' })}</div>
              </div>
            </div>

            <div className="p-0 overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-white">
                    <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">Medication</th>
                    <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">Dosage</th>
                    <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">Frequency</th>
                    <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">Duration</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {(rx.medicines || []).map((m, i) => (
                    <tr key={i} className="hover:bg-emerald-50/20 transition-colors">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className="h-2 w-2 rounded-full bg-emerald-500" />
                          <span className="text-sm font-bold text-gray-900">{m.name}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className="text-xs font-bold text-gray-600 bg-gray-50 px-3 py-1 rounded-lg border border-gray-100">{m.dosage}</span>
                      </td>
                      <td className="px-8 py-5 text-xs font-bold text-gray-500">{m.frequency || "—"}</td>
                      <td className="px-8 py-5">
                        <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">{m.duration || "—"}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {rx.instructions && (
              <div className="p-8 bg-gray-50/20 border-t border-gray-100">
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Clinician Instructions</h4>
                <p className="text-sm text-gray-700 leading-relaxed font-medium italic">"{rx.instructions}"</p>
              </div>
            )}
          </div>

          {rx.aiExplanation && (
            <div className="card-premium p-8 overflow-hidden relative border-emerald-100">
              <div className="absolute top-0 right-0 h-32 w-32 bg-emerald-600 rounded-bl-[4rem] -mr-12 -mt-12 opacity-5 flex items-end justify-start p-10">
                <svg className="h-10 w-10 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="flex items-center gap-3 mb-6 relative z-10">
                <span className="ai-badge mt-0">CLINICAL INTELLIGENCE</span>
                <h3 className="text-lg font-black text-gray-900 tracking-tight">AI Interpretation</h3>
              </div>
              <div className="ai-panel border-none p-6 text-emerald-900 text-sm leading-relaxed font-medium relative z-10">
                {rx.aiExplanation}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-8">
          <div className="card-premium p-8">
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">Patient Identifier</h4>
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 font-black text-xl uppercase">
                {patient?.name?.charAt(0) || "P"}
              </div>
              <div>
                <p className="font-black text-gray-900 tracking-tight">{patient?.name ?? "—"}</p>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                  ID: {patient?._id?.slice(-8).toUpperCase() || "N/A"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-8 pt-8 border-t border-gray-50">
              <div>
                <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest mb-1">Biological Sex</p>
                <p className="text-xs font-bold text-gray-700 capitalize">{patient?.gender ?? "Unknown"}</p>
              </div>
              <div>
                <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest mb-1">Current Age</p>
                <p className="text-xs font-bold text-gray-700">{patient?.age ? `${patient.age} Years` : "N/A"}</p>
              </div>
            </div>
          </div>

          <div className="card-premium p-8 bg-emerald-900 text-white border-none shadow-emerald-900/10">
            <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-6">Authorizing Clinician</h4>
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-emerald-800 border border-emerald-700 flex items-center justify-center text-emerald-400">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <p className="font-black text-white tracking-tight leading-tight">Dr. {doctor?.name ?? "—"}</p>
                <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mt-1">Provider ID: {doctor?._id?.slice(-6).toUpperCase() || "N/A"}</p>
              </div>
            </div>
          </div>

          <div className="p-8 rounded-[2.5rem] bg-gray-50 border border-gray-100">
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Security Validation</h4>
            <div className="flex items-center gap-3">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Digitally Verified Directive</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
