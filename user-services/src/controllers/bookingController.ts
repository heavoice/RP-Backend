import { Request, Response } from "express";
import { prisma } from "../prisma";
import axios from "axios";
import "dotenv/config";

const HOUSE_SERVICE_URL = process.env.HOUSE_SERVICE_URL!;

// ✅ CREATE BOOKING
export const createBooking = async (req: Request, res: Response) => {
  try {
    await prisma.booking.updateMany({
      where: {
        status: "PENDING",
        expiresAt: {
          lt: new Date(),
        },
      },
      data: {
        status: "EXPIRED",
      },
    });
    const userId = Number(req.headers["x-user-id"]);
    const houseId = Number(req.body.houseId);
    const notes = req.body.notes;

    if (!houseId) {
      return res.status(400).json({
        error: "houseId is required",
      });
    }

    // cek house exists (MS call)
    const houseRes = await axios.get(`${HOUSE_SERVICE_URL}/houses/${houseId}`);

    const house = houseRes.data;

    // cek booking aktif
    const existing = await prisma.booking.findFirst({
      where: {
        houseId,
        OR: [
          {
            status: "CONFIRMED",
          },
          {
            status: "PENDING",
            expiresAt: {
              gt: new Date(),
            },
          },
        ],
      },
    });

    if (existing) {
      return res.status(400).json({
        error: "House already booked",
      });
    }

    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

    const booking = await prisma.booking.create({
      data: {
        userId,
        houseId,
        bookingDate: new Date(),
        expiresAt,
        notes: notes || null,
      },
      include: {
        house: true,
      },
    });

    return res.json(booking);
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      error: "Failed to create booking",
    });
  }
};

export const getAllBookings = async (req: Request, res: Response) => {
  try {
    // Update booking yang sudah expired
    await prisma.booking.updateMany({
      where: {
        status: "PENDING",
        expiresAt: {
          lt: new Date(),
        },
      },
      data: {
        status: "EXPIRED",
      },
    });

    const bookings = await prisma.booking.findMany({
      where: {
        status: {
          in: ["PENDING", "CONFIRMED"],
        },
      },
      include: {
        house: true,
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.json(bookings);
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      error: "Failed to fetch bookings",
    });
  }
};

// ✅ GET USER BOOKINGS
export const getMyBookings = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.headers["x-user-id"]);

    // Ubah booking yang sudah melewati batas waktu menjadi EXPIRED
    await prisma.booking.updateMany({
      where: {
        status: "PENDING",
        expiresAt: {
          lt: new Date(),
        },
      },
      data: {
        status: "EXPIRED",
      },
    });

    const bookings = await prisma.booking.findMany({
      where: {
        userId,
      },
      include: {
        house: true,
        user: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.json(bookings);
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      error: "Failed to get bookings",
    });
  }
};

// ✅ CONFIRM BOOKING
export const confirmBooking = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { paidAt } = req.body;

    const existingBooking = await prisma.booking.findUnique({
      where: { id },
    });

    if (!existingBooking) {
      return res.status(404).json({
        error: "Booking not found",
      });
    }

    // Hanya booking PENDING yang boleh dikonfirmasi
    if (existingBooking.status !== "PENDING") {
      return res.status(400).json({
        error: `Cannot confirm booking with status ${existingBooking.status}`,
      });
    }

    // Booking harus masih pending
    if (existingBooking.status !== "PENDING") {
      return res.status(400).json({
        error: `Cannot confirm booking with status ${existingBooking.status}`,
      });
    }

    // Booking tidak boleh sudah expired
    if (existingBooking.expiresAt <= new Date()) {
      await prisma.booking.update({
        where: {
          id,
        },
        data: {
          status: "EXPIRED",
        },
      });

      return res.status(400).json({
        error: "Booking has expired",
      });
    }

    const booking = await prisma.booking.update({
      where: { id },
      data: {
        status: "CONFIRMED",
        paidAt,
      },
    });

    return res.json(booking);
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      error: "Failed to confirm booking",
    });
  }
};

// ✅ CANCEL BOOKING
export const cancelBooking = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const userId = Number(req.headers["x-user-id"]);

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        payments: true,
      },
    });

    if (!booking) {
      return res.status(404).json({
        error: "Booking not found",
      });
    }

    // Pastikan hanya pemilik booking yang bisa membatalkan
    if (booking.userId !== userId) {
      return res.status(403).json({
        error: "Unauthorized",
      });
    }

    // Tidak bisa membatalkan booking yang sudah dibatalkan
    if (booking.status === "CANCELLED") {
      return res.status(400).json({
        error: "Booking already cancelled",
      });
    }

    // Tidak bisa membatalkan booking yang sudah expired
    if (booking.status === "EXPIRED") {
      return res.status(400).json({
        error: "Booking already expired",
      });
    }

    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: {
        status: "CANCELLED",
      },
    });

    return res.json(updatedBooking);
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      error: "Failed to cancel booking",
    });
  }
};

export const getBookingById = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    // Update booking yang sudah expired
    await prisma.booking.updateMany({
      where: {
        status: "PENDING",
        expiresAt: {
          lt: new Date(),
        },
      },
      data: {
        status: "EXPIRED",
      },
    });

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        house: true,
      },
    });

    if (!booking) {
      return res.status(404).json({
        error: "Booking not found",
      });
    }

    return res.json(booking);
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      error: "Failed to get booking",
    });
  }
};
