import express from "express";

import authController from "../controllers/client.auth.controller.js";
import clientController from "../controllers/client.controller.js";
import authenticate from "../middlewares/auth.middleware.js";

const router = express.Router();

// Public — customer login (no auth needed)
router.post("/auth/login", authController.loginCustomer);

// Protected — require authenticated customer
router.use(authenticate);

router.get("/products", clientController.getProducts);
router.get("/products/:productId", clientController.getProductDetail);
router.get("/sales", clientController.getMySales);
router.get("/sales/:saleId", clientController.getSaleDetail);

export default router;
