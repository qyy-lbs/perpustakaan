import express from "express";
import { createPayment } from "../controllers/payment.controller.js";
import {
  authMiddleware,
  roleMiddleware,
} from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  roleMiddleware(["PUSTAKAWAN"]),
  createPayment
);

export default router;