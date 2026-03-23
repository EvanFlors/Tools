import { jest } from "@jest/globals";

// Mock the SaleService BEFORE importing
jest.unstable_mockModule(
  "../../../src/application/services/sale.service.js",
  () => ({
    default: {
      create: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      updateById: jest.fn(),
      deleteById: jest.fn(),
    },
  })
);

// Dynamic imports AFTER mocking
const { default: SaleService } = await import(
  "../../../src/application/services/sale.service.js"
);

const { default: saleController } = await import(
  "../../../src/interfaces/controllers/sale.controller.js"
);

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("SaleController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should create a sale", async () => {
    const req = {
      body: { totalAmount: 1000 },
    };

    const res = mockResponse();

    const fakeSale = { id: "1", totalAmount: 1000 };

    SaleService.create.mockResolvedValue(fakeSale);

    await saleController.createSale(req, res);

    expect(SaleService.create).toHaveBeenCalledWith(req.body);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(fakeSale);
  });

  test("should return error when create fails", async () => {
    const req = { body: {} };
    const res = mockResponse();

    SaleService.create.mockRejectedValue(new Error("Invalid sale"));

    await saleController.createSale(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "Invalid sale",
    });
  });

  test("should return all sales", async () => {
    const req = {};
    const res = mockResponse();

    const sales = [{ id: "1" }, { id: "2" }];

    SaleService.findAll.mockResolvedValue(sales);

    await saleController.getSales(req, res);

    expect(SaleService.findAll).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(sales);
  });

  test("should handle error when getting sales", async () => {
    const req = {};
    const res = mockResponse();

    SaleService.findAll.mockRejectedValue(new Error("Database error"));

    await saleController.getSales(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "Database error",
    });
  });

  test("should return a sale by id", async () => {
    const req = { params: { id: "123" } };
    const res = mockResponse();

    const sale = { id: "123", totalAmount: 500 };

    SaleService.findById.mockResolvedValue(sale);

    await saleController.getSale(req, res);

    expect(SaleService.findById).toHaveBeenCalledWith("123");
    expect(res.json).toHaveBeenCalledWith(sale);
  });

  test("should return 404 when sale not found", async () => {
    const req = { params: { id: "123" } };
    const res = mockResponse();

    SaleService.findById.mockRejectedValue(new Error("Sale not found"));

    await saleController.getSale(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      error: "Sale not found",
    });
  });

  test("should update a sale", async () => {
    const req = {
      params: { id: "123" },
      body: { totalAmount: 900 },
    };

    const res = mockResponse();

    const updatedSale = { id: "123", totalAmount: 900 };

    SaleService.updateById.mockResolvedValue(updatedSale);

    await saleController.updateSale(req, res);

    expect(SaleService.updateById).toHaveBeenCalledWith("123", req.body);

    expect(res.json).toHaveBeenCalledWith(updatedSale);
  });

  test("should return 404 if update fails", async () => {
    const req = {
      params: { id: "123" },
      body: {},
    };

    const res = mockResponse();

    SaleService.updateById.mockRejectedValue(new Error("Sale not found"));

    await saleController.updateSale(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("should delete a sale", async () => {
    const req = { params: { id: "123" } };
    const res = mockResponse();

    SaleService.deleteById.mockResolvedValue();

    await saleController.deleteSale(req, res);

    expect(SaleService.deleteById).toHaveBeenCalledWith("123");

    expect(res.json).toHaveBeenCalledWith({
      message: "Sale deleted",
    });
  });

  test("should return 404 when delete fails", async () => {
    const req = { params: { id: "123" } };
    const res = mockResponse();

    SaleService.deleteById.mockRejectedValue(new Error("Sale not found"));

    await saleController.deleteSale(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      error: "Sale not found",
    });
  });
});
