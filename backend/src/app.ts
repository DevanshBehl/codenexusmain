import express, { Application } from "express";
import cors from "cors";
import { errorHandler } from "./middleware/error-handler.js";
import { ApiResponse } from "./utils/api-response.js";
import authRoutes from './modules/auth/auth.routes.js';
import userRoutes from './modules/user/user.routes.js';
import contestRoutes from "./modules/contest/contest.routes.js";
import problemRoutes from "./modules/problem/problem.routes.js";
const app: Application = express();
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true
}));
app.get("/api/v1/health", (req, res) => {
    res.status(200).json(
        new ApiResponse(200, { status: "UP" }, "Server is running smoothly")
    )
})

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/contests", contestRoutes);
app.use("/api/v1/problems", problemRoutes);
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found"
    });
});

app.use(errorHandler);

export default app;
