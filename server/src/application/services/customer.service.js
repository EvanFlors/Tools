import Customer from "../../domain/models/customer.model.js";
import Sale from "../../domain/models/sale.model.js";
import {
  blindIndex,
  decrypt,
} from "../../infrastructure/security/encryption.service.js";

const decryptCustomer = (customer) => ({
  _id: customer._id,
  name: decrypt(customer.nameEncrypted),
  phone: decrypt(customer.phoneEncrypted),
  address: decrypt(customer.addressEncrypted),
});

class CustomerService {
  static async create(data) {
    if (!data.name || !data.phone || !data.address) {
      throw new Error(
        "Missing required fields: name, phone, and address are required."
      );
    }

    const phoneBlindIndex = blindIndex(data.phone);
    const existing = await Customer.findOne({ phoneBlindIndex });

    if (existing) {
      return existing;
    }

    const customer = await Customer.create({
      name: data.name,
      address: data.address,
      phone: data.phone,
      userId: data.userId,
    });

    return customer;
  }

  static async findAll(userId) {
    const customers = await Customer.find({ userId }).lean();

    return customers.map(decryptCustomer);
  }

  static async findById(userId, _id) {
    const customer = await Customer.findOne({ userId, _id });
    return customer ? decryptCustomer(customer.toObject()) : null;
  }

  static async deleteById(userId, _id) {
    const customer = await Customer.findOne({ _id, userId });

    if (!customer) {
      const error = new Error("Customer not found");
      error.status = 404;
      throw error;
    }

    const salesCount = await Sale.countDocuments({
      userId,
      customerId: _id,
      isDeleted: { $ne: true },
    });

    if (salesCount > 0) {
      const error = new Error(
        `Cannot delete customer with ${salesCount} existing sale(s). Delete all associated sales first.`
      );
      error.status = 422;
      throw error;
    }

    await customer.softDelete();

    return {
      message: "Customer deleted successfully",
    };
  }

  static async updateById(userId, _id, newData) {
    if (!newData || typeof newData !== "object") {
      throw new Error("Invalid update data provided");
    }

    const customer = await Customer.findOne({ _id, userId });

    if (!customer) {
      throw new Error("Customer not found");
    }

    if (newData.name !== undefined) {
      customer.name = newData.name;
    }

    if (newData.address !== undefined) {
      customer.address = newData.address;
    }

    if (newData.phone !== undefined) {
      customer.phone = newData.phone;
    }

    await customer.save();

    return customer;
  }
}

export default CustomerService;
