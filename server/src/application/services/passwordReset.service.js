import crypto from "crypto";
import PasswordReset from "../../domain/models/passwordReset.model.js";
import User from "../../domain/models/user.model.js";
import { hashPassword } from "../../infrastructure/security/hash.service.js";

const TOKEN_EXPIRY_MINUTES = 30;
const MAX_ATTEMPTS = 5;

class PasswordResetService {
  static async requestReset(identifier) {
    const user = await User.findOne({
      $or: [{ username: identifier }, { email: identifier }],
      role: { $in: ["owner", "admin"] },
    });

    if (!user) {
      return {
        message: "If an account exists, a reset token has been generated.",
      };
    }

    await PasswordReset.updateMany(
      { userId: user._id, used: false },
      { $set: { used: true } }
    );

    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_MINUTES * 60 * 1000);

    await PasswordReset.create({
      userId: user._id,
      tokenHash,
      expiresAt,
    });

    return {
      message: "If an account exists, a reset token has been generated.",
      token: rawToken, // In production, send this via email instead
      expiresInMinutes: TOKEN_EXPIRY_MINUTES,
    };
  }

  static async validateToken(rawToken) {
    const tokenHash = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    const reset = await PasswordReset.findOne({
      tokenHash,
      used: false,
      expiresAt: { $gt: new Date() },
    });

    if (!reset) {
      throw { status: 400, message: "Invalid or expired reset token" };
    }

    if (reset.attempts >= MAX_ATTEMPTS) {
      reset.used = true;
      await reset.save();
      throw { status: 429, message: "Too many attempts. Request a new token." };
    }

    return true;
  }

  static async resetPassword(rawToken, newPassword) {
    const tokenHash = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    const reset = await PasswordReset.findOne({
      tokenHash,
      used: false,
      expiresAt: { $gt: new Date() },
    });

    if (!reset) {
      throw { status: 400, message: "Invalid or expired reset token" };
    }

    if (reset.attempts >= MAX_ATTEMPTS) {
      reset.used = true;
      await reset.save();
      throw { status: 429, message: "Too many attempts. Request a new token." };
    }

    reset.attempts += 1;
    await reset.save();

    const user = await User.findById(reset.userId);
    if (!user) {
      throw { status: 404, message: "User not found" };
    }

    user.passwordHash = await hashPassword(newPassword);
    user.refreshToken = null; // Invalidate all sessions
    await user.save();

    // Mark token as used
    reset.used = true;
    await reset.save();

    return { message: "Password reset successfully" };
  }
}

export default PasswordResetService;
