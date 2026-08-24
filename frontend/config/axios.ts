import { sessionIdKey, sessionSignatureKey } from "@/constants";
import axios from "axios";
import type { AxiosInstance } from "axios";

export const api: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5001/api',
});

api.interceptors.request.use(
  function (config) {
    if (typeof window === "undefined") return config;
    
    const localSessionId = localStorage.getItem(sessionIdKey);
    const localSessionSignature = localStorage.getItem(sessionSignatureKey);

    if (localSessionId && localSessionSignature) {
      config.headers.set("x-session-id", localSessionId);
      config.headers.set("x-session-signature", localSessionSignature);
    }
    return config;
  },
  function (error) {
    // Do something with request error
    return Promise.reject(error);
  }
);
