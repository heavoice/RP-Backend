import { Request, Response, NextFunction } from "express";
import axios from "axios";

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL!;

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ error: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    const response = await axios.post(`${AUTH_SERVICE_URL}/auth/verify`, {
      token,
    });

    (req as any).userId = response.data.userId;

    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
};
