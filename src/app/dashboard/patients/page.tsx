"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { patientApi } from "@/api/clinic";
import { useAuth } from "@/context/AuthContext";
import RoleGuard from "@/components/RoleGuard";
import Link from "next/link";

export default function PatientsPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const allowedRoles = ["admin", "doctor", "receptionist", "nurse", "lab_technician", "pharmacist"];
  const isAllowed = user?.role && allowedRoles.includes(user.role);

  const canCreate = ["admin", "receptionist", "nurse", "doctor"].includes(user?.role || "");

  const { data, isLoading } = useQuery({
    queryKey: ["patients", search, page],
    queryFn: () => patientApi.list({ search, page, limit: 15 }),
    enabled: !!isAllowed,
  });

  return (
    <RoleGuard roles={allowedRoles}>
      <div className="p-8 space-y-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Clinical Repository</h1>
            <p className="text-gray-500 font-medium mt-1">Authorized access to patient medical registries.</p>
          </div>
          {canCreate && (
            <Link href="/dashboard/patients/new" className="btn-primary shadow-xl shadow-emerald-500/20">
              <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              Enroll Patient
            </Link>
          )}
        </div>

        <div className="card-premium p-6 border-emerald-50 bg-emerald-50/10">
          <div className="relative max-w-xl group">
            <span className="absolute inset-y-0 left-4 flex items-center text-gray-400 group-focus-within:text-emerald-600 transition-colors">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="search"
              placeholder="Query by nomenclature, contact, or clinical ID..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-[1.25rem] border border-gray-100 bg-white py-3.5 pl-12 pr-6 text-sm outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-medium"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex h-[40vh] items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
          </div>
        ) : (
          <div className="card-premium overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-50 bg-gray-50/50">
                    <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">Identity Record</th>
                    <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">Biological Metrics</th>
                    <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">Contact Protocol</th>
                    <th className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-widest text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {(data?.patients || []).map((p) => (
                    <tr key={p._id} className="hover:bg-emerald-50/20 transition-all group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white border border-gray-100 text-gray-400 font-black text-lg group-hover:border-emerald-200 group-hover:text-emerald-600 transition-all uppercase">
                            {p.name.charAt(0)}
                          </div>
                          <div>
                            <span className="block font-black text-gray-900 group-hover:text-emerald-700 tracking-tight transition-colors">{p.name}</span>
                            <span className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">ID: #{p._id.slice(-8).toUpperCase()}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-gray-700">{p.age}Y</span>
                          <span className="h-1 w-1 rounded-full bg-gray-300" />
                          <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">{p.gender}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="space-y-1">
                          <span className="block text-xs font-bold text-gray-600">{p.contact}</span>
                          <span className="block text-[9px] font-medium text-gray-400 italic">verified communication</span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <Link
                          href={`/dashboard/patients/${p._id}`}
                          className="inline-flex items-center rounded-xl bg-gray-50 px-4 py-2 text-[10px] font-black text-emerald-600 uppercase tracking-widest border border-transparent hover:bg-emerald-600 hover:text-white transition-all shadow-sm active:scale-95"
                        >
                          Access Profile
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {(!data?.patients || data.patients.length === 0) && (
              <div className="py-24 text-center">
                <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto border-2 border-dashed border-gray-100 mb-6">
                  <svg className="h-6 w-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1" />
                  </svg>
                </div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Repository Vacant</p>
                <p className="text-xs text-gray-300 mt-1">Start by enrolling a new clinical record.</p>
              </div>
            )}
          </div>
        )}

        {data && data.total > 15 && (
          <div className="mt-12 flex items-center justify-between p-1">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
              Page {page} <span className="text-gray-200 mx-2">/</span> {Math.ceil(data.total / 15)}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="h-10 w-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:text-emerald-600 hover:border-emerald-100 disabled:opacity-30 transition-all font-bold"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= Math.ceil(data.total / 15)}
                className="h-10 w-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:text-emerald-600 hover:border-emerald-100 disabled:opacity-30 transition-all font-bold"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </RoleGuard>
  );
}
