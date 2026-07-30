import { Request, Response, NextFunction } from "express";
import axios from "axios";
import { getInternalServiceToken } from "../utils/internalToken";

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL!;

export const authMiddleware = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    // Public routes
    const publicRoutes = ["/register", "/login"];

    if (publicRoutes.some((route) => req.path.startsWith(route))) {
      return next();
    }

    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        error: "No token provided",
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        error: "Invalid authorization format",
      });
    }

    // Verify JWT ke Auth Service
    const { data } = await axios.post(
      `${AUTH_SERVICE_URL}/verify`,
      { token },
      {
        headers: {
          "x-internal-token": getInternalServiceToken(),
        },
      },
    );

    if (!data.valid) {
      return res.status(401).json({
        error: "Invalid token",
      });
    }

    if (!data.userId || !data.role) {
      return res.status(401).json({
        error: "Invalid token payload",
      });
    }

    // Simpan user context
    req.user = {
      userId: data.userId,
      role: data.role,
    };

    // Forward identity ke service lain
    req.headers["x-user-id"] = String(data.userId);
    req.headers["x-user-role"] = data.role;

    return next();
  } catch {
    return res.status(401).json({
      error: "Unauthorized",
    });
  }
};
