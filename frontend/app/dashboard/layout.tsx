"use client";
import { useAuth } from "@/providers/authProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const { isFetchingAuthenticationData, isAuthenticated } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isFetchingAuthenticationData && !isAuthenticated) {
            router.push("/");
        }
    }, [isFetchingAuthenticationData, isAuthenticated, router])

    if (isFetchingAuthenticationData) {
        return (
            <div className="flex items-center justify-center h-screen">
                <h1 className="text-xl font-semibold animate-pulse">Verifying Session Security...</h1>
            </div>
        );
    }

    return <>{children}</>;
}