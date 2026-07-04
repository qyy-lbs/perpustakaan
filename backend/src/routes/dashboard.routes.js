import express from "express";
import {
  getCategoryChart,
  getDashboardSummary,
  getLoanChart,
} from "../controllers/dashboard.controller.js";
import {
  authMiddleware,
  roleMiddleware,
} from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get(
  "/summary",
  authMiddleware,
  roleMiddleware(["PUSTAKAWAN"]),
  getDashboardSummary
);

router.get(
  "/loan-chart",
  authMiddleware,
  roleMiddleware(["PUSTAKAWAN"]),
  getLoanChart
);

router.get(
  "/category-chart",
  authMiddleware,
  roleMiddleware(["PUSTAKAWAN"]),
  getCategoryChart
);

export default router;