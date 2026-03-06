import api from "@/lib/api";

export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "doctor" | "receptionist" | "patient" | "nurse" | "pharmacist" | "lab_technician";
  subscriptionPlan: "free" | "pro";
  patientId?: string;
  specialization?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface MeResponse {
  user: User;
}

export const authApi = {
  login: (email: string, password: string) =>
    api.post<AuthResponse>("/auth/login", { email, password }).then((r) => r.data),

  register: (data: { name: string; email: string; password: string; role?: string; clinicId?: string }) =>
    api.post<AuthResponse>("/auth/register", data).then((r) => r.data),

  registerClinic: (data: { clinicName: string; subdomain: string; adminName: string; adminEmail: string; password: string }) =>
    api.post<AuthResponse>("/clinics/register", data).then((r) => r.data),

  logout: () => api.post("/auth/logout").then((r) => r.data),

  me: () => api.get<MeResponse>("/auth/me").then((r) => r.data),

  refresh: (refreshToken: string) =>
    api.post<{ accessToken: string }>("/auth/refresh", { refreshToken }).then((r) => r.data),
};
