import PasswordResetService from "../../application/services/passwordReset.service.js";

const requestReset = async (req, res) => {
  try {
    const { identifier } = req.body;

    if (!identifier) {
      return res.status(400).json({ error: "Username or email is required" });
    }

    const result = await PasswordResetService.requestReset(identifier);
    res.json(result);
  } catch (error) {
    console.error("Password reset request error:", error);
    // Always return generic message to prevent enumeration
    res.json({
      message: "If an account exists, a reset token has been generated.",
    });
  }
};

const validateToken = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: "Token is required" });
    }

    await PasswordResetService.validateToken(token);
    res.json({ valid: true });
  } catch (error) {
    const status = error.status || 400;
    res.status(status).json({ error: error.message || "Invalid token" });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res
        .status(400)
        .json({ error: "Token and new password are required" });
    }

    if (newPassword.length < 6) {
      return res
        .status(422)
        .json({ error: "Password must be at least 6 characters" });
    }

    const result = await PasswordResetService.resetPassword(token, newPassword);
    res.json(result);
  } catch (error) {
    const status = error.status || 400;
    res
      .status(status)
      .json({ error: error.message || "Password reset failed" });
  }
};

export default { requestReset, validateToken, resetPassword };
