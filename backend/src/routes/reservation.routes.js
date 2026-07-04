import express from "express";
import {
  createReservation,
  getMyReservations,
  getReservationByCode,
  validateReservation,
  getMyReservationById,
  rejectReservation,
} from "../controllers/reservation.controller.js";
import {
  authMiddleware,
  roleMiddleware,
} from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  roleMiddleware(["MAHASISWA"]),
  createReservation
);
router.post(
  "/:kodeBooking/reject",
  authMiddleware,
  roleMiddleware(["PUSTAKAWAN"]),
  rejectReservation
);

router.get("/me", authMiddleware, getMyReservations);
router.get("/me/:id", authMiddleware, getMyReservationById);

router.get(
  "/:kodeBooking",
  authMiddleware,
  roleMiddleware(["PUSTAKAWAN"]),
  getReservationByCode
);

router.post(
  "/:kodeBooking/validate",
  authMiddleware,
  roleMiddleware(["PUSTAKAWAN"]),
  validateReservation
);

export default router;