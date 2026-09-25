"use client";

import { api } from "@/config/axios";
import { useAuth } from "@/providers/authProvider";
import { getErrorMessage } from "@/utils/getAxiosError";
import { useState } from "react"

interface ILoginResponse {
    sessionId: string;
    sessionSignature: string;
}

export default function LoginForm() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    // form submission states
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loginError, setLoginError] = useState<string | null>(null);
    const [isLoginSuccessful, setIsLoginSuccessful] = useState(false);
    const { login } = useAuth()

    const handleUsernameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setUsername(event.target.value);
    };

    const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(event.target.value);
    };

    const performLogin = async () => {
        try {
            setIsSubmitting(true);
            setLoginError(null)
            const loginRes = await api.post<ILoginResponse>("/auth/login", { username, password });
            const resData = loginRes.data;
            login({ id: resData.sessionId, signature: resData.sessionSignature })
            setIsLoginSuccessful(true);
        } catch (err) {
            const errMsg = getErrorMessage(err, "Failed to Perform Login");
            setLoginError(errMsg);
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="flex flex-col">
            <h2 className="font-semibold text-center">Login Form</h2>
            <p className="text-xs smart-wrap italic font-light max-w-100">
                Login though the hardcoded credentials present at backend/constants.js to test things out
                and carry throughout the journey
            </p>

            <form
                className="flex flex-col gap-1 mt-4 border border-gray-500 rounded-md p-6"
                onSubmit={(e) => {
                    e.preventDefault();
                    performLogin()
                }}
            >
                <label htmlFor="username" className="text-sm font-medium mt-2">Username:</label>
                <input
                    required
                    type="text"
                    id="username"
                    name="username"
                    className="border border-gray-400 rounded-md px-3 py-2 bg-white"
                    value={username}
                    onChange={handleUsernameChange}
                />
                <label htmlFor="password" className="text-sm font-medium mt-2">Password:</label>
                <input
                    required
                    type="password"
                    id="password"
                    name="password"
                    className="border border-gray-400 rounded-md px-3 py-2 bg-white"
                    value={password}
                    onChange={handlePasswordChange}
                />
                <input
                    type="submit"
                    disabled={isSubmitting || isLoginSuccessful}
                    value={isSubmitting ? "Logging In ..." : "Login"}
                    className="mt-4 bg-blue-600 text-white rounded-md px-4 py-2 cursor-pointer hover:bg-blue-700 disabled:cursor-not-allowed"
                />
                {isLoginSuccessful && (
                    <p className="font-semibold text-green-400">Login Successful, Redirecting you on few seconds ...</p>
                )}
                {loginError && (
                    <p className="font-semibold text-red-400">{loginError}</p>
                )}
            </form>
        </div>
    )
}