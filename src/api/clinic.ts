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
  updatedAt: string;
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
  fulfillmentStatus: "pending" | "processed" | "partially-filled" | "out-of-stock" | "cancelled";
  createdAt: string;
}

export const prescriptionApi = {
  list: (params?: { patientId?: string; doctorId?: string; page?: number }) =>
    api.get<{ prescriptions: Prescription[]; total: number }>("/prescriptions", { params }).then((r) => r.data),
  get: (id: string) => api.get<Prescription>(`/prescriptions/${id}`).then((r) => r.data),
  create: (data: Partial<Prescription>) => api.post<Prescription>("/prescriptions", data).then((r) => r.data),
  update: (id: string, data: Partial<Prescription>) => api.patch<Prescription>(`/prescriptions/${id}`, data).then((r) => r.data),
  updateFulfillment: (id: string, status: string) => api.patch<Prescription>(`/prescriptions/${id}/fulfillment`, { status }).then((r) => r.data),
  generateExplanation: (id: string) => api.post<Prescription>(`/prescriptions/${id}/generate-explanation`).then((r) => r.data),
};

// Users (admin)
export interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: string;
  subscriptionPlan: string;
  isApproved: boolean;
  specialization?: string;
}

export const userApi = {
  list: (params?: { role?: string }) =>
    api.get<{ users: UserRecord[]; total: number }>("/users", { params }).then((r) => r.data),
  create: (data: { name: string; email: string; password: string; role: string; specialization?: string }) =>
    api.post<UserRecord>("/users", data).then((r) => r.data),
  update: (id: string, data: Partial<UserRecord>) => api.patch<UserRecord>(`/users/${id}`, data).then((r) => r.data),
  approve: (id: string) => api.patch<UserRecord>(`/users/${id}/approve`).then((r) => r.data),
  suspend: (id: string) => api.patch<UserRecord>(`/users/${id}/suspend`).then((r) => r.data),
  delete: (id: string) => api.delete(`/users/${id}`).then((r) => r.data),
};

export const doctorApi = {
  list: () => api.get<{ doctors: { id: string; name: string; email: string; specialization?: string }[] }>("/doctors").then((r) => r.data),
};

// Analytics
export interface AdminAnalytics {
  totalPatients: number;
  totalDoctors: number;
  appointmentsToday: number;
  appointmentsThisMonth: number;
  revenueThisMonth: number;
  topDiagnoses: { _id: string; count: number }[];
}

export interface DoctorAnalytics {
  todayAppointments: number;
  monthAppointments: number;
  pendingConsultations: number;
  totalDiagnoses: number;
  prescriptionCount: number;
  topDiagnoses: { _id: string; count: number }[];
}

export interface NurseAnalytics {
  todayAppointments: number;
  vitalsToday: number;
  pendingVitals: number;
  activeConsultations: number;
}

export interface PharmacistAnalytics {
  pendingRx: number;
  processedToday: number;
}

export interface LabStats {
  pendingLabs: number;
  completedToday: number;
}

export interface PatientAnalytics {
  upcomingAppointments: number;
  activePrescriptions: number;
  latestLabStatus: string;
}

export const analyticsApi = {
  admin: () => api.get<AdminAnalytics>("/analytics/admin").then((r) => r.data),
  doctor: () => api.get<DoctorAnalytics>("/analytics/doctor").then((r) => r.data),
  receptionist: () => api.get<any>("/analytics/receptionist").then((r) => r.data),
  nurse: () => api.get<NurseAnalytics>("/analytics/nurse").then((r) => r.data),
  pharmacist: () => api.get<PharmacistAnalytics>("/analytics/pharmacist").then((r) => r.data),
  lab: () => api.get<LabStats>("/analytics/lab").then((r) => r.data),
  patient: () => api.get<PatientAnalytics>("/analytics/patient").then((r) => r.data),
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
  interpretLab: (reportData: string) => api.post("/ai/interpret-lab", { reportData }).then((r) => r.data),
  generalChat: (query: string, context?: any) => api.post("/ai/chat", { query, context }).then((r) => r.data),
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

// Vitals
export interface Vitals {
  _id: string;
  patientId: string;
  weight?: number;
  height?: number;
  temperature?: number;
  bloodPressure?: { systolic?: number; diastolic?: number };
  pulse?: number;
  respiratoryRate?: number;
  oxygenSaturation?: number;
  recordedBy: { name: string; role: string };
  createdAt: string;
}

export const vitalsApi = {
  record: (data: Partial<Vitals>) => api.post<Vitals>("/vitals", data).then((r) => r.data),
  list: (patientId: string, limit?: number) =>
    api.get<Vitals[]>(`/vitals/patient/${patientId}`, { params: { limit } }).then((r) => r.data),
  latest: (patientId: string) => api.get<Vitals>(`/vitals/patient/${patientId}/latest`).then((r) => r.data),
};

// Labs
export interface LabReport {
  _id: string;
  patientId: { name: string; email: string } | string;
  doctorId: { name: string; specialization?: string } | string;
  testName: string;
  description?: string;
  results?: string;
  status: "ordered" | "sample-collected" | "processing" | "completed" | "cancelled";
  fileUrl?: string;
  uploadedBy?: { name: string; role: string };
  createdAt: string;
}

export const labApi = {
  order: (data: { patientId: string; testName: string; description?: string }) =>
    api.post<LabReport>("/labs/order", data).then((r) => r.data),
  list: (params?: { patientId?: string; status?: string; page?: number }) =>
    api.get<{ reports: LabReport[]; total: number }>("/labs", { params }).then((r) => r.data),
  update: (id: string, data: Partial<LabReport>) =>
    api.patch<LabReport>(`/labs/${id}`, data).then((r) => r.data),
};

// Search
export const searchApi = {
  global: (query: string) => api.get("/search", { params: { query } }).then((r) => r.data),
};

// Notifications
export interface Notification {
  _id: string;
  userId: string;
  title: string;
  message: string;
  type: "lab" | "appointment" | "system" | "inventory";
  priority: "low" | "medium" | "high";
  isRead: boolean;
  relatedId?: string;
  createdAt: string;
}

export const notificationApi = {
  list: () => api.get<Notification[]>("/notifications").then((r) => r.data),
  markAsRead: (id: string) => api.patch<Notification>(`/notifications/${id}/read`).then((r) => r.data),
  markAllAsRead: () => api.patch("/notifications/read-all").then((r) => r.data),
};

