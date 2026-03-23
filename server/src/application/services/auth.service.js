import bcrypt from "bcryptjs";
import User from "../../domain/models/user.model.js";
import {
    generateAccessToken,
    generateRefreshToken,
    verifyRefreshToken
} from "../../config/jwt.js";
import { comparePassword } from "../../infrastructure/security/hash.service.js";

const login = async ({ username, phone, password }) => {

    if (!password) {
        throw { status: 400, message: "Password is required" };
    }

    const user = await User.findOne({
        $or: [{ username }, { phone }]
    });

    console.log(username, password, phone);

    if (!user) throw { status: 401, message: "Invalid credentials" };

    const isValidPassword = await comparePassword(password, user.passwordHash);
    if (!isValidPassword) throw { status: 401, message: "Invalid credentials" };

    const payload = {
        id: user._id,
        role: user.role
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    user.refreshToken = await bcrypt.hash(refreshToken, 12);
    await user.save();

    return { accessToken, refreshToken };
};


const refresh = async (oldRefreshToken) => {
    const decoded = verifyRefreshToken(oldRefreshToken);
    if (!decoded) throw new Error("Invalid refresh token");

    const user = await User.findById(decoded.id);
    if (!user || user.refreshToken !== oldRefreshToken) {
        throw { status: 403, message: "Invalid refresh token" };
    }

    const isValid = await bcrypt.compare(oldRefreshToken, user.refreshToken);
    if (!isValid) throw { status: 403, message: "Invalid refresh token" };

    const payload = {
        id: user._id,
        role: user.role
    };

    const newAccessToken = generateAccessToken(payload);
    const newRefreshToken = generateRefreshToken(payload);

    user.refreshToken = await bcrypt.hash(newRefreshToken, 12);
    await user.save();

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
};

const logout = async (userId) => {
    await User.findByIdAndUpdate(userId,
        { refreshToken: null }
);
};

export default {
    login,
    refresh,
    logout
};