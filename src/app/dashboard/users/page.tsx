"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userApi } from "@/api/clinic";
import { useAuth } from "@/context/AuthContext";
import RoleGuard from "@/components/RoleGuard";
import Link from "next/link";

export default function UsersPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const { data, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: () => userApi.list(),
    enabled: isAdmin,
  });

  return (
    <RoleGuard roles={["admin"]}>
      <div className="p-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">User Management</h1>
            <p className="text-gray-500 font-medium mt-1">Configure staff accounts and access permissions.</p>
          </div>
          <Link
            href="/dashboard/users/new"
            className="btn-primary shadow-xl shadow-emerald-500/20"
          >
            <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M18 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Provision User
          </Link>
        </div>

        <div className="card-premium overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">Staff Identity</th>
                  <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">Electronic Mail</th>
                  <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">Access Role</th>
                  <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">Service Plan</th>
                  <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-widest text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                  <tr><td colSpan={5} className="py-20 text-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent mx-auto" /></td></tr>
                ) : (data?.users || []).map((u) => (
                  <tr key={u.id} className="hover:bg-emerald-50/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 font-black border border-gray-100 uppercase">
                          {u.name.charAt(0)}
                        </div>
                        <div className="font-bold text-gray-900">{u.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs font-medium text-gray-500">{u.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-700 border border-emerald-100">
                        {u.role}
                      </span>
                      {!u.isApproved && (
                        <span className="ml-2 inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest bg-amber-500 text-white border-none animate-pulse">
                          Pending Approval
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 capitalize">
                      <div className={`text-[10px] font-black uppercase tracking-tighter ${u.subscriptionPlan === 'pro' ? 'text-amber-600' : 'text-gray-400'}`}>
                        {u.subscriptionPlan} Tier
                      </div>
                      {!u.isApproved && (
                        <div className="text-[9px] font-bold text-amber-600 uppercase tracking-widest mt-0.5">
                          Verification Required
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right relative">
                      <UserActionsMenu user={u} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}

function UserActionsMenu({ user }: { user: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();

  const approveMutation = useMutation({
    mutationFn: () => userApi.approve(user.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setIsOpen(false);
    },
  });

  const suspendMutation = useMutation({
    mutationFn: () => userApi.suspend(user.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setIsOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => userApi.delete(user.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setIsOpen(false);
    },
  });

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-emerald-600 transition-all"
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-2xl border border-gray-100 z-20 py-2 overflow-hidden ring-1 ring-black ring-opacity-5">
            {!user.isApproved ? (
              <button
                onClick={() => approveMutation.mutate()}
                className="w-full text-left px-4 py-2.5 text-xs font-bold text-emerald-600 hover:bg-emerald-50 transition-colors flex items-center gap-2"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Approve Account
              </button>
            ) : (
              <button
                onClick={() => suspendMutation.mutate()}
                className="w-full text-left px-4 py-2.5 text-xs font-bold text-amber-600 hover:bg-amber-50 transition-colors flex items-center gap-2"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                Suspend Access
              </button>
            )}
            <button
              onClick={() => {
                if (window.confirm("Are you sure you want to delete this user?")) deleteMutation.mutate();
              }}
              className="w-full text-left px-4 py-2.5 text-xs font-bold text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
              Delete Permanently
            </button>
          </div>
        </>
      )}
    </div>
  );
}
