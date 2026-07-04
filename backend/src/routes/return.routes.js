import express from "express";
import {
  checkReturn,
  confirmReturn,
} from "../controllers/return.controller.js";
import {
  authMiddleware,
  roleMiddleware,
} from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post(
  "/check",
  authMiddleware,
  roleMiddleware(["PUSTAKAWAN"]),
  checkReturn
);

router.post(
  "/:loanId/confirm",
  authMiddleware,
  roleMiddleware(["PUSTAKAWAN"]),
  confirmReturn
);

export default router;