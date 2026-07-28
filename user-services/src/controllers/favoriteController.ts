import { Request, Response } from "express";
import { prisma } from "../prisma";
import axios from "axios";
import "dotenv/config";

const HOUSE_SERVICE_URL = process.env.HOUSE_SERVICE_URL!;

const getInternalHeaders = () => {
  const token = process.env.INTERNAL_SERVICE_TOKEN;

  if (!token) throw new Error("INTERNAL_SERVICE_TOKEN must be configured");

  return { "x-internal-token": token };
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
      await axios.get(`${HOUSE_SERVICE_URL}/houses/${houseId}`, {
        headers: getInternalHeaders(),
      });

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

    // Ambil booking aktif
    const bookings = await prisma.booking.findMany({
      where: {
        status: {
          in: ["PENDING", "CONFIRMED"],
        },
      },
      select: {
        houseId: true,
        user: {
          select: {
            name: true,
          },
        },
      },
    });

    const result = favorites.map((favorite) => {
      const booking = bookings.find((b) => b.houseId === favorite.house.id);

      return {
        ...favorite,
        name: booking?.user.name ?? null,
      };
    });

    return res.json(result);
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
