import { expect, jest } from "@jest/globals";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

// ---- create mocks FIRST ----
const encryptMock = jest.fn();
const decryptMock = jest.fn();
const blindIndexMock = jest.fn();

// ---- mock module BEFORE imports that depend on it ----
jest.unstable_mockModule(
  "../../../src/infrastructure/security/encryption.service.js",
  () => ({
    encrypt: encryptMock,
    decrypt: decryptMock,
    blindIndex: blindIndexMock,
  })
);

// ---- dynamic imports (required for unstable_mockModule) ----
const { default: CustomerService } = await import(
  "../../../src/application/services/customer.service.js"
);

const { default: Customer } = await import(
  "../../../src/domain/models/customer.model.js"
);

const { default: Sale } = await import(
  "../../../src/domain/models/sale.model.js"
);

const { default: Product } = await import(
  "../../../src/domain/models/product.model.js"
);

describe("CustomerService", () => {
  beforeEach(async () => {
    await Customer.deleteMany({});
    await Sale.deleteMany({});
    await Product.deleteMany({});

    jest.clearAllMocks();

    decryptMock.mockImplementation((v) => v);
    blindIndexMock.mockImplementation((v) => "blind_" + v);
    encryptMock.mockImplementation((v) => `enc_${v}`);
  });

  test("should create a customer successfully", async () => {
    const data = {
      name: "John Doe",
      phone: "123456",
      address: "Main Street",
      password: "secret123",
    };

    const customer = await CustomerService.create(data);

    expect(customer).toBeDefined();
    expect(customer._id).toBeDefined();
    expect(customer.passwordHash).not.toBe(data.password);

    const match = await bcrypt.compare("secret123", customer.passwordHash);
    expect(match).toBe(true);
  });

  test("should return existing customer if phone already exists", async () => {
    const data = {
      name: "John Doe",
      phone: "999",
      address: "Street",
      password: "secret",
    };

    const existing = await Customer.create({
      nameEncrypted: "John Doe",
      phoneEncrypted: "999",
      phoneBlindIndex: "blind_999",
      addressEncrypted: "Street",
      passwordHash: "hash",
    });

    const result = await CustomerService.create(data);

    expect(result._id.toString()).toBe(existing._id.toString());
  });

  test("should throw error if required fields missing", async () => {
    const data = {
      name: "John Doe",
      address: "Street",
    };

    await expect(CustomerService.create(data)).rejects.toThrow(
      "Missing required fields: name, phone, and address are required."
    );
  });

  test("should return all customers decrypted", async () => {
    await Customer.create({
      nameEncrypted: "Jane",
      phoneEncrypted: "111",
      phoneBlindIndex: "blind_111",
      addressEncrypted: "Street",
      passwordHash: "hash",
    });

    const customers = await CustomerService.findAll();

    expect(customers.length).toBe(1);
    expect(customers[0].name).toBe("Jane");
    expect(customers[0].phone).toBe("111");
    expect(customers[0].address).toBe("Street");
  });

  test("should find customer by id", async () => {
    const customer = await Customer.create({
      nameEncrypted: "Jane",
      phoneEncrypted: "222",
      phoneBlindIndex: "blind_222",
      addressEncrypted: "Street",
      passwordHash: "hash",
    });

    const result = await CustomerService.findById(customer._id);

    expect(result.name).toBe("Jane");
    expect(result.phone).toBe("222");
  });

  test("should return null if customer not found", async () => {
    const result = await CustomerService.findById(
      new mongoose.Types.ObjectId()
    );

    expect(result).toBeNull();
  });

  test("should update customer fields", async () => {
    const customer = await Customer.create({
      nameEncrypted: "Old Name",
      phoneEncrypted: "123",
      phoneBlindIndex: "blind_123",
      addressEncrypted: "Old Address",
      passwordHash: "hash",
    });

    const updated = await CustomerService.updateById(customer._id, {
      name: "New Name",
      phone: "999",
      address: "New Address",
      password: "newpass",
    });

    expect(updated.name).toBe("New Name");
    expect(updated.phone).toBe("999");

    const dbCustomer = await Customer.findById(customer._id);

    const match = await bcrypt.compare("newpass", dbCustomer.passwordHash);

    expect(match).toBe(true);
  });

  test("should throw error when updating non existing customer", async () => {
    await expect(
      CustomerService.updateById(new mongoose.Types.ObjectId(), {
        name: "Test",
      })
    ).rejects.toThrow("Customer not found");
  });

  test("should prevent deletion when customer has active sales", async () => {
    const customer = await Customer.create({
      nameEncrypted: "Test",
      phoneEncrypted: "555",
      phoneBlindIndex: "blind_555",
      addressEncrypted: "Street",
      passwordHash: "hash",
    });

    const product = await Product.create({
      name: "Test Product",
      price: 100,
      description: "Test description",
    });

    await Sale.create({
      customerId: customer._id,
      productId: product._id,
      paymentType: "installments",
      status: "active",
      totalAmount: 100,
    });

    await expect(CustomerService.deleteById(customer._id)).rejects.toThrow(
      "Customer has active sales and cannot be deleted"
    );
  });

  test("should throw error when deleting non existing customer", async () => {
    await expect(
      CustomerService.deleteById(new mongoose.Types.ObjectId())
    ).rejects.toThrow("Customer not found");
  });
});
