import { Request, Response } from "express";
import { prisma } from "../prisma";
import { Gender } from "@prisma/client";
import axios from "axios";
import bcrypt from "bcrypt";
import "dotenv/config";

// helper mapping gender
const mapGender = (value?: string): Gender | null => {
  if (value === "lk") return Gender.MALE;
  if (value === "pr") return Gender.FEMALE;
  return null;
};

const HOUSE_SERVICE_URL = process.env.HOUSE_SERVICE_URL!;

// ✅ REGISTER
export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, phone, birthDate, gender } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone,
        birthDate: birthDate ? new Date(birthDate) : null,
        gender: mapGender(gender) ?? null,
      },
    });

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      birthDate: user.birthDate,
      gender: user.gender,
      createdAt: user.createdAt,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Register failed" });
  }
};

// ✅ FIND BY EMAIL (dipakai Auth Service)
export const findByEmail = async (req: Request, res: Response) => {
  console.log("🔥 USER SERVICE HIT FIND BY EMAIL");
  try {
    const { email } = req.query;

    const user = await prisma.user.findUnique({
      where: { email: email as string },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch {
    res.status(500).json({ error: "Failed to fetch user" });
  }
};

// ✅ GET USER PROFILE
export const getUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: Number(id) },
    });

    res.json(user);
  } catch {
    res.status(500).json({ error: "Failed to fetch user" });
  }
};

// ✅ UPDATE USER
export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const user = await prisma.user.update({
      where: { id: Number(id) },
      data: { name },
    });

    res.json({ message: "Updated", user });
  } catch {
    res.status(500).json({ error: "Update failed" });
  }
};

export const addFavoriteHouse = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.headers["x-user-id"]);

    let houseIds: number[] = [];

    // SUPPORT SINGLE
    if (req.body.houseId) {
      houseIds = [Number(req.body.houseId)];
    }

    // SUPPORT MULTIPLE
    if (req.body.houseIds) {
      houseIds = req.body.houseIds.map((id: any) => Number(id));
    }

    if (houseIds.length === 0) {
      return res.status(400).json({
        error: "houseId or houseIds is required",
      });
    }

    const results = [];

    for (const houseId of houseIds) {
      // cek sudah favorite atau belum
      const existing = await prisma.favoriteHouse.findUnique({
        where: {
          userId_houseId: {
            userId,
            houseId,
          },
        },
      });

      if (existing) {
        continue;
      }

      // validasi house exists
      await axios.get(`${HOUSE_SERVICE_URL}/houses/${houseId}`);

      // create favorite
      const favorite = await prisma.favoriteHouse.create({
        data: {
          userId,
          houseId,
        },
        include: {
          house: true,
        },
      });

      results.push(favorite);
    }

    return res.json(results);
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      error: "Failed to add favorite",
    });
  }
};

// ✅ GET FAVORITE HOUSE FROM USER
export const getFavoriteHouses = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.params.id);

    const favorites = await prisma.favoriteHouse.findMany({
      where: {
        userId,
      },
      include: {
        house: true,
      },
    });

    return res.json(favorites);
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      error: "Failed to get favorites",
    });
  }
};

// ✅ REMOVE FAVORITE HOUSE FROM USER
export const removeFavoriteHouse = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.params.userId);
    const houseId = Number(req.params.houseId);

    const deleted = await prisma.favoriteHouse.deleteMany({
      where: {
        userId,
        houseId,
      },
    });

    if (deleted.count === 0) {
      return res.status(404).json({
        error: "Favorite not found",
      });
    }

    res.json({
      deleted: true,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Failed to delete favorite",
    });
  }
};

// ✅ CREATE BOOKING
export const createBooking = async (req: Request, res: Response) => {
  try {
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
        status: {
          in: ["PENDING", "CONFIRMED"],
        },
      },
    });

    if (existing) {
      return res.status(400).json({
        error: "House already booked",
      });
    }

    const booking = await prisma.booking.create({
      data: {
        userId,
        houseId,
        bookingDate: new Date(),
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

// ✅ GET USER BOOKINGS
export const getBookings = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.params.userId);

    const bookings = await prisma.booking.findMany({
      where: {
        userId,
      },
      include: {
        house: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.json(bookings);
  } catch (err: any) {
    console.error("🔥 CREATE BOOKING ERROR:");
    console.error(err?.response?.data || err);

    return res.status(500).json({
      error: "Failed to create booking",
      detail: err?.response?.data || err?.message,
    });
  }
};

// ✅ CONFIRM BOOKING (called from Payment Service after payment success)
export const confirmBooking = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    const booking = await prisma.booking.update({
      where: { id },
      data: {
        status: "CONFIRMED",
      },
    });

    return res.json(booking);
  } catch (err) {
    return res.status(500).json({ error: "Failed to confirm booking" });
  }
};
