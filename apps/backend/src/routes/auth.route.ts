import { Router } from "express";
import { z } from "zod";
import { env } from "../config/env";
import { createSupabaseUserClient, supabaseAnonClient, supabaseServiceRoleClient } from "../config/supabase";
import { HttpError } from "../lib/http-error";
import { route } from "../lib/route";
import { requireAuth } from "../middleware/auth";

function normalizePhone(value: string) {
    const compact = value.trim().replace(/[\s()-]/g, "");
    if (compact.startsWith("+")) {
        return `+${compact.slice(1).replace(/\D/g, "")}`;
    }

    return compact.replace(/\D/g, "");
}

const registerSchema = z.object({
    email: z.string().trim().email().transform((value) => value.toLowerCase()),
    password: z.string().min(6),
    name: z.string().min(2).max(120),
    phone: z
        .string()
        .trim()
        .optional()
        .transform((value) => {
            if (!value) {
                return undefined;
            }

            const normalized = normalizePhone(value);
            return normalized.length > 0 ? normalized : undefined;
        })
        .refine((value) => !value || (value.replace(/^\+/, "").length >= 8 && value.replace(/^\+/, "").length <= 30), {
            message: "Phone number must contain 8-30 digits",
        }),
});

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
});

const refreshSchema = z.object({
    refreshToken: z.string().min(1),
});

const forgotPasswordSendOtpSchema = z.object({
    email: z.string().trim().email().transform((value) => value.toLowerCase()),
});

function normalizeOtpCode(value: string) {
    return value.replace(/\D/g, "");
}

const forgotPasswordVerifyOtpSchema = z.object({
    email: z.string().trim().email().transform((value) => value.toLowerCase()),
    otpCode: z
        .string()
        .trim()
        .transform((value) => normalizeOtpCode(value))
        .refine((value) => value.length >= 6 && value.length <= 10, {
            message: "OTP Code harus 6-10 digit angka.",
        }),
});

const forgotPasswordResetSchema = z.object({
    password: z.string().min(6, "Kata sandi minimal 6 karakter."),
});

const authRouter = Router();

async function isEmailRegistered(email: string) {
    let page = 1;
    const perPage = 1000;
    const targetEmail = email.toLowerCase();

    while (true) {
        const { data, error } = await supabaseServiceRoleClient.auth.admin.listUsers({
            page,
            perPage,
        });

        if (error) {
            throw new HttpError(500, "Failed to validate email availability", error.message);
        }

        const exists = data.users.some((user) => (user.email || "").toLowerCase() === targetEmail);
        if (exists) {
            return true;
        }

        if (!data.nextPage) {
            return false;
        }

        page = data.nextPage;
    }
}

async function isPhoneRegistered(phone: string) {
    const { data, error } = await supabaseServiceRoleClient
        .from("profiles")
        .select("id")
        .eq("phone", phone)
        .maybeSingle();

    if (error) {
        throw new HttpError(500, "Failed to validate phone availability", error.message);
    }

    return Boolean(data?.id);
}

async function sendEmailWithResend(params: {
    to: string;
    subject: string;
    html: string;
}) {
    if (!env.RESEND_API_KEY) {
        throw new HttpError(500, "Email delivery belum dikonfigurasi (RESEND_API_KEY tidak ditemukan).");
    }

    const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${env.RESEND_API_KEY}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            from: env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev",
            to: [params.to],
            subject: params.subject,
            html: params.html,
        }),
    });

    if (!response.ok) {
        const raw = await response.text();
        throw new HttpError(502, "Gagal mengirim email OTP.", raw);
    }
}

authRouter.post(
    "/register",
    route(async (req, res) => {
        const payload = registerSchema.parse(req.body);

        const [emailUsed, phoneUsed] = await Promise.all([
            isEmailRegistered(payload.email),
            payload.phone ? isPhoneRegistered(payload.phone) : Promise.resolve(false),
        ]);

        if (emailUsed) {
            throw new HttpError(409, "Email sudah digunakan, coba dengan email lainnya");
        }

        if (phoneUsed) {
            throw new HttpError(409, "Nomor sudah digunakan, coba dengan nomor lainnya");
        }

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
            if (/already registered/i.test(error.message)) {
                throw new HttpError(409, "Email sudah digunakan, coba dengan email lainnya", error.message);
            }

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
                const isDuplicatePhoneError =
                    profileError.code === "23505" ||
                    /duplicate key value/i.test(profileError.message) ||
                    /profiles_phone_key/i.test(profileError.message);

                if (isDuplicatePhoneError) {
                    await supabaseServiceRoleClient.auth.admin.deleteUser(data.user.id).catch(() => null);
                    throw new HttpError(409, "Nomor sudah digunakan, coba dengan nomor lainnya", profileError.message);
                }

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
    "/forgot-password/send-otp",
    route(async (req, res) => {
        const payload = forgotPasswordSendOtpSchema.parse(req.body);
        const emailExists = await isEmailRegistered(payload.email);

        if (!emailExists) {
            res.json({
                message: "Jika email terdaftar, kode OTP akan dikirim.",
            });
            return;
        }

        const { data: generatedLink, error } = await supabaseServiceRoleClient.auth.admin.generateLink({
            type: "recovery",
            email: payload.email,
        });

        if (error || !generatedLink.properties?.email_otp) {
            throw new HttpError(400, "Gagal membuat OTP untuk reset password.", error?.message);
        }

        const otpCode = generatedLink.properties.email_otp;
        await sendEmailWithResend({
            to: payload.email,
            subject: "Kode OTP Reset Password",
            html: `
                <div style="font-family:Arial,sans-serif;padding:16px;line-height:1.5">
                    <h2 style="margin:0 0 12px 0;">Kode OTP Reset Password</h2>
                    <p style="margin:0 0 12px 0;">Gunakan kode berikut untuk melanjutkan reset password:</p>
                    <p style="font-size:28px;font-weight:700;letter-spacing:6px;margin:0 0 12px 0;">${otpCode}</p>
                    <p style="margin:0;color:#6b7280;">Kode ini berlaku beberapa menit. Jangan bagikan kode ini kepada siapa pun.</p>
                </div>
            `,
        });

        res.json({
            message: "Kode OTP berhasil dikirim ke email kamu.",
        });
    }),
);

authRouter.post(
    "/forgot-password/verify-otp",
    route(async (req, res) => {
        const payload = forgotPasswordVerifyOtpSchema.parse(req.body);

        const recoveryAttempt = await supabaseAnonClient.auth.verifyOtp({
            email: payload.email,
            token: payload.otpCode,
            type: "recovery",
        });

        const verifyResult =
            recoveryAttempt.error || !recoveryAttempt.data.user || !recoveryAttempt.data.session
                ? await supabaseAnonClient.auth.verifyOtp({
                      email: payload.email,
                      token: payload.otpCode,
                      type: "email",
                  })
                : recoveryAttempt;

        if (verifyResult.error || !verifyResult.data.user || !verifyResult.data.session) {
            throw new HttpError(401, "OTP tidak valid atau sudah kedaluwarsa.", verifyResult.error?.message);
        }

        res.json({
            user: verifyResult.data.user,
            session: verifyResult.data.session,
        });
    }),
);

authRouter.post(
    "/forgot-password/reset-password",
    requireAuth,
    route(async (req, res) => {
        const payload = forgotPasswordResetSchema.parse(req.body);
        const user = req.authUser;
        if (!user) {
            throw new HttpError(401, "User tidak ditemukan.");
        }

        const { data, error } = await supabaseServiceRoleClient.auth.admin.updateUserById(user.id, {
            password: payload.password,
        });

        if (error || !data.user) {
            throw new HttpError(400, "Gagal memperbarui password.", error?.message);
        }

        res.json({
            message: "Password berhasil diperbarui.",
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
