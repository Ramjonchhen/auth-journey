import axios from "axios";

export function getErrorMessage(err: unknown, fallback: string = "An error occurred") {
    if (axios.isAxiosError(err)) {
        const serverMessage = err.response?.data?.message;
        const networkError = err.message;
        return serverMessage || networkError || fallback;
    } else {
        return err instanceof Error ? err.message : fallback;
    }
}