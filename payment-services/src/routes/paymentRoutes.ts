import express from "express";
import {
  createPayment,
  payPayment,
  getPayments,
  getPaymentByBooking,
} from "../controllers/paymentController";

import { authMiddleware } from "../middleware/authMiddleware";

const router = express.Router();

// 🔥 semua payment harus login
router.use(authMiddleware);

router.post("/", createPayment);
router.get("/booking/:bookingId", getPaymentByBooking);
router.patch("/:id/pay", payPayment);
router.get("/:userId", getPayments);

export default router;
