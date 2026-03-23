import cookieParser from "cookie-parser";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";

import corsConfig from "./src/config/cors.js";

import authenticate from "./src/interfaces/middlewares/auth.middleware.js";
import errorMiddleware from "./src/interfaces/middlewares/error.middleware.js";

import imageController from "./src/interfaces/controllers/image.controller.js";
import adminRoutes from "./src/interfaces/routes/admin.routes.js";
import authRoutes from "./src/interfaces/routes/auth.routes.js";
import clientRoutes from "./src/interfaces/routes/client.routes.js";

const app = express();

// Basic security
app.use(helmet());

// Logs
app.use(morgan("dev"));

// JSON parsing
app.use(express.json({ limit: "10kb" }));

// CORS
app.use(corsConfig);

// Cookie parsing
app.use(cookieParser());

// Auth
app.use("/auth", authRoutes);

// Public image endpoint (no authentication required)
app.get("/images/:id", imageController.getImage);

// Admin routes (protected)
app.use("/admin", authenticate, adminRoutes);

// Client routes
app.use("/client", clientRoutes);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Error handler
app.use(errorMiddleware);

export default app;
