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
    const id = Number(req.params.id);
    const authenticatedUserId = Number(req.headers["x-user-id"]);

    if (!authenticatedUserId) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }

    // User hanya boleh mengubah profil miliknya sendiri
    if (authenticatedUserId !== id) {
      return res.status(403).json({
        error: "Forbidden",
      });
    }

    const { name, phone, birthDate, gender } = req.body;

    const user = await prisma.user.update({
      where: {
        id,
      },
      data: {
        ...(name !== undefined && { name }),
        ...(phone !== undefined && { phone }),
        ...(birthDate !== undefined && {
          birthDate: birthDate ? new Date(birthDate) : null,
        }),
        ...(gender !== undefined && { gender }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        birthDate: true,
        gender: true,
        createdAt: true,
      },
    });

    return res.json({
      message: "User updated successfully",
      user,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      error: "Failed to update user",
    });
  }
};
