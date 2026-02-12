import type { NextFunction, Request, Response } from "express";
import { supabaseAnonClient } from "../config/supabase";
import { HttpError } from "../lib/http-error";

function extractBearerToken(authorizationHeader: string | undefined) {
    if (!authorizationHeader) {
        return null;
    }

    const [scheme, token] = authorizationHeader.split(" ");
    if (scheme !== "Bearer" || !token) {
        return null;
    }

    return token;
}

export async function requireAuth(req: Request, _res: Response, next: NextFunction) {
    const token = extractBearerToken(req.header("authorization"));
    if (!token) {
        next(new HttpError(401, "Missing or invalid bearer token"));
        return;
    }

    const { data, error } = await supabaseAnonClient.auth.getUser(token);
    if (error || !data.user) {
        next(new HttpError(401, "Invalid access token", error?.message));
        return;
    }

    req.authUser = data.user;
    req.accessToken = token;
    next();
}
