import express from "express";
import {
  getFineReport,
  getLoanReport,
  getReportSummary,
  getReturnReport,
  getSuggestionReport,
} from "../controllers/report.controller.js";
import {
  authMiddleware,
  roleMiddleware,
} from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get(
  "/summary",
  authMiddleware,
  roleMiddleware(["PUSTAKAWAN"]),
  getReportSummary
);

router.get(
  "/loans",
  authMiddleware,
  roleMiddleware(["PUSTAKAWAN"]),
  getLoanReport
);

router.get(
  "/returns",
  authMiddleware,
  roleMiddleware(["PUSTAKAWAN"]),
  getReturnReport
);

router.get(
  "/fines",
  authMiddleware,
  roleMiddleware(["PUSTAKAWAN"]),
  getFineReport
);

router.get(
  "/suggestions",
  authMiddleware,
  roleMiddleware(["PUSTAKAWAN"]),
  getSuggestionReport
);

export default router;