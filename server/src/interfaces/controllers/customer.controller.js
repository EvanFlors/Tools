import CustomerService from "../../application/services/customer.service.js";
import {
  createCustomerSchema,
  updateCustomerSchema,
} from "../../application/validators/customer.validator.js";
import { validateRequest } from "../../application/validators/validation.utils.js";

const createCustomer = async (req, res, next) => {
  try {
    const validation = validateRequest(createCustomerSchema, req.body);

    if (!validation.success) {
      return res.status(422).json({
        message: "Validation errors",
        errors: validation.errors,
      });
    }

    const newCustomer = await CustomerService.create({
      ...validation.data,
      userId: req.user.id,
    });
    res.status(201).json({
      message: "Customer created successfully",
      data: newCustomer,
    });
  } catch (error) {
    next(error);
  }
};

const getCustomer = async (req, res) => {
  try {
    const customer = await CustomerService.findById(req.user.id, req.params.id);
    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }
    return res.status(200).json({
      message: "Customer retrieved successfully",
      data: customer,
    });
  } catch (error) {
    console.error("Error fetching customer:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getCustomers = async (req, res) => {
  try {
    const customers = await CustomerService.findAll(req.user.id);
    return res.status(200).json({
      message: "Customers retrieved successfully",
      data: customers,
    });
  } catch (error) {
    console.error("Error fetching customers:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const deleteCustomer = async (req, res) => {
  try {
    await CustomerService.deleteById(req.user.id, req.params.id);
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting customer:", error);
    const statusCode = error.status || 500;
    res.status(statusCode).json({
      error: error.message || "Internal server error",
    });
  }
};

const updateCustomer = async (req, res, next) => {
  try {
    const validation = validateRequest(updateCustomerSchema, req.body);

    if (!validation.success) {
      return res.status(422).json({
        message: "Validation errors",
        errors: validation.errors,
      });
    }

    if (Object.keys(validation.data).length === 0) {
      return res.status(400).json({
        message: "No valid update data provided",
      });
    }

    const customer = await CustomerService.updateById(
      req.user.id,
      req.params.id,
      validation.data
    );

    res.json({
      message: "Customer updated successfully",
      data: customer,
    });
  } catch (error) {
    next(error);
  }
};

export default {
  createCustomer,
  getCustomer,
  getCustomers,
  deleteCustomer,
  updateCustomer,
};
