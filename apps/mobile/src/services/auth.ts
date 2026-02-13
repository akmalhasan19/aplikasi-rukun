import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import type { Session, User } from "@supabase/supabase-js";
import { ApiError, apiRequest } from "./api";
import { supabase } from "./supabase";

const SESSION_STORAGE_KEY = "@aplikasi_rukun_session";

WebBrowser.maybeCompleteAuthSession();

export type BackendSession = {
    access_token: string;
    refresh_token: string;
    expires_at: number | null;
    token_type: string;
};

export type Profile = {
    id: string;
    name: string;
    phone: string | null;
    avatar_url: string | null;
    created_at: string;
    updated_at: string;
};

type AuthUser = {
    id: string;
    email?: string;
};

type AuthPayload = {
    user: AuthUser | null;
    session: BackendSession | null;
};

export type RegionalAdminRole = {
    id: string;
    role_scope: "RT" | "RW";
    kelurahan: string;
    rw: string;
    rt: string;
    created_at: string;
};

export type MePayload = {
    auth_user: AuthUser;
    profile: Profile | null;
    is_platform_admin: boolean;
    admin_roles: RegionalAdminRole[];
};

type UpdateMyProfilePayload = {
    name?: string;
    phone?: string | null;
    avatar_url?: string | null;
};

type UpdateMeResponse = {
    profile: Profile;
};

function toBackendSession(session: Session): BackendSession {
    return {
        access_token: session.access_token,
        refresh_token: session.refresh_token,
        expires_at: session.expires_at ?? null,
        token_type: session.token_type,
    };
}

function toAuthUser(user: User): AuthUser {
    return {
        id: user.id,
        email: user.email,
    };
}

function getStringParam(params: Record<string, string | string[] | undefined> | null | undefined, key: string) {
    if (!params) {
        return undefined;
    }

    const value = params[key];
    if (typeof value === "string") {
        return value;
    }

    if (Array.isArray(value)) {
        return value[0];
    }

    return undefined;
}

export async function loginWithBackend(payload: { email: string; password: string }) {
    return apiRequest<AuthPayload>("/auth/login", {
        method: "POST",
        body: payload,
    });
}

export async function registerWithBackend(payload: {
    name: string;
    email: string;
    password: string;
    phone?: string;
}) {
    return apiRequest<AuthPayload>("/auth/register", {
        method: "POST",
        body: payload,
    });
}

export async function sendForgotPasswordOtp(email: string) {
    return apiRequest<{ message: string }>("/auth/forgot-password/send-otp", {
        method: "POST",
        body: { email },
    });
}

export async function verifyForgotPasswordOtp(payload: { email: string; otpCode: string }) {
    return apiRequest<AuthPayload>("/auth/forgot-password/verify-otp", {
        method: "POST",
        body: payload,
    });
}

export async function resetForgotPassword(payload: { password: string; accessToken: string }) {
    return apiRequest<{ message: string }>("/auth/forgot-password/reset-password", {
        method: "POST",
        accessToken: payload.accessToken,
        body: {
            password: payload.password,
        },
    });
}

export async function loginWithGoogle() {
    const redirectTo = Linking.createURL("login");

    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
            redirectTo,
            skipBrowserRedirect: true,
        },
    });

    if (error) {
        throw new ApiError(400, "Gagal memulai login Google.", error.message);
    }

    if (!data?.url) {
        throw new ApiError(400, "URL login Google tidak tersedia.");
    }

    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
    if (result.type !== "success" || !result.url) {
        throw new ApiError(400, "Login Google dibatalkan.");
    }

    const { queryParams } = Linking.parse(result.url);
    const authError = getStringParam(queryParams, "error_description") || getStringParam(queryParams, "error");
    if (authError) {
        throw new ApiError(401, `Login Google gagal: ${authError}`);
    }

    const code = getStringParam(queryParams, "code");
    if (!code) {
        throw new ApiError(400, "Kode otorisasi Google tidak ditemukan.");
    }

    const { data: exchangeData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    if (exchangeError || !exchangeData.session || !exchangeData.user) {
        throw new ApiError(401, "Gagal menyelesaikan login Google.", exchangeError?.message);
    }

    return {
        user: toAuthUser(exchangeData.user),
        session: toBackendSession(exchangeData.session),
    } satisfies AuthPayload;
}

export async function fetchMe(accessToken: string) {
    return apiRequest<MePayload>("/users/me", {
        method: "GET",
        accessToken,
    });
}

export async function updateMyProfile(accessToken: string, payload: UpdateMyProfilePayload) {
    return apiRequest<UpdateMeResponse>("/users/me", {
        method: "PUT",
        accessToken,
        body: payload,
    });
}

export async function assignRegionalAdminRole(
    accessToken: string,
    payload: {
        targetEmail: string;
        roleScope: "RT" | "RW";
        kelurahan: string;
        rw: string;
        rt?: string;
    },
) {
    return apiRequest<{
        assignment: RegionalAdminRole & {
            user_id: string;
        };
        target_user: {
            id: string;
            email: string | null;
        };
    }>("/users/admin-roles/assign", {
        method: "POST",
        accessToken,
        body: payload,
    });
}

export async function logoutWithBackend(accessToken: string) {
    return apiRequest<void>("/auth/logout", {
        method: "POST",
        accessToken,
    });
}

export async function persistSession(session: BackendSession) {
    await AsyncStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
}

export async function getPersistedSession() {
    const raw = await AsyncStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) {
        return null;
    }

    try {
        return JSON.parse(raw) as BackendSession;
    } catch {
        await AsyncStorage.removeItem(SESSION_STORAGE_KEY);
        return null;
    }
}

export async function clearPersistedSession() {
    await AsyncStorage.removeItem(SESSION_STORAGE_KEY);
}
