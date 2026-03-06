"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, ReactNode } from "react";

interface RoleGuardProps {
    children: ReactNode;
    roles: string[];
}

export default function RoleGuard({ children, roles }: RoleGuardProps) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && user && !roles.includes(user.role)) {
            router.replace("/dashboard");
        }
    }, [user, roles, loading, router]);

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="h-10 w-10 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
            </div>
        );
    }

    if (!user || !roles.includes(user.role)) {
        return null;
    }

    return <>{children}</>;
}
