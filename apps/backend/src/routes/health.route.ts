import { Router } from "express";

const healthRouter = Router();

healthRouter.get("/", (_req, res) => {
    res.json({
        status: "ok",
        service: "aplikasi-rukun-backend",
        timestamp: new Date().toISOString(),
    });
});

export { healthRouter };
