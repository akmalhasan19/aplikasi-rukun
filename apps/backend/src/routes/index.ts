import { Router } from "express";
import { authRouter } from "./auth.route";
import { healthRouter } from "./health.route";
import { organizationsRouter } from "./organizations.route";
import { transactionsRouter } from "./transactions.route";
import { usersRouter } from "./users.route";

const apiRouter = Router();

apiRouter.use("/health", healthRouter);
apiRouter.use("/auth", authRouter);
apiRouter.use("/users", usersRouter);
apiRouter.use("/organizations", organizationsRouter);
apiRouter.use("/transactions", transactionsRouter);

export { apiRouter };
