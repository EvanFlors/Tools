import { generateAccessToken, generateRefreshToken } from "../../config/jwt.js";
import Customer from "../../domain/models/customer.model.js";
import { blindIndex } from "../../infrastructure/security/encryption.service.js";

const cookieOptions = {
  httpOnly: true,
  secure: process.env.COOKIE_SECURE === "true",
  sameSite: "Strict",
};

const loginCustomer = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ message: "Phone number is required" });
    }

    const phoneBI = blindIndex(phone);
    const customer = await Customer.findOne({ phoneBlindIndex: phoneBI });

    if (!customer) {
      return res
        .status(401)
        .json({ message: "No account found with that phone number" });
    }

    const payload = {
      id: customer._id,
      role: "customer",
      // Store the admin userId so we can scope client queries to the right admin's data
      adminUserId: customer.userId,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    res
      .cookie("accessToken", accessToken, {
        ...cookieOptions,
        maxAge: 15 * 60 * 1000,
      })
      .cookie("refreshToken", refreshToken, {
        ...cookieOptions,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .json({
        message: "Login successful",
      });
  } catch (error) {
    console.error("Error logging in customer:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export default {
  loginCustomer,
};
