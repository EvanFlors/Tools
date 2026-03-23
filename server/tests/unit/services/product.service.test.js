import { jest } from "@jest/globals";
import mongoose from "mongoose";

// ---- create mocks FIRST ----
const uploadImageMock = jest.fn();
const deleteImageMock = jest.fn();

// ---- mock module BEFORE imports that depend on it ----
jest.unstable_mockModule(
  "../../../src/infrastructure/storage/image.service.js",
  () => ({
    uploadImage: uploadImageMock,
    deleteImage: deleteImageMock,
  })
);

// ---- dynamic imports (required for unstable_mockModule) ----
const ProductService = (
  await import("../../../src/application/services/product.service.js")
).default;

const Product = (await import("../../../src/domain/models/product.model.js"))
  .default;

const Image = (await import("../../../src/domain/models/image.model.js"))
  .default;

const id = () => new mongoose.Types.ObjectId();

describe("ProductService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /* CREATE */

  test("should create product with images", async () => {
    const fakeImage = { _id: id() };

    uploadImageMock.mockResolvedValue(fakeImage);

    const files = [
      {
        buffer: Buffer.from("img"),
        originalname: "phone.png",
        mimetype: "image/png",
      },
    ];

    const data = {
      name: "Phone",
      price: 1000,
      description: "Smartphone",
    };

    jest.spyOn(Product, "create").mockResolvedValue({
      ...data,
      imageIds: [fakeImage._id],
      populate: jest.fn().mockResolvedValue({
        ...data,
        imageIds: [fakeImage],
      }),
    });

    const product = await ProductService.create(data, files);

    expect(uploadImageMock).toHaveBeenCalledTimes(1);
    expect(product.name).toBe("Phone");
  });

  /* FIND ALL */

  test("should return all products", async () => {
    const products = [{ name: "Laptop" }];

    jest.spyOn(Product, "find").mockReturnValue({
      populate: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue(products),
      }),
    });

    const result = await ProductService.findAll();

    expect(result.length).toBe(1);
  });

  /* FIND BY ID */

  test("should find product by id", async () => {
    const productId = id();

    const product = {
      _id: productId,
      name: "Tablet",
    };

    jest.spyOn(Product, "findOne").mockReturnValue({
      populate: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue(product),
      }),
    });

    const result = await ProductService.findById(productId);

    expect(result.name).toBe("Tablet");
  });

  test("should throw if product not found", async () => {
    jest.spyOn(Product, "findOne").mockReturnValue({
      populate: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue(null),
      }),
    });

    await expect(ProductService.findById(id())).rejects.toThrow(
      "Product not found"
    );
  });

  /* UPDATE */

  test("should update product data", async () => {
    const productId = id();

    const mockProduct = {
      _id: productId,
      name: "Old",
      price: 100,
      imageIds: [],
      save: jest.fn(),
      populate: jest.fn().mockResolvedValue({
        name: "New",
        price: 200,
      }),
    };

    jest.spyOn(Product, "findOne").mockResolvedValue(mockProduct);

    const result = await ProductService.updateById(productId, {
      name: "New",
      price: 200,
    });

    expect(mockProduct.save).toHaveBeenCalled();
    expect(result.price).toBe(200);
  });

  test("should reject negative price", async () => {
    const productId = id();

    const mockProduct = {
      _id: productId,
      imageIds: [],
      save: jest.fn(),
    };

    jest.spyOn(Product, "findOne").mockResolvedValue(mockProduct);

    await expect(
      ProductService.updateById(productId, { price: -10 })
    ).rejects.toThrow("Price cannot be negative");
  });

  /* DELETE */

  test("should delete product with images", async () => {
    const productId = id();
    const imageId = id();

    const mockProduct = {
      _id: productId,
      imageIds: [imageId],
      softDelete: jest.fn(),
    };

    jest.spyOn(Product, "findOne").mockResolvedValue(mockProduct);

    jest.spyOn(Image, "findById").mockResolvedValue({
      gridfsId: id(),
    });

    deleteImageMock.mockResolvedValue();

    const result = await ProductService.deleteById(productId);

    expect(deleteImageMock).toHaveBeenCalledTimes(1);
    expect(mockProduct.softDelete).toHaveBeenCalled();
    expect(result.message).toBe("Product deleted successfully");
  });

  /* REMOVE IMAGE */

  test("should remove image from product", async () => {
    const productId = id();
    const imageId = id();

    const mockProduct = {
      _id: productId,
      imageIds: [imageId],
      save: jest.fn(),
    };

    jest.spyOn(Product, "findOne").mockResolvedValue(mockProduct);

    jest.spyOn(Image, "findById").mockResolvedValue({
      gridfsId: id(),
    });

    deleteImageMock.mockResolvedValue();

    const result = await ProductService.removeImage(productId, imageId);

    expect(deleteImageMock).toHaveBeenCalled();
    expect(mockProduct.save).toHaveBeenCalled();
    expect(result.message).toBe("Image removed successfully");
  });
});
