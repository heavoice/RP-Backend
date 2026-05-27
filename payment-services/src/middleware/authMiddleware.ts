import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const header = req.headers.authorization;

    if (!header) {
      return res.status(401).json({ error: "No token provided" });
    }

    const token = header.split(" ")[1];

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ error: "JWT_SECRET not set" });
    }

    const decoded = (jwt as any).verify(token, process.env.JWT_SECRET);

    const userId = decoded?.userId;

    if (!userId) {
      return res.status(401).json({ error: "Invalid token payload" });
    }

    req.headers["x-user-id"] = String(userId);

    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
};
