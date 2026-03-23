import express from "express";
import authService from "../controllers/auth.controller.js";
import loginLimiter from "../middlewares/rateLimit.middleware.js";

const router = express.Router();

router.post("/login", loginLimiter, authService.login);
router.post("/refresh", authService.refresh);
router.post("/logout", authService.logout);
router.get("/me", authService.me);

export default router;
