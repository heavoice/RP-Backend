import { Request, Response } from "express";
import { prisma } from "../prisma";
import bcrypt from "bcrypt";

// ✅ REGISTER
export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    res.json({
      id: user.id,
      createdAt: user.createdAt,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Register failed" });
  }
};

// ✅ FIND BY EMAIL (dipakai Auth Service)
export const findByEmail = async (req: Request, res: Response) => {
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
      include: { preferences: true },
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

// ✅ GET PREFERENCES
export const getPreferences = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const pref = await prisma.preference.findUnique({
      where: { userId: Number(id) },
    });

    res.json(pref);
  } catch {
    res.status(500).json({ error: "Failed to fetch preferences" });
  }
};

// ✅ UPDATE PREFERENCES
export const updatePreferences = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { location, minPrice, maxPrice, bedrooms } = req.body;

    const pref = await prisma.preference.upsert({
      where: { userId: Number(id) },
      update: {
        location,
        minPrice,
        maxPrice,
        bedrooms,
      },
      create: {
        userId: Number(id),
        location,
        minPrice,
        maxPrice,
        bedrooms,
      },
    });

    res.json(pref);
  } catch {
    res.status(500).json({ error: "Failed to update preferences" });
  }
};

module.exports = {
  register,
  findByEmail,
  getUser,
  updateUser,
  getPreferences,
  updatePreferences,
};
