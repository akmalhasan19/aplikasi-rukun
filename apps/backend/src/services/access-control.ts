import { supabaseServiceRoleClient } from "../config/supabase";
import { HttpError } from "../lib/http-error";

const ADMIN_ROLES = ["SUPER_ADMIN", "ADMIN"];

export async function assertOrganizationAdmin(userId: string, organizationId: string) {
    const { data, error } = await supabaseServiceRoleClient
        .from("organization_members")
        .select("id, role")
        .eq("organization_id", organizationId)
        .eq("user_id", userId)
        .in("role", ADMIN_ROLES)
        .maybeSingle();

    if (error) {
        throw new HttpError(500, "Failed checking organization role", error.message);
    }

    if (!data) {
        throw new HttpError(403, "Forbidden. Admin role required.");
    }
}
