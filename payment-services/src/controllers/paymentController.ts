import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import axios from "axios";

const prisma = new PrismaClient();
const USER_SERVICE_URL = process.env.USER_SERVICE_URL;
const midtransClient = require("midtrans-client");

const getInternalHeaders = () => {
  const token = process.env.INTERNAL_SERVICE_TOKEN;

  if (!token) throw new Error("INTERNAL_SERVICE_TOKEN must be configured");

  return { "x-internal-token": token };
};

const snap = new midtransClient.Snap({
  isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true",
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.MIDTRANS_CLIENT_KEY,
});

const methodMap: Record<
  string,
  "BANK_TRANSFER" | "CREDIT_CARD" | "E_WALLET" | "CASH"
> = {
  bank_transfer: "BANK_TRANSFER",
  credit_card: "CREDIT_CARD",

  gopay: "E_WALLET",
  shopeepay: "E_WALLET",
  qris: "E_WALLET",

  indomaret: "CASH",
  alfamart: "CASH",
};

// MIDTRANS WEBHOOK
export const midtransWebhook = async (req: Request, res: Response) => {
  try {
    console.log("========== MIDTRANS WEBHOOK ==========");
    console.log(JSON.stringify(req.body, null, 2));

    // STEP 1
    console.log("STEP 1 - Verify Notification");

    const notification = await snap.transaction.notification(req.body);

    const { order_id, transaction_status, fraud_status, payment_type } =
      notification;

    console.log("ORDER ID :", order_id);
    console.log("STATUS   :", transaction_status);

    // STEP 2
    let paymentStatus = "PENDING";

    if (transaction_status === "capture") {
      paymentStatus = fraud_status === "accept" ? "PAID" : "PENDING";
    } else if (transaction_status === "settlement") {
      paymentStatus = "PAID";
    } else if (
      transaction_status === "cancel" ||
      transaction_status === "deny" ||
      transaction_status === "expire"
    ) {
      paymentStatus = "FAILED";
    }

    console.log("STEP 2 - paymentStatus =", paymentStatus);

    // STEP 3
    console.log("STEP 3 - Search Payment");

    const payment = await prisma.payment.findFirst({
      where: {
        transactionId: order_id,
      },
    });

    console.log("STEP 3 RESULT :", payment);

    if (!payment) {
      console.log("Payment tidak ditemukan:", order_id);

      // Midtrans tetap harus mendapat 200
      return res.status(200).json({
        message: "Payment not found",
      });
    }

    // Hindari webhook duplicate
    if (payment.status === "PAID") {
      console.log("Payment already PAID");

      return res.status(200).json({
        message: "Already processed",
      });
    }

    // STEP 4
    if (paymentStatus === "PAID") {
      const paidAt = new Date();

      console.log("STEP 4 - Update Payment");

      const updatedPayment = await prisma.payment.update({
        where: {
          id: payment.id,
        },
        data: {
          status: paymentStatus,
          paidAt: paymentStatus === "PAID" ? paidAt : payment.paidAt,
          method: methodMap[payment_type] ?? payment.method,
        },
      });

      console.log("STEP 4 RESULT");
      console.log(updatedPayment);

      // STEP 5
      console.log("STEP 5 - Confirm Booking");
      console.log(`${USER_SERVICE_URL}/bookings/${payment.bookingId}/confirm`);

      try {
        const bookingRes = await axios.patch(
          `${USER_SERVICE_URL}/bookings/${payment.bookingId}/confirm`,
          {
            paidAt,
          },
          {
            headers: getInternalHeaders(),
          },
        );

        console.log("BOOKING RESPONSE");
        console.log(bookingRes.data);

        console.log("BOOKING CONFIRMED");
      } catch (err: any) {
        console.error("BOOKING CONFIRM ERROR");

        if (err.response) {
          console.error("STATUS :", err.response.status);
          console.error("DATA :", err.response.data);
        } else {
          console.error(err.message);
        }
      }
    }

    // STEP 6
    if (paymentStatus === "FAILED") {
      console.log("STEP 6 - Payment Failed");

      await prisma.payment.update({
        where: {
          id: payment.id,
        },
        data: {
          status: "FAILED",
          method: methodMap[payment_type] ?? payment.method,
        },
      });

      console.log("PAYMENT UPDATED TO FAILED");
    }

    console.log("Webhook Finished");

    return res.status(200).json({
      message: "OK",
    });
  } catch (err: any) {
    console.error("========== WEBHOOK ERROR ==========");

    console.error(err);

    if (err.response) {
      console.error("STATUS :", err.response.status);
      console.error("DATA :", err.response.data);
    }

    console.error(err.stack);

    // Tetap balas 200 supaya Midtrans tidak retry terus
    return res.status(200).json({
      message: "Webhook Error",
    });
  }
};

// CREATE PAYMENT
export const createPayment = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.headers["x-user-id"]);

    if (!userId) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }

    const { bookingId, method } = req.body;

    let booking;

    try {
      const bookingRes = await axios.get(
        `${USER_SERVICE_URL}/bookings/${bookingId}`,
        {
          headers: getInternalHeaders(),
        },
      );

      booking = bookingRes.data;
    } catch {
      return res.status(404).json({
        error: "Booking not found",
      });
    }

    // Booking harus masih pending
    if (booking.status !== "PENDING") {
      return res.status(400).json({
        error: `Booking is already ${booking.status.toLowerCase()}`,
      });
    }

    // Booking sudah expired
    if (new Date(booking.expiresAt) <= new Date()) {
      return res.status(400).json({
        error: "Booking has expired",
      });
    }

    // Ownership
    if (booking.userId !== userId) {
      return res.status(403).json({
        error: "Forbidden",
      });
    }

    // Cegah payment ganda
    const existingPayment = await prisma.payment.findFirst({
      where: {
        bookingId,
        status: {
          in: ["PENDING", "PAID"],
        },
      },
    });

    if (existingPayment) {
      return res.json({
        message: "Payment already exists",
        payment: existingPayment,
        token: existingPayment.snapToken,
        redirect_url: existingPayment.redirectUrl,
      });
    }

    const amount = booking.house.price;
    // Ambil data user untuk Midtrans
    const bookingRes = await axios.get(`${USER_SERVICE_URL}/bookings/me`, {
      headers: {
        "x-user-id": userId,
        ...getInternalHeaders(),
      },
    });

    const user = bookingRes.data.find(
      (item: any) => item.id === bookingId,
    )?.user;

    // Simpan payment
    const payment = await prisma.payment.create({
      data: {
        bookingId,
        userId,
        amount,
        method: method ?? "BANK_TRANSFER",
        status: "PENDING",
        transactionId: `TRX-${Date.now()}`,
      },
    });

    // Hitung sisa waktu booking
    const remainingMs = new Date(booking.expiresAt).getTime() - Date.now();
    const remainingMinutes = Math.max(1, Math.ceil(remainingMs / 60000));

    // Midtrans Parameter
    const parameter: any = {
      transaction_details: {
        order_id: payment.transactionId,
        gross_amount: amount,
      },

      customer_details: {
        first_name: user?.name ?? `User-${userId}`,
      },

      expiry: {
        unit: "minute",
        duration: remainingMinutes,
      },
    };

    switch (method) {
      case "BANK_TRANSFER":
        parameter.enabled_payments = [
          "bank_transfer",
          "bca_va",
          "bni_va",
          "bri_va",
          "permata_va",
          "other_va",
        ];
        break;

      case "E_WALLET":
        parameter.enabled_payments = ["gopay", "shopeepay"];
        break;

      case "CREDIT_CARD":
        parameter.enabled_payments = ["credit_card"];
        break;

      case "CASH":
        parameter.enabled_payments = ["indomaret", "alfamart"];
        break;
    }

    console.log("Remaining Minutes :", remainingMinutes);

    console.log("PARAMETER");
    console.log(parameter);

    const midtransTransaction = await snap.createTransaction(parameter);

    const updatedPayment = await prisma.payment.update({
      where: {
        id: payment.id,
      },
      data: {
        snapToken: midtransTransaction.token,
        redirectUrl: midtransTransaction.redirect_url,
      },
    });

    return res.json({
      payment: updatedPayment,
      token: updatedPayment.snapToken,
      redirect_url: updatedPayment.redirectUrl,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      error: "Failed to create payment",
    });
  }
};

// GET USER PAYMENTS
export const getPayments = async (req: Request, res: Response) => {
  try {
    const requesterId = Number(req.headers["x-user-id"]);

    const userId = Number(req.params.userId);

    // ✅ USER CAN ONLY ACCESS OWN PAYMENTS
    if (requesterId !== userId) {
      return res.status(403).json({
        error: "Forbidden",
      });
    }

    const payments = await prisma.payment.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.json(payments);
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      error: "Failed to get payments",
    });
  }
};

export const getPaymentByBooking = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.headers["x-user-id"]);
    const bookingId = Number(req.params.bookingId);

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const payment = await prisma.payment.findFirst({
      where: {
        bookingId,
        userId,
      },
    });

    if (!payment) {
      return res.status(404).json({
        error: "Payment not found",
      });
    }

    return res.json(payment);
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      error: "Failed to get payment",
    });
  }
};
