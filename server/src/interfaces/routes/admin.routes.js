import express from "express";
import {
  handleMultipleUpload,
  handleUpload,
} from "../middlewares/image.middleware.js";

import customerController from "../controllers/customer.controller.js";
import imageController from "../controllers/image.controller.js";
import paymentController from "../controllers/payment.controller.js";
import productController from "../controllers/product.controller.js";
import profileController from "../controllers/profile.controller.js";
import saleController from "../controllers/sale.controller.js";
import userController from "../controllers/user.controller.js";

const router = express.Router();

// Profile (authenticated user's own data)
router.get("/profile", profileController.getProfile);
router.put("/profile", profileController.updateProfile);
router.delete("/profile", profileController.deleteProfile);

router.post("/users", userController.createUser);
router.get("/users", userController.getUsers);
router.get("/users/:id", userController.getUser);
router.put("/users/:id", userController.updateUser);
router.delete("/users/:id", userController.deleteUser);

router.post("/customers", customerController.createCustomer);
router.get("/customers", customerController.getCustomers);
router.get("/customers/:id", customerController.getCustomer);
router.put("/customers/:id", customerController.updateCustomer);
router.delete("/customers/:id", customerController.deleteCustomer);

router.post(
  "/products",
  handleMultipleUpload("images", 5),
  productController.createProduct
);
router.get("/products", productController.getProducts);
router.get("/products/:id", productController.getProduct);
router.put(
  "/products/:id",
  handleMultipleUpload("images", 5),
  productController.updateProduct
);
router.delete("/products/:id", productController.deleteProduct);
router.delete(
  "/products/:id/image/:imageId",
  productController.removeProductImage
);

router.post("/sales", saleController.createSale);
router.get("/sales", saleController.getSales);
router.get("/sales/:id", saleController.getSale);
router.put("/sales/:id", saleController.updateSale);
router.delete("/sales/:id", saleController.deleteSale);

router.post("/payments", paymentController.createPayment);
router.get("/payments", paymentController.getPayments);
router.get("/payments/:id", paymentController.getPayment);
router.put("/payments/:id", paymentController.updatePayment);
router.delete("/payments/:id", paymentController.deletePayment);

router.post(
  "/image/upload",
  handleUpload("image"),
  imageController.uploadProductImage
);
router.post(
  "/images/upload",
  handleMultipleUpload("images", 5),
  imageController.uploadMultipleImages
);
router.get("/image/:id", imageController.getImage);
router.delete("/image/:id", imageController.deleteProductImage);

export default router;
