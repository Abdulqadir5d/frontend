import api from "@/lib/api";

// Patient
export interface Patient {
  _id: string;
  name: string;
  age: number;
  gender: string;
  contact: string;
  email?: string;
  address?: string;
  bloodGroup?: string;
  allergies?: string[];
  createdBy?: { name: string; email: string };
  createdAt: string;
}

export const patientApi = {
  list: (params?: { search?: string; page?: number; limit?: number }) =>
    api.get<{ patients: Patient[]; total: number }>("/patients", { params }).then((r) => r.data),
  get: (id: string) => api.get<Patient>(`/patients/${id}`).then((r) => r.data),
  create: (data: Partial<Patient>) => api.post<Patient>("/patients", data).then((r) => r.data),
  update: (id: string, data: Partial<Patient>) => api.patch<Patient>(`/patients/${id}`, data).then((r) => r.data),
};

// Appointment
export interface Appointment {
  _id: string;
  patientId: Patient | string;
  doctorId: { name: string; email: string; specialization?: string } | string;
  date: string;
  timeSlot: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  reason?: string;
  notes?: string;
  createdBy?: { name: string; email: string };
  createdAt: string;
}

export const appointmentApi = {
  list: (params?: { patientId?: string; doctorId?: string; status?: string; date?: string; page?: number }) =>
    api.get<{ appointments: Appointment[]; total: number }>("/appointments", { params }).then((r) => r.data),
  get: (id: string) => api.get<Appointment>(`/appointments/${id}`).then((r) => r.data),
  create: (data: Partial<Appointment>) => api.post<Appointment>("/appointments", data).then((r) => r.data),
  update: (id: string, data: Partial<Appointment>) => api.patch<Appointment>(`/appointments/${id}`, data).then((r) => r.data),
};

// Prescription
export interface Medicine {
  name: string;
  dosage: string;
  frequency?: string;
  duration?: string;
  notes?: string;
}

export interface Prescription {
  _id: string;
  patientId: Patient | string;
  doctorId: { name: string; email: string; specialization?: string } | string;
  appointmentId?: string;
  diagnosis?: string;
  medicines: Medicine[];
  instructions?: string;
  aiExplanation?: string;
  aiExplanationUrdu?: string;
  pdfUrl?: string;
  createdAt: string;
}

export const prescriptionApi = {
  list: (params?: { patientId?: string; doctorId?: string; page?: number }) =>
    api.get<{ prescriptions: Prescription[]; total: number }>("/prescriptions", { params }).then((r) => r.data),
  get: (id: string) => api.get<Prescription>(`/prescriptions/${id}`).then((r) => r.data),
  create: (data: Partial<Prescription>) => api.post<Prescription>("/prescriptions", data).then((r) => r.data),
  update: (id: string, data: Partial<Prescription>) => api.patch<Prescription>(`/prescriptions/${id}`, data).then((r) => r.data),
  generateExplanation: (id: string) => api.post<Prescription>(`/prescriptions/${id}/generate-explanation`).then((r) => r.data),
};

// Users (admin)
export interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: string;
  subscriptionPlan: string;
  specialization?: string;
}

export const userApi = {
  list: (params?: { role?: string }) =>
    api.get<{ users: UserRecord[]; total: number }>("/users", { params }).then((r) => r.data),
  create: (data: { name: string; email: string; password: string; role: string; specialization?: string }) =>
    api.post<UserRecord>("/users", data).then((r) => r.data),
  update: (id: string, data: Partial<UserRecord>) => api.patch<UserRecord>(`/users/${id}`, data).then((r) => r.data),
};

export const doctorApi = {
  list: () => api.get<{ doctors: { id: string; name: string; email: string; specialization?: string }[] }>("/doctors").then((r) => r.data),
};

// Analytics
export const analyticsApi = {
  admin: () => api.get("/analytics/admin").then((r) => r.data),
  doctor: () => api.get("/analytics/doctor").then((r) => r.data),
  receptionist: () => api.get("/analytics/receptionist").then((r) => r.data),
};

// History
export interface TimelineItem {
  type: string;
  date: string;
  id: string;
  data: unknown;
}

export const historyApi = {
  patient: (patientId: string) => api.get<{ patient: Patient; timeline: TimelineItem[] }>(`/history/patient/${patientId}`).then((r) => r.data),
};

// AI
export const aiApi = {
  checkSymptoms: (data: { symptoms: string[]; age?: number; gender?: string; history?: string; patientId?: string }) =>
    api.post("/ai/symptoms", data).then((r) => r.data),
  explainPrescription: (data: { medicines?: Medicine[]; diagnosis?: string; instructions?: string; prescriptionId?: string }, urdu?: boolean) =>
    api.post(`/ai/explain-prescription?urdu=${urdu ? "true" : "false"}`, data).then((r) => r.data),
  flagRisks: (patientId: string) => api.get(`/ai/risk-flag/${patientId}`).then((r) => r.data),
  analyticsSummary: () => api.get("/ai/analytics-summary").then((r) => r.data),
  checkInteractions: (medicines: string[]) => api.post("/ai/interactions", { medicines }).then((r) => r.data),
  interpretLab: (reportData: unknown) => api.post("/ai/interpret-lab", { reportData }).then((r) => r.data),
};

// Billing
export const billingApi = {
  listInvoices: () => api.get("/billing").then((r) => r.data),
  createInvoice: (data: unknown) => api.post("/billing", data).then((r) => r.data),
};

// Clinic (Admin)
export const managedClinicApi = {
  getSettings: () => api.get("/clinics/settings").then((r) => r.data),
  updateSettings: (data: { name?: string; settings?: { logoUrl?: string; address?: string; contactNumber?: string } }) =>
    api.patch("/clinics/settings", data).then((r) => r.data),
};

// EMR Templates
export const emrApi = {
  list: () => api.get("/emr-templates").then((r) => r.data),
  create: (data: unknown) => api.post("/emr-templates", data).then((r) => r.data),
  delete: (id: string) => api.delete(`/emr-templates/${id}`).then((r) => r.data),
};

// Search
export const searchApi = {
  global: (query: string) => api.get("/search", { params: { query } }).then((r) => r.data),
};

