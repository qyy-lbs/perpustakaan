import express from "express";
import { createRack, getRacks } from "../controllers/rack.controller.js";
import {
  authMiddleware,
  roleMiddleware,
} from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", getRacks);

router.post(
  "/",
  authMiddleware,
  roleMiddleware(["PUSTAKAWAN"]),
  createRack
);

export default router;