import { supabase } from "./supabase";

type BackendStatus = {
    checkedAt: string;
    envConfigured: boolean;
    hasSession: boolean;
    backendReachable: boolean;
    message: string;
};

const AUTH_REQUIRED_STATUS = new Set([401, 403]);

export async function checkBackendStatus(): Promise<BackendStatus> {
    const checkedAt = new Date().toISOString();
    const envConfigured = Boolean(process.env.EXPO_PUBLIC_SUPABASE_URL && process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY);

    if (!envConfigured) {
        return {
            checkedAt,
            envConfigured,
            hasSession: false,
            backendReachable: false,
            message: "Environment Supabase belum dikonfigurasi.",
        };
    }

    const {
        data: { session },
        error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
        return {
            checkedAt,
            envConfigured,
            hasSession: false,
            backendReachable: false,
            message: sessionError.message,
        };
    }

    const { error: probeError, status } = await supabase.from("profiles").select("id").limit(1);

    if (!probeError) {
        return {
            checkedAt,
            envConfigured,
            hasSession: Boolean(session),
            backendReachable: true,
            message: "Backend terhubung dan query ke Supabase berhasil.",
        };
    }

    if (AUTH_REQUIRED_STATUS.has(status ?? 0)) {
        return {
            checkedAt,
            envConfigured,
            hasSession: Boolean(session),
            backendReachable: true,
            message: "Backend terhubung, tetapi data butuh user login (RLS aktif).",
        };
    }

    return {
        checkedAt,
        envConfigured,
        hasSession: Boolean(session),
        backendReachable: false,
        message: probeError.message,
    };
}

export type { BackendStatus };
