import { Router } from "express";
import { z } from "zod";
import { createSupabaseUserClient } from "../config/supabase";
import { HttpError } from "../lib/http-error";
import { route } from "../lib/route";
import { requireAuth } from "../middleware/auth";

const updateMeSchema = z
    .object({
        name: z.string().min(2).max(120).optional(),
        phone: z.string().min(8).max(30).nullable().optional(),
        avatar_url: z.string().url().nullable().optional(),
    })
    .refine((value) => Object.keys(value).length > 0, {
        message: "At least one field must be provided",
    });

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
        const { data, error } = await userClient.from("profiles").select("*").eq("id", user.id).maybeSingle();

        if (error) {
            throw new HttpError(400, "Failed to fetch profile", error.message);
        }

        res.json({
            auth_user: user,
            profile: data,
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

export { usersRouter };
