import { Router } from "express";
import { z } from "zod";
import { createSupabaseUserClient, supabaseServiceRoleClient } from "../config/supabase";
import { HttpError } from "../lib/http-error";
import { route } from "../lib/route";
import { requireAuth } from "../middleware/auth";
import { assertOrganizationAdmin } from "../services/access-control";

const transactionTypeSchema = z.enum(["PEMASUKAN", "PENGELUARAN"]);

const listTransactionsQuerySchema = z.object({
    organizationId: z.string().uuid(),
    type: transactionTypeSchema.optional(),
    category: z.string().min(1).optional(),
    search: z.string().min(1).optional(),
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

const transactionIdParamSchema = z.object({
    id: z.string().uuid(),
});

const createTransactionSchema = z.object({
    organizationId: z.string().uuid(),
    type: transactionTypeSchema,
    amount: z.coerce.number().positive(),
    category: z.string().min(1).max(100),
    description: z.string().min(1).max(1000),
    proofUrl: z.string().url().optional(),
    date: z.string().datetime(),
});

const updateTransactionSchema = z
    .object({
        category: z.string().min(1).max(100).optional(),
        description: z.string().min(1).max(1000).optional(),
        proof_url: z.string().url().nullable().optional(),
        date: z.string().datetime().optional(),
    })
    .refine((value) => Object.keys(value).length > 0, {
        message: "At least one field must be provided",
    });

const transactionsRouter = Router();

transactionsRouter.use(requireAuth);

transactionsRouter.get(
    "/",
    route(async (req, res) => {
        const query = listTransactionsQuerySchema.parse(req.query);
        const accessToken = req.accessToken;
        if (!accessToken) {
            throw new HttpError(401, "Unauthorized");
        }

        const userClient = createSupabaseUserClient(accessToken);
        let requestBuilder = userClient
            .from("transactions")
            .select("*", { count: "exact" })
            .eq("organization_id", query.organizationId)
            .is("deleted_at", null)
            .order("date", { ascending: false });

        if (query.type) {
            requestBuilder = requestBuilder.eq("type", query.type);
        }

        if (query.category) {
            requestBuilder = requestBuilder.eq("category", query.category);
        }

        if (query.search) {
            requestBuilder = requestBuilder.ilike("description", `%${query.search}%`);
        }

        const from = (query.page - 1) * query.pageSize;
        const to = from + query.pageSize - 1;

        const { data, error, count } = await requestBuilder.range(from, to);

        if (error) {
            throw new HttpError(400, "Failed to fetch transactions", error.message);
        }

        res.json({
            data: data ?? [],
            pagination: {
                page: query.page,
                pageSize: query.pageSize,
                total: count ?? 0,
            },
        });
    }),
);

transactionsRouter.get(
    "/:id",
    route(async (req, res) => {
        const params = transactionIdParamSchema.parse(req.params);
        const accessToken = req.accessToken;
        if (!accessToken) {
            throw new HttpError(401, "Unauthorized");
        }

        const userClient = createSupabaseUserClient(accessToken);
        const { data, error } = await userClient
            .from("transactions")
            .select("*")
            .eq("id", params.id)
            .is("deleted_at", null)
            .single();

        if (error) {
            throw new HttpError(404, "Transaction not found", error.message);
        }

        res.json({
            transaction: data,
        });
    }),
);

transactionsRouter.post(
    "/",
    route(async (req, res) => {
        const payload = createTransactionSchema.parse(req.body);
        const user = req.authUser;
        if (!user) {
            throw new HttpError(401, "Unauthorized");
        }

        await assertOrganizationAdmin(user.id, payload.organizationId);

        const { data, error } = await supabaseServiceRoleClient
            .from("transactions")
            .insert({
                organization_id: payload.organizationId,
                type: payload.type,
                amount: payload.amount,
                category: payload.category,
                description: payload.description,
                proof_url: payload.proofUrl ?? null,
                date: payload.date,
                created_by: user.id,
            })
            .select("*")
            .single();

        if (error) {
            throw new HttpError(400, "Failed to create transaction", error.message);
        }

        res.status(201).json({
            transaction: data,
        });
    }),
);

transactionsRouter.put(
    "/:id",
    route(async (req, res) => {
        const params = transactionIdParamSchema.parse(req.params);
        const payload = updateTransactionSchema.parse(req.body);
        const user = req.authUser;
        if (!user) {
            throw new HttpError(401, "Unauthorized");
        }

        const { data: existing, error: existingError } = await supabaseServiceRoleClient
            .from("transactions")
            .select("id, organization_id, deleted_at")
            .eq("id", params.id)
            .single();

        if (existingError || !existing) {
            throw new HttpError(404, "Transaction not found", existingError?.message);
        }

        if (existing.deleted_at) {
            throw new HttpError(400, "Transaction has been deleted");
        }

        await assertOrganizationAdmin(user.id, existing.organization_id);

        const { data, error } = await supabaseServiceRoleClient
            .from("transactions")
            .update(payload)
            .eq("id", params.id)
            .select("*")
            .single();

        if (error) {
            throw new HttpError(400, "Failed to update transaction", error.message);
        }

        res.json({
            transaction: data,
        });
    }),
);

transactionsRouter.delete(
    "/:id",
    route(async (req, res) => {
        const params = transactionIdParamSchema.parse(req.params);
        const user = req.authUser;
        if (!user) {
            throw new HttpError(401, "Unauthorized");
        }

        const { data: existing, error: existingError } = await supabaseServiceRoleClient
            .from("transactions")
            .select("id, organization_id, type, amount, deleted_at")
            .eq("id", params.id)
            .single();

        if (existingError || !existing) {
            throw new HttpError(404, "Transaction not found", existingError?.message);
        }

        if (existing.deleted_at) {
            throw new HttpError(400, "Transaction already deleted");
        }

        await assertOrganizationAdmin(user.id, existing.organization_id);

        const { error: deleteError } = await supabaseServiceRoleClient.from("transactions").delete().eq("id", params.id);

        if (deleteError) {
            throw new HttpError(400, "Failed to delete transaction", deleteError.message);
        }

        res.status(204).send();
    }),
);

export { transactionsRouter };
