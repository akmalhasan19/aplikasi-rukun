import type { User } from "@supabase/supabase-js";
import { env } from "../config/env";
import { HttpError } from "../lib/http-error";

export function isPlatformAdmin(user: User | undefined) {
    if (!user?.email) {
        return false;
    }

    return env.platformAdminEmails.includes(user.email.toLowerCase());
}

export function assertPlatformAdmin(user: User | undefined) {
    if (!isPlatformAdmin(user)) {
        throw new HttpError(403, "Forbidden. Platform admin role required.");
    }
}
