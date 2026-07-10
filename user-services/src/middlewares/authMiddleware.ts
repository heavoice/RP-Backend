import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

export const authMiddleware = (req: Request, res: Response, next: any) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "No token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!);

    req.headers["x-user-id"] = String((decoded as any).userId);

    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
};
