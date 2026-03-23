import mongoose from "mongoose";
import PaymentService from "../../../src/application/services/payment.service.js";

import Sale from "../../../src/domain/models/sale.model.js";
import Payment from "../../../src/domain/models/payment.model.js";

const id = () => new mongoose.Types.ObjectId();

const createSale = async (amount = 1000) => {
  return Sale.create({
    productId: id(),
    customerId: id(),
    totalAmount: amount,
    remainingBalance: amount,
    paymentType: "installments"
  });
};

describe("PaymentService", () => {

  /* CREATE */

  test("should register a payment correctly", async () => {

    const userId = id();
    const sale = await createSale(1000);

    const payment = await PaymentService.create({
      saleId: sale._id,
      amount: 200,
      userId
    });

    const updatedSale = await Sale.findById(sale._id);

    expect(payment.amount).toBe(200);
    expect(payment.previousBalance).toBe(1000);
    expect(payment.newBalance).toBe(800);

    expect(updatedSale.remainingBalance).toBe(800);

  });


  test("should mark sale as paid when balance reaches zero", async () => {

    const sale = await createSale(300);

    await PaymentService.create({
      saleId: sale._id,
      amount: 300,
      userId: id()
    });

    const updatedSale = await Sale.findById(sale._id);

    expect(updatedSale.remainingBalance).toBe(0);
    expect(updatedSale.status).toBe("paid");

  });


  test("should reject payment exceeding balance", async () => {

    const sale = await createSale(500);

    await expect(
      PaymentService.create({
        saleId: sale._id,
        amount: 600,
        userId: id()
      })
    ).rejects.toThrow("Invalid payment amount");

  });


  test("should reject payment of zero or negative amount", async () => {

    const sale = await createSale(500);

    await expect(
      PaymentService.create({
        saleId: sale._id,
        amount: 0,
        userId: id()
      })
    ).rejects.toThrow("Invalid payment amount");

  });


  test("should reject payment for paid sale", async () => {

    const sale = await createSale(200);

    sale.remainingBalance = 0;
    sale.status = "paid";
    await sale.save();

    await expect(
      PaymentService.create({
        saleId: sale._id,
        amount: 100,
        userId: id()
      })
    ).rejects.toThrow("Sale is already paid");

  });


  /* FIND */

  test("should return payments by saleId ordered by newest first", async () => {

    const sale = await createSale(1000);
    const userId = id();

    await PaymentService.create({
      saleId: sale._id,
      amount: 200,
      userId
    });

    await PaymentService.create({
      saleId: sale._id,
      amount: 100,
      userId
    });

    const payments = await PaymentService.findBySaleId(sale._id);

    expect(payments.length).toBe(2);
    expect(payments[0].createdAt >= payments[1].createdAt).toBe(true);

  });


  /* DELETE */

  test("should delete payment and restore sale balance", async () => {

    const userId = id();
    const sale = await createSale(1000);

    const payment = await PaymentService.create({
      saleId: sale._id,
      amount: 200,
      userId
    });

    const result = await PaymentService.deleteById(payment._id, userId);

    const updatedSale = await Sale.findById(sale._id);
    const deletedPayment = await Payment.findById(payment._id);

    expect(updatedSale.remainingBalance).toBe(1000);
    expect(updatedSale.status).toBe("active");

    expect(result.message).toBe("Payment deleted successfully");
    expect(deletedPayment).toBeNull();

  });


  test("should throw when deleting non-existing payment", async () => {

    await expect(
      PaymentService.deleteById(id(), id())
    ).rejects.toThrow("Payment not found");

  });


  /* UPDATE */

  test("should update payment amount and adjust balance", async () => {

    const sale = await createSale(1000);
    const userId = id();

    const payment = await PaymentService.create({
      saleId: sale._id,
      amount: 200,
      userId
    });

    const updatedPayment = await PaymentService.updateById(
      payment._id,
      { amount: 300 },
      userId
    );

    const updatedSale = await Sale.findById(sale._id);

    expect(updatedPayment.amount).toBe(300);
    expect(updatedSale.remainingBalance).toBe(700);

  });


  test("should reject invalid payment update", async () => {

    const sale = await createSale(500);

    const payment = await PaymentService.create({
      saleId: sale._id,
      amount: 200,
      userId: id()
    });

    await expect(
      PaymentService.updateById(
        payment._id,
        { amount: 1000 },
        id()
      )
    ).rejects.toThrow("Invalid payment update");

  });


  test("should throw when updating non-existing payment", async () => {

    await expect(
      PaymentService.updateById(id(), { amount: 200 }, id())
    ).rejects.toThrow("Payment not found");

  });

});