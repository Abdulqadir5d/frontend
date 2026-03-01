import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi } from "./auth";

export const authKeys = {
  me: ["auth", "me"] as const,
};

export function useMe(enabled = true) {
  return useQuery({
    queryKey: authKeys.me,
    queryFn: authApi.me,
    enabled,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authApi.login(email, password),
    onSuccess: (data) => {
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      queryClient.setQueryData(authKeys.me, { user: data.user });
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { name: string; email: string; password: string; role?: string; clinicId?: string }) =>
      authApi.register(data),
    onSuccess: (data) => {
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      queryClient.setQueryData(authKeys.me, { user: data.user });
    },
  });
}

export function useRegisterClinic() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { clinicName: string; subdomain: string; adminName: string; adminEmail: string; password: string }) =>
      authApi.registerClinic(data),
    onSuccess: (data) => {
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      queryClient.setQueryData(authKeys.me, { user: data.user });
    },
  });
}


export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      queryClient.setQueryData(authKeys.me, null);
      queryClient.clear();
    },
    onError: () => {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      queryClient.setQueryData(authKeys.me, null);
      queryClient.clear();
    },
  });
}

// Search
export function useGlobalSearch(query: string) {
  return useQuery({
    queryKey: ["search", query],
    queryFn: () => searchApi.global(query),
    enabled: query.length >= 2,
    staleTime: 0, // Always fresh for search
  });
}

// EMR Templates
export function useEMRTemplates() {
  return useQuery({
    queryKey: ["emr-templates"],
    queryFn: emrApi.list,
  });
}

export function useCreateEMRTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: emrApi.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["emr-templates"] }),
  });
}

// Billing
export function useInvoices() {
  return useQuery({
    queryKey: ["invoices"],
    queryFn: billingApi.listInvoices,
  });
}

export function useCreateInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: billingApi.createInvoice,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["invoices"] }),
  });
}

// AI Interaction (Drug Interaction)
export function useDrugInteractions() {
  return useMutation({
    mutationFn: (medicines: string[]) => aiApi.checkInteractions(medicines),
  });
}

import { searchApi, billingApi, emrApi, aiApi } from "./clinic";

