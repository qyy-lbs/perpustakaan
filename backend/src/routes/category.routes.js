import express from "express";
import {
  createCategory,
  getCategories,
} from "../controllers/category.controller.js";
import {
  authMiddleware,
  roleMiddleware,
} from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", getCategories);

router.post(
  "/",
  authMiddleware,
  roleMiddleware(["PUSTAKAWAN"]),
  createCategory
);

export default router;