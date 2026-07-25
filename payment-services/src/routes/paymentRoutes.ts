import express from "express";
import {
  createPayment,
  getPayments,
  getPaymentByBooking,
  midtransWebhook,
} from "../controllers/paymentController";

import { authMiddleware } from "../middleware/authMiddleware";

const router = express.Router();

// ✅ Webhook diletakkan sebelum authMiddleware karena Midtrans tidak mengirimkan token auth
router.post("/webhook", midtransWebhook);

// 🔥 semua payment harus login
router.use(authMiddleware);

router.post("/", createPayment);
router.get("/booking/:bookingId", getPaymentByBooking);
router.get("/:userId", getPayments);

export default router;
