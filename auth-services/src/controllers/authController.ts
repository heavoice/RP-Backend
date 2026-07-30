import { Request, Response } from "express";
import { loginService } from "../services/authService";
import { verifyToken, generateToken } from "../utils/jwt";

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const result = await loginService(email, password);

    return res.json(result);
  } catch (err: any) {
    return res.status(401).json({
      error: err.message,
    });
  }
};

export const verify = (req: Request, res: Response) => {
  try {
    const { token } = req.body;

    const decoded = verifyToken(token) as any;

    return res.json({
      valid: true,
      userId: decoded.userId,
      role: decoded.role,
    });
  } catch {
    return res.status(401).json({
      valid: false,
    });
  }
};

export const refresh = (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    const decoded = verifyToken(refreshToken) as any;

    const newToken = generateToken({
      userId: decoded.userId,
      role: decoded.role,
    });

    return res.json({
      token: newToken,
    });
  } catch {
    return res.status(401).json({
      error: "Invalid refresh token",
    });
  }
};
