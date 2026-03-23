import ProductService from "../../application/services/product.service.js";
import {
  createProductSchema,
  updateProductSchema,
  validateImageFiles,
} from "../../application/validators/product.validator.js";
import { validateRequest } from "../../application/validators/validation.utils.js";

// ======================================================
// Controllers
// ======================================================

const createProduct = async (req, res, next) => {
  try {
    const bodyValidation = validateRequest(createProductSchema, req.body);

    if (!bodyValidation.success) {
      return res.status(422).json({
        message: "Validation errors",
        errors: bodyValidation.errors,
      });
    }

    const imageErrors = validateImageFiles(req.files, true);
    if (Object.keys(imageErrors).length > 0) {
      return res.status(422).json({
        message: "Validation errors",
        errors: imageErrors,
      });
    }

    const product = await ProductService.create(
      bodyValidation.data,
      req.files,
      req.user.id
    );

    return res.status(201).json({
      message: "Product created successfully",
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

const getProducts = async (req, res, next) => {
  try {
    const products = await ProductService.findAll(req.user.id);

    return res.status(200).json({
      message: "Products retrieved successfully",
      data: products,
    });
  } catch (error) {
    next(error);
  }
};

const getProduct = async (req, res, next) => {
  try {
    const product = await ProductService.findById(req.params.id, req.user.id);

    return res.status(200).json({
      message: "Product retrieved successfully",
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const bodyValidation = validateRequest(updateProductSchema, req.body);

    if (!bodyValidation.success) {
      return res.status(422).json({
        message: "Validation errors",
        errors: bodyValidation.errors,
      });
    }

    const imageErrors = validateImageFiles(req.files, false);
    if (Object.keys(imageErrors).length > 0) {
      return res.status(422).json({
        message: "Validation errors",
        errors: imageErrors,
      });
    }

    const product = await ProductService.updateById(
      req.params.id,
      bodyValidation.data,
      req.files,
      req.user.id
    );

    return res.status(200).json({
      message: "Product updated successfully",
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

const deleteProduct = async (req, res) => {
  try {
    const result = await ProductService.deleteById(req.params.id, req.user.id);

    return res.status(200).json(result);
  } catch (error) {
    console.error("Error deleting product:", error);
    const statusCode = error.status || 500;
    res.status(statusCode).json({
      error: error.message || "Internal server error",
    });
  }
};

const removeProductImage = async (req, res, next) => {
  try {
    const result = await ProductService.removeImage(
      req.params.id,
      req.params.imageId,
      req.user.id
    );

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

// ======================================================
// Export
// ======================================================
export default {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  removeProductImage,
};
