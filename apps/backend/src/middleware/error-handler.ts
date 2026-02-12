import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { env } from "../config/env";
import { isHttpError } from "../lib/http-error";

export function notFoundHandler(_req: Request, res: Response) {
    res.status(404).json({
        error: {
            message: "Route not found",
        },
    });
}

export function errorHandler(error: unknown, _req: Request, res: Response, _next: NextFunction) {
    if (error instanceof ZodError) {
        res.status(400).json({
            error: {
                message: "Validation error",
                details: error.issues,
            },
        });
        return;
    }

    if (isHttpError(error)) {
        res.status(error.statusCode).json({
            error: {
                message: error.message,
                details: error.details,
            },
        });
        return;
    }

    if (env.NODE_ENV !== "production") {
        // Keep raw error visible in development for faster debugging.
        // eslint-disable-next-line no-console
        console.error(error);
    }

    res.status(500).json({
        error: {
            message: "Internal server error",
        },
    });
}
