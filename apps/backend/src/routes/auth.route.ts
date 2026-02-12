import { Router } from "express";
import { z } from "zod";
import { createSupabaseUserClient, supabaseAnonClient, supabaseServiceRoleClient } from "../config/supabase";
import { HttpError } from "../lib/http-error";
import { route } from "../lib/route";
import { requireAuth } from "../middleware/auth";

const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    name: z.string().min(2).max(120),
    phone: z.string().min(8).max(30).optional(),
});

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
});

const refreshSchema = z.object({
    refreshToken: z.string().min(1),
});

const authRouter = Router();

authRouter.post(
    "/register",
    route(async (req, res) => {
        const payload = registerSchema.parse(req.body);

        const { data, error } = await supabaseAnonClient.auth.signUp({
            email: payload.email,
            password: payload.password,
            options: {
                data: {
                    full_name: payload.name,
                },
            },
        });

        if (error) {
            throw new HttpError(400, "Failed to register", error.message);
        }

        if (data.user) {
            const { error: profileError } = await supabaseServiceRoleClient
                .from("profiles")
                .upsert(
                    {
                        id: data.user.id,
                        name: payload.name,
                        phone: payload.phone ?? null,
                    },
                    { onConflict: "id" },
                );

            if (profileError) {
                throw new HttpError(400, "Registered, but failed to upsert profile", profileError.message);
            }
        }

        res.status(201).json({
            user: data.user,
            session: data.session,
        });
    }),
);

authRouter.post(
    "/login",
    route(async (req, res) => {
        const payload = loginSchema.parse(req.body);

        const { data, error } = await supabaseAnonClient.auth.signInWithPassword({
            email: payload.email,
            password: payload.password,
        });

        if (error || !data.user || !data.session) {
            throw new HttpError(401, "Invalid email or password", error?.message);
        }

        res.json({
            user: data.user,
            session: data.session,
        });
    }),
);

authRouter.post(
    "/refresh",
    route(async (req, res) => {
        const payload = refreshSchema.parse(req.body);

        const { data, error } = await supabaseAnonClient.auth.refreshSession({
            refresh_token: payload.refreshToken,
        });

        if (error || !data.session) {
            throw new HttpError(401, "Failed to refresh session", error?.message);
        }

        res.json({
            user: data.user,
            session: data.session,
        });
    }),
);

authRouter.post(
    "/logout",
    requireAuth,
    route(async (req, res) => {
        const accessToken = req.accessToken;
        if (!accessToken) {
            throw new HttpError(401, "Missing access token");
        }

        const userClient = createSupabaseUserClient(accessToken);
        const { error } = await userClient.auth.signOut();
        if (error) {
            throw new HttpError(400, "Failed to logout", error.message);
        }

        res.status(204).send();
    }),
);

export { authRouter };
