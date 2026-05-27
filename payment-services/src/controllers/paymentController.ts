import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import axios from "axios";

const prisma = new PrismaClient();
const USER_SERVICE_URL = process.env.USER_SERVICE_URL;

// CREATE PAYMENT (fake)
export const createPayment = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.headers["x-user-id"]);

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { bookingId, amount, method } = req.body;

    const payment = await prisma.payment.create({
      data: {
        bookingId,
        userId,
        amount,
        method: method || "BANK_TRANSFER",
        status: "PENDING",
        transactionId: `TRX-${Date.now()}`,
      },
    });

    return res.json(payment);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to create payment" });
  }
};

// FAKE PAY (simulate success)
export const payPayment = async (req: Request, res: Response) => {
  try {
    const paymentId = Number(req.params.id);

    const payment = await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: "PAID",
        paidAt: new Date(),
      },
    });

    // 🔥 CALL USER SERVICE (NOT DIRECT DB)
    await axios.patch(
      `${USER_SERVICE_URL}/bookings/${payment.bookingId}/confirm`,
    );

    return res.json({
      message: "Payment success (fake)",
      payment,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Payment failed" });
  }
};

// GET USER PAYMENTS
export const getPayments = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.params.userId);

    const payments = await prisma.payment.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return res.json(payments);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to get payments" });
  }
};
