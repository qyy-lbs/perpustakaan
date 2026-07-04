import express from "express";
import { getAllLoans, getMyLoans } from "../controllers/loan.controller.js";
import {
  authMiddleware,
  roleMiddleware,
} from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/me", authMiddleware, getMyLoans);

router.get(
  "/",
  authMiddleware,
  roleMiddleware(["PUSTAKAWAN"]),
  getAllLoans
);

export default router;