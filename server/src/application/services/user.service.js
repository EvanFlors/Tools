import bcrypt from "bcryptjs";
import Customer from "../../domain/models/customer.model.js";
import Payment from "../../domain/models/payment.model.js";
import Product from "../../domain/models/product.model.js";
import Sale from "../../domain/models/sale.model.js";
import User from "../../domain/models/user.model.js";

class UserService {
  static async hashPassword(password) {
    return await bcrypt.hash(password, 12);
  }

  static async create(userData) {
    // Only allow creating admin users through this service
    if (userData.role && userData.role !== "admin") {
      throw new Error("Only admin users can be created through this endpoint");
    }

    const orConditions = [{ username: userData.username }];
    if (userData.phone) orConditions.push({ phone: userData.phone });
    if (userData.email) orConditions.push({ email: userData.email });

    const existing = await User.findOne({ $or: orConditions });
    if (existing) {
      throw new Error("User with this username, phone or email already exists");
    }

    if (!userData.password) {
      throw new Error("Password is required");
    }

    const hashedPassword = await this.hashPassword(userData.password);

    return User.create({
      username: userData.username,
      passwordHash: hashedPassword,
      role: "admin",
      phone: userData.phone,
      email: userData.email,
    });
  }

  static async findAll() {
    // Return only admin users (not owners or customers)
    return User.find({ role: "admin" })
      .select("-passwordHash -refreshToken")
      .lean();
  }

  static async findById(id) {
    const user = await User.findById(id).select("-passwordHash -refreshToken");
    if (!user) throw new Error("User not found");
    return user;
  }

  static async updateById(id, userData) {
    const user = await User.findById(id);
    if (!user) throw new Error("User not found");

    // Prevent changing role to owner
    if (userData.role && userData.role === "owner") {
      throw new Error("Cannot assign owner role");
    }

    const allowedFields = ["username", "phone", "email"];
    const update = {};

    for (const key of allowedFields) {
      if (userData[key] !== undefined) {
        update[key] = userData[key];
      }
    }

    if (userData.password) {
      update.passwordHash = await this.hashPassword(userData.password);
    }

    return User.findByIdAndUpdate(id, { $set: update }, { new: true }).select(
      "-passwordHash -refreshToken"
    );
  }

  static async deleteById(id) {
    const user = await User.findById(id);

    if (!user) {
      throw new Error("User not found");
    }

    if (user.role === "owner") {
      throw new Error("Cannot delete the owner account");
    }

    await Sale.updateMany(
      { userId: id },
      { $set: { isDeleted: true, deletedAt: new Date() } }
    );

    await Payment.updateMany(
      { userId: id },
      { $set: { isDeleted: true, deletedAt: new Date() } }
    );

    await Product.updateMany(
      { userId: id },
      { $set: { isDeleted: true, deletedAt: new Date() } }
    );

    await Customer.updateMany(
      { userId: id },
      { $set: { isDeleted: true, deletedAt: new Date() } }
    );

    await user.softDelete();
  }
}

export default UserService;
