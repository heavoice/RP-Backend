import { Request, Response, NextFunction } from "express";
import axios from "axios";

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL!;

export const authMiddleware = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    // PUBLIC ROUTES
    const publicRoutes = ["/register"];

    const isPublic = publicRoutes.some((route) => req.path.startsWith(route));

    if (isPublic) return next();

    // CHECK TOKEN
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ error: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    console.log("TOKEN CHECK:", token);

    // VERIFY TOKEN VIA AUTH SERVICE
    const response = await axios.post(`${AUTH_SERVICE_URL}/verify`, { token });

    // SET USER IN REQUEST
    req.user = {
      userId: response.data.userId || response.data.data?.userId,
    };
    console.log("AUTH RESPONSE:", response.data);

    if (!req.user.userId) {
      return res.status(401).json({ error: "Invalid token payload" });
    }

    return next();
  } catch (err) {
    console.error("Auth middleware error:", err);

    return res.status(401).json({ error: "Unauthorized" });
  }
};
