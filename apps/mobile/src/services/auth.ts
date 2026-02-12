import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiRequest } from "./api";

const SESSION_STORAGE_KEY = "@aplikasi_rukun_session";

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

type MePayload = {
    auth_user: AuthUser;
    profile: Profile | null;
};

type UpdateMyProfilePayload = {
    name?: string;
    phone?: string | null;
    avatar_url?: string | null;
};

type UpdateMeResponse = {
    profile: Profile;
};

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
