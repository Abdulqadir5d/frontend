"use client";

import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { prescriptionApi } from "@/api/clinic";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

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
      fetch(url, { headers: { Authorization: `Bearer ${token}` } })
        .then((r) => (r.ok ? r.text() : Promise.reject(new Error("Failed to load PDF"))))
        .then((html) => {
          win.document.write(html);
          win.document.close();
          win.print();
        })
        .catch(() => win?.close());
    }
  };

  const generateMutation = useMutation({
    mutationFn: () => prescriptionApi.generateExplanation(id!),
    onSuccess: (data) => {
      queryClient.setQueryData(["prescription", id], data);
    },
  });

  const canGenerateAi = (user?.role === "doctor" || user?.role === "admin") && user?.subscriptionPlan === "pro";

  if (isLoading || !rx) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-teal-500 border-t-transparent" />
      </div>
    );
  }

  const patient = typeof rx.patientId === "object" ? rx.patientId : null;
  const doctor = typeof rx.doctorId === "object" ? rx.doctorId : null;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/prescriptions" className="text-teal-600 hover:underline">← Prescriptions</Link>
          <h1 className="text-2xl font-bold">Prescription</h1>
        </div>
        <div className="flex gap-2">
          {canGenerateAi && (
            <button
              onClick={() => generateMutation.mutate()}
              disabled={generateMutation.isPending}
              className="rounded-lg border border-teal-600 px-4 py-2 text-sm font-medium text-teal-600 hover:bg-teal-50 disabled:opacity-50 dark:border-teal-500 dark:text-teal-400 dark:hover:bg-teal-900/20"
            >
              {generateMutation.isPending ? "Generating..." : "Generate AI Explanation"}
            </button>
          )}
          <button onClick={downloadPdf} className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700">
            Download PDF
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800/50">
        <div className="mb-6 flex justify-between border-b border-slate-200 pb-4 dark:border-slate-700">
          <div>
            <p className="font-semibold">{patient?.name ?? "—"}</p>
            <p className="text-sm text-slate-500">Age: {patient?.age ?? "—"} | Gender: {patient?.gender ?? "—"}</p>
          </div>
          <div className="text-right">
            <p className="font-semibold">Dr. {doctor?.name ?? "—"}</p>
            <p className="text-sm text-slate-500">{new Date(rx.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
        {rx.diagnosis && <p className="mb-4"><span className="font-medium">Diagnosis:</span> {rx.diagnosis}</p>}
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-700">
              <th className="py-2 text-left text-sm font-medium">Medicine</th>
              <th className="py-2 text-left text-sm font-medium">Dosage</th>
              <th className="py-2 text-left text-sm font-medium">Frequency</th>
              <th className="py-2 text-left text-sm font-medium">Duration</th>
            </tr>
          </thead>
          <tbody>
            {(rx.medicines || []).map((m, i) => (
              <tr key={i} className="border-b border-slate-100 dark:border-slate-700/50">
                <td className="py-2">{m.name}</td>
                <td className="py-2">{m.dosage}</td>
                <td className="py-2">{m.frequency || "—"}</td>
                <td className="py-2">{m.duration || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {rx.instructions && <p className="mt-4"><span className="font-medium">Instructions:</span> {rx.instructions}</p>}
        {rx.aiExplanation && (
          <div className="mt-6 rounded-lg bg-teal-50 p-4 dark:bg-teal-900/20">
            <p className="text-sm font-medium text-teal-800 dark:text-teal-200">AI Explanation</p>
            <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">{rx.aiExplanation}</p>
          </div>
        )}
      </div>
    </div>
  );
}
