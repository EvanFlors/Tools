import UserService from "../../application/services/user.service.js";
import {
  createProfileSchema,
  updateProfileSchema,
} from "../../application/validators/profile.validator.js";
import { validateRequest } from "../../application/validators/validation.utils.js";
import User from "../../domain/models/user.model.js";
import {
  comparePassword,
  hashPassword,
} from "../../infrastructure/security/hash.service.js";

const createProfile = async (req, res) => {
  try {
    const bodyValidation = validateRequest(createProfileSchema, req.body);

    if (!bodyValidation.success) {
      return res.status(422).json({
        message: "Validation errors",
        errors: bodyValidation.errors,
      });
    }

    const { username, phone, password } = req.body;

    const hashedPassword = await hashPassword(password);
    const user = await UserService.create({
      username,
      phone,
      passwordHash: hashedPassword,
    });

    res.status(201).json({
      data: {
        _id: user._id,
        username: user.username,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Error creating profile:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await UserService.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      data: {
        _id: user._id,
        username: user.username,
        phone: user.phone,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const updateProfile = async (req, res) => {
  try {
    const bodyValidation = validateRequest(updateProfileSchema, req.body);

    if (!bodyValidation.success) {
      return res.status(422).json({
        message: "Validation errors",
        errors: bodyValidation.errors,
      });
    }

    const { username, phone, currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // If changing password, verify current password first
    if (newPassword) {
      if (!currentPassword) {
        return res.status(422).json({
          error: "Current password is required to set a new password",
        });
      }

      const isValid = await comparePassword(currentPassword, user.passwordHash);
      if (!isValid) {
        return res.status(422).json({ error: "Current password is incorrect" });
      }

      if (newPassword.length < 6) {
        return res.status(422).json({
          error: "New password must be at least 6 characters",
        });
      }

      user.passwordHash = await hashPassword(newPassword);
    }

    // Update allowed fields
    if (username !== undefined && username.trim() !== "") {
      // Check uniqueness
      const existing = await User.findOne({
        username: username.trim(),
        _id: { $ne: userId },
      });
      if (existing) {
        return res.status(422).json({ error: "Username is already taken" });
      }
      user.username = username.trim();
    }

    if (phone !== undefined && phone.trim() !== "") {
      const existing = await User.findOne({
        phone: phone.trim(),
        _id: { $ne: userId },
      });
      if (existing) {
        return res
          .status(422)
          .json({ error: "Phone number is already in use" });
      }
      user.phone = phone.trim();
    }

    await user.save();

    res.json({
      message: "Profile updated successfully",
      data: {
        _id: user._id,
        username: user.username,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const deleteProfile = async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(422).json({
        error: "Password is required to delete your account",
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const isValid = await comparePassword(password, user.passwordHash);
    if (!isValid) {
      return res.status(422).json({ error: "Password is incorrect" });
    }

    await UserService.deleteById(req.user.id);

    res
      .clearCookie("accessToken", {
        httpOnly: true,
        secure: process.env.COOKIE_SECURE === "true",
        sameSite: "Strict",
      })
      .clearCookie("refreshToken", {
        httpOnly: true,
        secure: process.env.COOKIE_SECURE === "true",
        sameSite: "Strict",
      })
      .json({ message: "Account deleted successfully" });
  } catch (error) {
    console.error("Error deleting profile:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export default {
  createProfile,
  getProfile,
  updateProfile,
  deleteProfile,
};
