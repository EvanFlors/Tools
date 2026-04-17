import rateLimit from "express-rate-limit";

// Strict limiter for auth endpoints (login, password reset)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // 50 attempts per window
  message: { error: "Too many attempts, please try again in 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});

// General API rate limiter
export const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: { error: "Too many requests, please slow down." },
  standardHeaders: true,
  legacyHeaders: false,
});

export default loginLimiter;
