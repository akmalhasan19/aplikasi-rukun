import dotenv from "dotenv";
import fs from "node:fs";
import path from "node:path";
import { z } from "zod";

const envCandidates = [
    path.resolve(process.cwd(), ".env"),
    path.resolve(process.cwd(), ".env.local"),
    path.resolve(process.cwd(), "../../.env"),
    path.resolve(process.cwd(), "../../.env.local"),
];

for (const envPath of envCandidates) {
    if (fs.existsSync(envPath)) {
        dotenv.config({ path: envPath, override: false });
    }
}

const envSchema = z.object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    PORT: z.coerce.number().int().positive().default(3001),
    API_PREFIX: z.string().default("/api"),
    CORS_ORIGINS: z.string().optional(),
    SUPABASE_URL: z.string().url(),
    SUPABASE_ANON_KEY: z.string().min(1),
    SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
    RESEND_API_KEY: z.string().min(1).optional(),
    RESEND_FROM_EMAIL: z.string().email().optional(),
    PLATFORM_ADMIN_EMAILS: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
    const errors = parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("\n");
    throw new Error(`Invalid environment variables:\n${errors}`);
}

const data = parsed.data;

export const env = {
    ...data,
    corsOrigins: data.CORS_ORIGINS
        ? data.CORS_ORIGINS.split(",").map((origin) => origin.trim()).filter(Boolean)
        : [],
    platformAdminEmails: data.PLATFORM_ADMIN_EMAILS
        ? data.PLATFORM_ADMIN_EMAILS.split(",")
              .map((email) => email.trim().toLowerCase())
              .filter(Boolean)
        : [],
};
