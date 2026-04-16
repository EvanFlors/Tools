import express from "express";
import authService from "../controllers/auth.controller.js";
import passwordResetController from "../controllers/passwordReset.controller.js";
import loginLimiter from "../middlewares/rateLimit.middleware.js";

const router = express.Router();

router.post("/login", loginLimiter, authService.login);
router.post("/refresh", authService.refresh);
router.post("/logout", authService.logout);
router.get("/me", authService.me);

// Password recovery
router.post(
  "/password-reset/request",
  loginLimiter,
  passwordResetController.requestReset
);
router.post("/password-reset/validate", passwordResetController.validateToken);
router.post(
  "/password-reset/reset",
  loginLimiter,
  passwordResetController.resetPassword
);

export default router;
