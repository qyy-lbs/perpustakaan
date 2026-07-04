import express from "express";
import {
  createBook,
  deleteBook,
  getBookById,
  getBooks,
  updateBook,
} from "../controllers/book.controller.js";
import {
  authMiddleware,
  roleMiddleware,
} from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", getBooks);
router.get("/:id", getBookById);

router.post(
  "/",
  authMiddleware,
  roleMiddleware(["PUSTAKAWAN"]),
  createBook
);

router.put(
  "/:id",
  authMiddleware,
  roleMiddleware(["PUSTAKAWAN"]),
  updateBook
);

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware(["PUSTAKAWAN"]),
  deleteBook
);

export default router;