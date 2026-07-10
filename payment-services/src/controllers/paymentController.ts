import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import axios from 'axios';

const prisma = new PrismaClient();
const USER_SERVICE_URL = process.env.USER_SERVICE_URL;

// CREATE PAYMENT
export const createPayment = async (req: Request, res: Response) => {
	try {
		const userId = Number(req.headers['x-user-id']);

		if (!userId) {
			return res.status(401).json({
				error: 'Unauthorized',
			});
		}

		const { bookingId, method } = req.body;

		// ✅ GET BOOKING
		const bookingRes = await axios.get(`${USER_SERVICE_URL}/bookings/${bookingId}`);

		const booking = bookingRes.data;

		if (!booking) {
			return res.status(404).json({
				error: 'Booking not found',
			});
		}

		// ✅ OWNERSHIP CHECK
		if (booking.userId !== userId) {
			return res.status(403).json({
				error: 'Forbidden',
			});
		}

		// ✅ PREVENT DUPLICATE PAYMENT
		const existingPayment = await prisma.payment.findFirst({
			where: {
				bookingId,
				status: {
					in: ['PENDING', 'PAID'],
				},
			},
		});

		if (existingPayment) {
			return res.json({
				message: 'Payment already exists',
				payment: existingPayment,
			});
		}

		// ✅ AUTO AMOUNT
		const amount = booking.house.price;

		const payment = await prisma.payment.create({
			data: {
				bookingId,
				userId,
				amount,
				method: method || 'BANK_TRANSFER',
				status: 'PENDING',
				transactionId: `TRX-${Date.now()}`,
			},
		});

		return res.json(payment);
	} catch (err) {
		console.error(err);

		return res.status(500).json({
			error: 'Failed to create payment',
		});
	}
};

// PAY PAYMENT
export const payPayment = async (req: Request, res: Response) => {
	try {
		const userId = Number(req.headers['x-user-id']);

		const paymentId = Number(req.params.id);

		// ✅ FIND PAYMENT
		const existingPayment = await prisma.payment.findUnique({
			where: {
				id: paymentId,
			},
		});

		if (!existingPayment) {
			return res.status(404).json({
				error: 'Payment not found',
			});
		}

		// ✅ OWNERSHIP CHECK
		if (existingPayment.userId !== userId) {
			return res.status(403).json({
				error: 'Forbidden',
			});
		}

		// ✅ PREVENT DOUBLE PAY
		if (existingPayment.status === 'PAID') {
			return res.status(400).json({
				error: 'Payment already paid',
			});
		}

		// ✅ UPDATE PAYMENT
		const paidAt = new Date();

		const payment = await prisma.payment.update({
			where: {
				id: paymentId,
			},
			data: {
				status: 'PAID',
				paidAt,
			},
		});

		// ✅ CONFIRM BOOKING
		await axios.patch(`${USER_SERVICE_URL}/bookings/${payment.bookingId}/confirm`, {
			paidAt,
		});

		return res.json({
			message: 'Payment success (fake)',
			payment,
		});
	} catch (err) {
		console.error(err);

		return res.status(500).json({
			error: 'Payment failed',
		});
	}
};

// GET USER PAYMENTS
export const getPayments = async (req: Request, res: Response) => {
	try {
		const requesterId = Number(req.headers['x-user-id']);

		const userId = Number(req.params.userId);

		// ✅ USER CAN ONLY ACCESS OWN PAYMENTS
		if (requesterId !== userId) {
			return res.status(403).json({
				error: 'Forbidden',
			});
		}

		const payments = await prisma.payment.findMany({
			where: {
				userId,
			},
			orderBy: {
				createdAt: 'desc',
			},
		});

		return res.json(payments);
	} catch (err) {
		console.error(err);

		return res.status(500).json({
			error: 'Failed to get payments',
		});
	}
};

export const getPaymentByBooking = async (req: Request, res: Response) => {
	try {
		const userId = Number(req.headers['x-user-id']);
		const bookingId = Number(req.params.bookingId);

		if (!userId) {
			return res.status(401).json({ error: 'Unauthorized' });
		}

		const payment = await prisma.payment.findFirst({
			where: {
				bookingId,
				userId,
			},
		});

		if (!payment) {
			return res.status(404).json({
				error: 'Payment not found',
			});
		}

		return res.json(payment);
	} catch (err) {
		console.error(err);

		return res.status(500).json({
			error: 'Failed to get payment',
		});
	}
};
