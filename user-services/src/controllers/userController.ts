import { Request, Response } from "express";
import { prisma } from "../prisma";
import "dotenv/config";

// ✅ GET USER PROFILE
export const getUser = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    const user = await prisma.user.findUnique({
      where: {
        id,
      },
      include: {
        media: {
          select: {
            id: true,
            url: true,
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
      },
    });

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    const profilePhoto = user.media.at(0);

    return res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      birthDate: user.birthDate,
      gender: user.gender,
      createdAt: user.createdAt,

      profilePhoto: profilePhoto
        ? {
            mediaId: profilePhoto.id,
            url: profilePhoto.url,
          }
        : null,
    });
  } catch (err) {
    console.error("❌ REAL ERROR getUser:", err);

    return res.status(500).json({
      error: "Failed to fetch user",
      detail: err instanceof Error ? err.message : err,
    });
  }
};

// ✅ UPDATE USER
export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const user = await prisma.user.update({
      where: {
        id: Number(id),
      },
      data: {
        name,
      },
    });

    return res.json({
      message: "Updated",
      user,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      error: "Update failed",
    });
  }
};
