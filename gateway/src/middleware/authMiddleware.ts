import { Request, Response, NextFunction } from "express";
import axios from "axios";

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL!;

export const authMiddleware = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    // ✅ PUBLIC ROUTES
    const publicRoutes = ["/register", "/login"];

    const isPublic = publicRoutes.some((route) => req.path.startsWith(route));

    if (isPublic) {
      return next();
    }

    // ✅ CHECK AUTH HEADER
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        error: "No token provided",
      });
    }

    // ✅ EXTRACT TOKEN
    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        error: "Invalid authorization format",
      });
    }

    console.log("🔐 TOKEN CHECK:", token);

    // ✅ VERIFY TOKEN VIA AUTH SERVICE
    const response = await axios.post(`${AUTH_SERVICE_URL}/verify`, {
      token,
    });

    console.log("✅ AUTH RESPONSE:", response.data);

    // ✅ EXTRACT USER ID
    const userId = response.data.userId || response.data.data?.userId;

    if (!userId) {
      return res.status(401).json({
        error: "Invalid token payload",
      });
    }

    // ✅ SAVE USER CONTEXT
    req.user = {
      userId,
    };

    // 🔥 VERY IMPORTANT PROPAGATE IDENTITY TO DOWNSTREAM SERVICES
    req.headers["x-user-id"] = String(userId);

    return next();
  } catch (err: any) {
    console.error(
      "❌ Auth middleware error:",
      err?.response?.data || err.message,
    );

    return res.status(401).json({
      error: "Unauthorized",
    });
  }
};
