"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import axios from "axios";

interface ClinicSettings {
    logoUrl: string | null;
    address: string;
    contactNumber: string;
}

interface ClinicInfo {
    _id: string;
    name: string;
    subdomain: string;
    settings: ClinicSettings;
}

interface ClinicContextType {
    clinic: ClinicInfo | null;
    loading: boolean;
    error: string | null;
}

const ClinicContext = createContext<ClinicContextType | undefined>(undefined);

export function ClinicProvider({ children }: { children: ReactNode }) {
    const [clinic, setClinic] = useState<ClinicInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchBranding = async () => {
            try {
                const hostname = window.location.hostname;
                const parts = hostname.split(".");

                // Improved subdomain extraction
                let subdomain = "";

                // If we are on a known deployment platform domain, don't treat it as a clinic subdomain
                const isSystemDomain = hostname.endsWith(".vercel.app") || hostname.endsWith(".onrender.com");

                if (!isSystemDomain && parts.length >= 2) {
                    subdomain = parts[0];
                }

                if (!subdomain || subdomain === "localhost" || subdomain === "www") {
                    setLoading(false);
                    return;
                }

                const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";
                const { data } = await axios.get(`${API_URL}/clinics/public/${subdomain}`);
                setClinic(data);
            } catch (err) {
                console.error("Failed to load clinic branding:", err);
                setError("Clinic not found");
            } finally {
                setLoading(false);
            }
        };

        fetchBranding();
    }, []);

    return (
        <ClinicContext.Provider value={{ clinic, loading, error }}>
            {children}
        </ClinicContext.Provider>
    );
}

export function useClinic() {
    const context = useContext(ClinicContext);
    if (context === undefined) {
        throw new Error("useClinic must be used within a ClinicProvider");
    }
    return context;
}
