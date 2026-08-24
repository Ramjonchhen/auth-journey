"use client";
import { api } from "@/config/axios";
import { sessionIdKey, sessionSignatureKey } from "@/constants";
import { createContext, useContext, useEffect, useState } from "react";

interface UserProfile {
    username: string;
    balance: number;
    currency: string;
}

interface authContextData {
    isAuthenticated: boolean,
    sessionId: string | null,
    sessionSignature: string | null,
    isFetchingAuthenticationData: boolean;
    userProfile: UserProfile | null;
    login: (params: { id: string; signature: string }) => void;
    logout: () => void;
    checkServerAuth: () => Promise<void>;
};

const AuthContext = createContext<authContextData | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [sessionSignature, setSessionSignature] = useState<string | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [isFetchingAuthenticationData, setIsFetchingAuthenticationData] = useState(true);

    const checkServerAuth = async () => {
        const storeId = localStorage.getItem(sessionIdKey);
        const storedSignature = localStorage.getItem(sessionSignatureKey);

        if (!storeId || !storedSignature) {
            logout();
            setIsFetchingAuthenticationData(false);
            return;
        }

        try {
            const res = await api.get<UserProfile>("/user/me");
            setSessionId(storeId);
            setSessionSignature(storedSignature);
            setUserProfile(res.data);
        } catch (err) {
            console.error("Session Invalid or server restarted", err);
            logout();
        } finally {
            setIsFetchingAuthenticationData(false);
        }
    }

    useEffect(() => {
        checkServerAuth();
    }, [])

    const login = ({ id, signature }: { id: string, signature: string }) => {
        localStorage.setItem(sessionIdKey, id);
        localStorage.setItem(sessionSignatureKey, signature);
        // setSessionId(id);
        // setSessionSignature(signature);
        checkServerAuth();
    };

    const logout = () => {
        localStorage.removeItem(sessionIdKey);
        localStorage.removeItem(sessionSignatureKey);
        setSessionId(null);
        setSessionSignature(null);
    };

    const isAuthenticated = !!sessionId && !!userProfile;

    return (
        <AuthContext.Provider value={{
            isAuthenticated,
            sessionId,
            sessionSignature,
            isFetchingAuthenticationData,
            userProfile,
            login,
            logout,
            checkServerAuth
        }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}