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
    const existing = await User.findOne({
      $or: [{ username: userData.username }, { phone: userData.phone }],
    });

    if (existing) {
      throw new Error("User with this username or phone already exists");
    }

    // const hashedPassword = await this.hashPassword(userData.password);

    return User.create({
      username: userData.username,
      // passwordHash: hashedPassword,
      role: userData.role || "customer",
      phone: userData.phone,
    });
  }

  static async findAll() {
    return User.find().lean();
  }

  static async findById(id) {
    return User.findById(id);
  }

  static async updateById(id, userData) {
    const allowedFields = ["username", "phone", "role"];
    const update = {};

    for (const key of allowedFields) {
      if (userData[key] !== undefined) {
        update[key] = userData[key];
      }
    }

    // if (userData.password) {
    //   update.passwordHash = await this.hashPassword(userData.password);
    // }

    return User.findByIdAndUpdate(id, { $set: update }, { new: true });
  }

  static async deleteById(id) {
    const user = await User.findById(id);

    if (!user) {
      throw new Error("User not found");
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
