import express from "express";
import cors from "cors";
import { errorMiddleware } from "./middleware/errorhandler.js";
import userRoutes from "./routes/user/index.route.js"
import adminRoutes from "./routes/admin/index.route.js"
import { requestLogger } from "./middleware/logger.middleware.js";
import { rateLimit } from "./middleware/rate.limiter.middeware.js";
import { generalRateLimit } from "./config/rate.limit.js";

const app = express();

app.set("trust proxy", 1);

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
    res.status(200).json({
        status: "ok",
        message: "BACKEND API is running",
    });
});

app.use(requestLogger);
app.use(rateLimit(generalRateLimit));

app.use("/api/user", userRoutes);
app.use("/api/admin", adminRoutes);

app.use((_req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found",
    });
});

app.use(errorMiddleware);

export default app;