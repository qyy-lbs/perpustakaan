import express from "express";
import {
  approveSuggestion,
  createSuggestion,
  getAllSuggestions,
  getMySuggestions,
  getSuggestionById,
  rejectSuggestion,
  updateSuggestionStatus,
} from "../controllers/suggestion.controller.js";
import {
  authMiddleware,
  roleMiddleware,
} from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  roleMiddleware(["DOSEN"]),
  createSuggestion
);

router.get("/me", authMiddleware, getMySuggestions);

router.get(
  "/",
  authMiddleware,
  roleMiddleware(["PUSTAKAWAN"]),
  getAllSuggestions
);

router.get(
  "/:id",
  authMiddleware,
  roleMiddleware(["PUSTAKAWAN", "DOSEN"]),
  getSuggestionById
);

router.patch(
  "/:id/status",
  authMiddleware,
  roleMiddleware(["PUSTAKAWAN"]),
  updateSuggestionStatus
);

router.post(
  "/:id/approve",
  authMiddleware,
  roleMiddleware(["PUSTAKAWAN"]),
  approveSuggestion
);

router.post(
  "/:id/reject",
  authMiddleware,
  roleMiddleware(["PUSTAKAWAN"]),
  rejectSuggestion
);

export default router;