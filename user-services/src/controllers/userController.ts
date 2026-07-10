import { Request, Response } from "express";
import { prisma } from "../prisma";
import "dotenv/config";

// ✅ GET USER PROFILE
export const getUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: Number(id) },
    });

    return res.json(user);
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
      where: { id: Number(id) },
      data: { name },
    });

    res.json({ message: "Updated", user });
  } catch {
    res.status(500).json({ error: "Update failed" });
  }
};