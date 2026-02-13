import { Router } from "express";
import { z } from "zod";
import { createSupabaseUserClient, supabaseServiceRoleClient } from "../config/supabase";
import { HttpError } from "../lib/http-error";
import { route } from "../lib/route";
import { requireAuth } from "../middleware/auth";
import { assertPlatformAdmin, isPlatformAdmin } from "../services/platform-admin";

const updateMeSchema = z
    .object({
        name: z.string().min(2).max(120).optional(),
        phone: z.string().min(8).max(30).nullable().optional(),
        avatar_url: z.string().url().nullable().optional(),
    })
    .refine((value) => Object.keys(value).length > 0, {
        message: "At least one field must be provided",
    });

function normalizeAreaCode(value: string) {
    const numeric = value.replace(/\D/g, "");
    return numeric.padStart(3, "0").slice(-3);
}

const assignRegionalAdminRoleSchema = z
    .object({
        targetEmail: z.string().trim().email().transform((value) => value.toLowerCase()),
        roleScope: z.enum(["RT", "RW"]),
        kelurahan: z
            .string()
            .trim()
            .min(2)
            .max(120)
            .transform((value) => value.toUpperCase()),
        rw: z
            .string()
            .trim()
            .transform((value) => normalizeAreaCode(value))
            .refine((value) => value.length === 3, {
                message: "RW harus 3 digit angka.",
            }),
        rt: z
            .string()
            .trim()
            .optional()
            .transform((value) => (value ? normalizeAreaCode(value) : undefined)),
    })
    .superRefine((value, context) => {
        if (value.roleScope === "RT" && !value.rt) {
            context.addIssue({
                code: "custom",
                path: ["rt"],
                message: "RT wajib diisi untuk role admin RT.",
            });
        }

        if (value.roleScope === "RW" && value.rt) {
            context.addIssue({
                code: "custom",
                path: ["rt"],
                message: "RT harus kosong untuk role admin RW.",
            });
        }
    });

async function findAuthUserByEmail(email: string) {
    let page = 1;
    const perPage = 1000;
    const targetEmail = email.toLowerCase();

    while (true) {
        const { data, error } = await supabaseServiceRoleClient.auth.admin.listUsers({
            page,
            perPage,
        });

        if (error) {
            throw new HttpError(500, "Gagal membaca daftar pengguna.", error.message);
        }

        const matchedUser = data.users.find((user) => (user.email || "").toLowerCase() === targetEmail);
        if (matchedUser) {
            return matchedUser;
        }

        if (!data.nextPage) {
            return null;
        }

        page = data.nextPage;
    }
}

const usersRouter = Router();

usersRouter.use(requireAuth);

usersRouter.get(
    "/me",
    route(async (req, res) => {
        const accessToken = req.accessToken;
        const user = req.authUser;
        if (!accessToken || !user) {
            throw new HttpError(401, "Unauthorized");
        }

        const userClient = createSupabaseUserClient(accessToken);
        const [{ data: profile, error: profileError }, { data: adminRoles, error: adminRolesError }] = await Promise.all([
            userClient.from("profiles").select("*").eq("id", user.id).maybeSingle(),
            supabaseServiceRoleClient
                .from("regional_admin_roles")
                .select("id, role_scope, kelurahan, rw, rt, created_at")
                .eq("user_id", user.id)
                .order("created_at", { ascending: false }),
        ]);

        if (profileError) {
            throw new HttpError(400, "Failed to fetch profile", profileError.message);
        }

        if (adminRolesError) {
            throw new HttpError(400, "Failed to fetch admin roles", adminRolesError.message);
        }

        res.json({
            auth_user: user,
            profile,
            is_platform_admin: isPlatformAdmin(user),
            admin_roles: adminRoles ?? [],
        });
    }),
);

usersRouter.put(
    "/me",
    route(async (req, res) => {
        const payload = updateMeSchema.parse(req.body);
        const accessToken = req.accessToken;
        const user = req.authUser;
        if (!accessToken || !user) {
            throw new HttpError(401, "Unauthorized");
        }

        const userClient = createSupabaseUserClient(accessToken);
        const { data, error } = await userClient
            .from("profiles")
            .update(payload)
            .eq("id", user.id)
            .select("*")
            .single();

        if (error) {
            throw new HttpError(400, "Failed to update profile", error.message);
        }

        res.json({
            profile: data,
        });
    }),
);

usersRouter.get(
    "/admin-roles/me",
    route(async (req, res) => {
        const user = req.authUser;
        if (!user) {
            throw new HttpError(401, "Unauthorized");
        }

        const { data, error } = await supabaseServiceRoleClient
            .from("regional_admin_roles")
            .select("id, role_scope, kelurahan, rw, rt, created_at")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });

        if (error) {
            throw new HttpError(400, "Failed to fetch admin roles", error.message);
        }

        res.json({
            roles: data ?? [],
        });
    }),
);

usersRouter.post(
    "/admin-roles/assign",
    route(async (req, res) => {
        const user = req.authUser;
        if (!user) {
            throw new HttpError(401, "Unauthorized");
        }

        assertPlatformAdmin(user);

        const payload = assignRegionalAdminRoleSchema.parse(req.body);
        const targetUser = await findAuthUserByEmail(payload.targetEmail);
        if (!targetUser) {
            throw new HttpError(404, "Akun target tidak ditemukan.");
        }

        const { data: targetProfile, error: targetProfileError } = await supabaseServiceRoleClient
            .from("profiles")
            .select("id")
            .eq("id", targetUser.id)
            .maybeSingle();

        if (targetProfileError) {
            throw new HttpError(400, "Gagal membaca profil akun target.", targetProfileError.message);
        }

        if (!targetProfile) {
            throw new HttpError(404, "Profil akun target belum tersedia.");
        }

        const rt = payload.roleScope === "RT" ? payload.rt || "" : "";
        const { data, error } = await supabaseServiceRoleClient
            .from("regional_admin_roles")
            .upsert(
                {
                    user_id: targetUser.id,
                    role_scope: payload.roleScope,
                    kelurahan: payload.kelurahan,
                    rw: payload.rw,
                    rt,
                    created_by: user.id,
                },
                {
                    onConflict: "user_id,role_scope,kelurahan,rw,rt",
                },
            )
            .select("id, user_id, role_scope, kelurahan, rw, rt, created_at")
            .single();

        if (error || !data) {
            throw new HttpError(400, "Gagal menetapkan role admin wilayah.", error?.message);
        }

        res.status(201).json({
            assignment: data,
            target_user: {
                id: targetUser.id,
                email: targetUser.email ?? null,
            },
        });
    }),
);

export { usersRouter };
