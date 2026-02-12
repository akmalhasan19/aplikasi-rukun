import { Router } from "express";
import { z } from "zod";
import { createSupabaseUserClient, supabaseServiceRoleClient } from "../config/supabase";
import { HttpError } from "../lib/http-error";
import { route } from "../lib/route";
import { requireAuth } from "../middleware/auth";
import { assertOrganizationAdmin } from "../services/access-control";

const createOrganizationSchema = z.object({
    name: z.string().min(2).max(120),
    type: z.enum(["RT", "MASJID", "KOMUNITAS"]),
});

const updateOrganizationSchema = z
    .object({
        name: z.string().min(2).max(120).optional(),
        type: z.enum(["RT", "MASJID", "KOMUNITAS"]).optional(),
    })
    .refine((value) => Object.keys(value).length > 0, {
        message: "At least one field must be provided",
    });

const organizationIdParamSchema = z.object({
    id: z.string().uuid(),
});

const organizationsRouter = Router();

organizationsRouter.use(requireAuth);

organizationsRouter.post(
    "/",
    route(async (req, res) => {
        const payload = createOrganizationSchema.parse(req.body);
        const user = req.authUser;
        if (!user) {
            throw new HttpError(401, "Unauthorized");
        }

        const { data: org, error: orgError } = await supabaseServiceRoleClient
            .from("organizations")
            .insert({
                name: payload.name,
                type: payload.type,
            })
            .select("*")
            .single();

        if (orgError || !org) {
            throw new HttpError(400, "Failed to create organization", orgError?.message);
        }

        const { error: membershipError } = await supabaseServiceRoleClient.from("organization_members").insert({
            user_id: user.id,
            organization_id: org.id,
            role: "ADMIN",
        });

        if (membershipError) {
            await supabaseServiceRoleClient.from("organizations").delete().eq("id", org.id);
            throw new HttpError(400, "Failed to add organization membership", membershipError.message);
        }

        res.status(201).json({
            organization: org,
        });
    }),
);

organizationsRouter.get(
    "/:id",
    route(async (req, res) => {
        const params = organizationIdParamSchema.parse(req.params);
        const accessToken = req.accessToken;
        if (!accessToken) {
            throw new HttpError(401, "Unauthorized");
        }

        const userClient = createSupabaseUserClient(accessToken);
        const { data, error } = await userClient.from("organizations").select("*").eq("id", params.id).single();

        if (error) {
            throw new HttpError(404, "Organization not found", error.message);
        }

        res.json({
            organization: data,
        });
    }),
);

organizationsRouter.put(
    "/:id",
    route(async (req, res) => {
        const params = organizationIdParamSchema.parse(req.params);
        const payload = updateOrganizationSchema.parse(req.body);
        const user = req.authUser;
        if (!user) {
            throw new HttpError(401, "Unauthorized");
        }

        await assertOrganizationAdmin(user.id, params.id);

        const { data, error } = await supabaseServiceRoleClient
            .from("organizations")
            .update(payload)
            .eq("id", params.id)
            .select("*")
            .single();

        if (error) {
            throw new HttpError(400, "Failed to update organization", error.message);
        }

        res.json({
            organization: data,
        });
    }),
);

organizationsRouter.get(
    "/:id/members",
    route(async (req, res) => {
        const params = organizationIdParamSchema.parse(req.params);
        const accessToken = req.accessToken;
        if (!accessToken) {
            throw new HttpError(401, "Unauthorized");
        }

        const userClient = createSupabaseUserClient(accessToken);
        const { data, error } = await userClient
            .from("organization_members")
            .select(`
                id,
                user_id,
                organization_id,
                role,
                created_at,
                profiles:user_id (
                    id,
                    name,
                    phone,
                    avatar_url
                )
            `)
            .eq("organization_id", params.id);

        if (error) {
            throw new HttpError(400, "Failed to fetch organization members", error.message);
        }

        res.json({
            members: data ?? [],
        });
    }),
);

export { organizationsRouter };
