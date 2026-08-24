"use client";
import { useAuth } from "@/providers/authProvider";
import LoginForm from "./LoginForm";
import { useEffect } from "react";
import { useRouter } from 'next/navigation'

export default function AuthDisplay() {
    const { isAuthenticated, isFetchingAuthenticationData } = useAuth();
    const router = useRouter()

    useEffect(() => {
        if (!isFetchingAuthenticationData && isAuthenticated) {
            router.push("/dashboard");
        }
    }, [isFetchingAuthenticationData, isAuthenticated])

    if (isFetchingAuthenticationData) {
        return <p className="text-gray-500 animate-pulse">Verifying credentials...</p>;
    }

    if (!isAuthenticated) {
        return <LoginForm />;
    }

    return <p className="text-gray-500">Redirecting to your dashboard...</p>;
}