import { Platform } from "react-native";

const DEFAULT_BASE_URL = Platform.OS === "android" ? "http://10.0.2.2:3001/api" : "http://localhost:3001/api";

const apiBaseUrl = (process.env.EXPO_PUBLIC_API_BASE_URL || DEFAULT_BASE_URL).replace(/\/+$/, "");

if (__DEV__ && !process.env.EXPO_PUBLIC_API_BASE_URL) {
    // Helpful when app runs on physical device but still uses emulator fallback URL.
    console.warn(`[api] EXPO_PUBLIC_API_BASE_URL is not set, fallback in use: ${apiBaseUrl}`);
}

type RequestOptions = {
    method?: "GET" | "POST" | "PUT" | "DELETE";
    body?: unknown;
    accessToken?: string;
};

export class ApiError extends Error {
    status: number;
    details?: unknown;

    constructor(status: number, message: string, details?: unknown) {
        super(message);
        this.status = status;
        this.details = details;
    }
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
    };

    if (options.accessToken) {
        headers.Authorization = `Bearer ${options.accessToken}`;
    }

    let response: Response;
    try {
        response = await fetch(`${apiBaseUrl}${path}`, {
            method: options.method ?? "GET",
            headers,
            body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
        });
    } catch (error) {
        const reason = error instanceof Error ? error.message : "Unknown network error";
        throw new ApiError(0, `Tidak dapat terhubung ke API (${apiBaseUrl}). ${reason}`);
    }

    if (response.status === 204) {
        return undefined as T;
    }

    const payload = await response.json().catch(() => null);

    if (!response.ok) {
        const message =
            payload && typeof payload === "object" && "error" in payload && payload.error && typeof payload.error === "object"
                ? String((payload.error as { message?: unknown }).message || "Request failed")
                : "Request failed";

        const details =
            payload && typeof payload === "object" && "error" in payload && payload.error && typeof payload.error === "object"
                ? (payload.error as { details?: unknown }).details
                : undefined;

        throw new ApiError(response.status, message, details);
    }

    return payload as T;
}

export function getApiBaseUrl() {
    return apiBaseUrl;
}
