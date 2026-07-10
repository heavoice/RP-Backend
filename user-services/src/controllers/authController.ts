import { Request, Response } from "express";
import { prisma } from "../prisma";
import { Gender } from "@prisma/client";
import bcrypt from "bcrypt";
import "dotenv/config";

// helper mapping gender
const mapGender = (value?: string): Gender | null => {
  if (value === "lk") return Gender.MALE;
  if (value === "pr") return Gender.FEMALE;
  return null;
};

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

    return res.json(user);
  } catch (err) {
    console.error("❌ REAL ERROR findByEmail:", err);

    return res.status(500).json({
      error: "Failed to fetch user",
      detail: err instanceof Error ? err.message : err,
    });
  }
};