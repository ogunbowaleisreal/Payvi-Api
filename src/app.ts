import express from "express";
import cors from "cors";
import { errorMiddleware } from "./middleware/errorhandler.js";
import userRoutes from "./routes/user/index.route.js"
import adminRoutes from "./routes/admin/index.route.js"
import { requestLogger } from "./middleware/logger.middleware.js";


const app = express();

app.use(cors());
app.use(express.json());
app.use(requestLogger)
app.use("/api/user", userRoutes);
app.use("/api/admin", adminRoutes);

app.get("/api/health", (_req, res) => {
    res.status(200).json({
        status: "ok",
        message: "BACKEND API is running",
    });
});
app.use(errorMiddleware)

export default app;