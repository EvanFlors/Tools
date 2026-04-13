import express from "express";
import publicController from "../controllers/public.controller.js";

const router = express.Router();

router.get("/products", publicController.getProducts);

export default router;
