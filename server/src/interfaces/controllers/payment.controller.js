import PaymentService from "../../application/services/payment.service.js";
import {
  createPaymentSchema,
  updatePaymentSchema,
} from "../../application/validators/payment.validator.js";
import { validateRequest } from "../../application/validators/validation.utils.js";

const createPayment = async (req, res) => {
  try {
    const validation = validateRequest(createPaymentSchema, req.body);

    if (!validation.success) {
      return res.status(422).json({
        message: "Validation errors",
        errors: validation.errors,
      });
    }

    const { payment, generatedCoupons } = await PaymentService.create({
      saleId: validation.data.saleId,
      amount: validation.data.amount,
      couponId: validation.data.couponId || null,
      userId: req.user.id,
    });

    res.status(201).json({ data: payment, generatedCoupons });
  } catch (error) {
    const statusCode = error.status || 400;
    res.status(statusCode).json({ error: error.message });
  }
};

const getPayments = async (req, res) => {
  try {
    // If saleId query param is provided, filter by sale
    const { saleId } = req.query;
    let payments;

    if (saleId) {
      payments = await PaymentService.findBySaleId(saleId, req.user.id);
    } else {
      payments = await PaymentService.findAll(req.user.id);
    }

    res.json(payments);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getPayment = async (req, res) => {
  try {
    const payment = await PaymentService.findById(req.params.id, req.user.id);

    if (!payment) {
      return res.status(404).json({ error: "Payment not found" });
    }

    res.json(payment);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

const updatePayment = async (req, res) => {
  try {
    const validation = validateRequest(updatePaymentSchema, req.body);

    if (!validation.success) {
      return res.status(422).json({
        message: "Validation errors",
        errors: validation.errors,
      });
    }

    const payment = await PaymentService.updateById(
      req.params.id,
      validation.data,
      req.user.id
    );

    res.json(payment);
  } catch (error) {
    const statusCode = error.status || 400;
    res.status(statusCode).json({ error: error.message });
  }
};

const deletePayment = async (req, res) => {
  try {
    await PaymentService.deleteById(req.params.id, req.user.id);
    res.json({ message: "Payment deleted successfully" });
  } catch (error) {
    const statusCode = error.status || 400;
    res.status(statusCode).json({ error: error.message });
  }
};

export default {
  createPayment,
  getPayments,
  getPayment,
  updatePayment,
  deletePayment,
};
