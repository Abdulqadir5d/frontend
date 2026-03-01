"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { patientApi } from "@/api/clinic";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

export default function PatientsPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const canCreate = ["admin", "receptionist"].includes(user?.role || "");

  const { data, isLoading } = useQuery({
    queryKey: ["patients", search, page],
    queryFn: () => patientApi.list({ search, page, limit: 15 }),
  });

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Patients</h1>
        {canCreate && (
          <Link
            href="/dashboard/patients/new"
            className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
          >
            Add Patient
          </Link>
        )}
      </div>

      <div className="mb-4">
        <input
          type="search"
          placeholder="Search by name, contact, email..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="max-w-md rounded-lg border border-slate-300 bg-white px-4 py-2 dark:border-slate-600 dark:bg-slate-800"
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-teal-500 border-t-transparent" />
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800/50">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700 dark:text-slate-300">Name</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700 dark:text-slate-300">Age</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700 dark:text-slate-300">Gender</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700 dark:text-slate-300">Contact</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-slate-700 dark:text-slate-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(data?.patients || []).map((p) => (
                <tr key={p._id} className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-4 py-3 font-medium">{p.name}</td>
                  <td className="px-4 py-3">{p.age}</td>
                  <td className="px-4 py-3 capitalize">{p.gender}</td>
                  <td className="px-4 py-3">{p.contact}</td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/dashboard/patients/${p._id}`}
                      className="text-sm font-medium text-teal-600 hover:underline dark:text-teal-400"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {(!data?.patients || data.patients.length === 0) && (
            <p className="py-8 text-center text-slate-500">No patients found</p>
          )}
        </div>
      )}

      {data && data.total > 15 && (
        <div className="mt-4 flex justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="rounded border border-slate-300 px-3 py-1 text-sm disabled:opacity-50 dark:border-slate-600"
          >
            Prev
          </button>
          <span className="px-3 py-1 text-sm">
            Page {page} of {Math.ceil(data.total / 15)}
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= Math.ceil(data.total / 15)}
            className="rounded border border-slate-300 px-3 py-1 text-sm disabled:opacity-50 dark:border-slate-600"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
