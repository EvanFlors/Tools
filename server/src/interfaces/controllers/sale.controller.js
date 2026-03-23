import SaleService from "../../application/services/sale.service.js";
import {
  createSaleSchema,
  updateSaleSchema,
} from "../../application/validators/sale.validator.js";
import { validateRequest } from "../../application/validators/validation.utils.js";

const createSale = async (req, res) => {
  try {
    const validation = validateRequest(createSaleSchema, req.body);

    if (!validation.success) {
      return res.status(422).json({
        message: "Validation errors",
        errors: validation.errors,
      });
    }

    const sale = await SaleService.create(validation.data, req.user.id);
    res.status(201).json(sale);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getSales = async (req, res) => {
  try {
    const sales = await SaleService.findAll(req.user.id);
    res.json(sales);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getSale = async (req, res) => {
  try {
    const sale = await SaleService.findById(req.params.id, req.user.id);
    res.json(sale);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

const updateSale = async (req, res) => {
  try {
    const bodyValidation = validateRequest(updateSaleSchema, req.body);

    if (!bodyValidation.success) {
      return res.status(422).json({
        message: "Validation errors",
        errors: bodyValidation.errors,
      });
    }

    const sale = await SaleService.updateById(
      req.params.id,
      bodyValidation.data,
      req.user.id
    );
    res.json(sale);
  } catch (error) {
    console.error("Error updating sale:", error);
    const statusCode = error.status || 500;
    res.status(statusCode).json({
      error: error.message || "Internal server error",
    });
  }
};

const deleteSale = async (req, res) => {
  try {
    await SaleService.deleteById(req.params.id, req.user.id);
    res.status(200).json({
      message: "Sale deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting sale:", error);

    if (error.status == 404) {
      res.status(404).json({ error: error.message });
    } else if (error.status == 422) {
      res.status(422).json({ error: error.message });
    } else {
      res.status(500).json({
        error: error.message || "Internal server error",
      });
    }
  }
};

export default {
  createSale,
  getSales,
  getSale,
  updateSale,
  deleteSale,
};
