import { Request, Response } from "express";
import { loginService } from "../services/authService";
import { verifyToken, generateToken } from "../utils/jwt";

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const result = await loginService(email, password);

    res.json(result);
  } catch (err: any) {
    res.status(401).json({ error: err.message });
  }
};

export const verify = (req: Request, res: Response) => {
  try {
    const { token } = req.body;

    const decoded = verifyToken(token);

    res.json({ valid: true, userId: (decoded as any).userId });
  } catch {
    res.status(401).json({ valid: false });
  }
};

export const refresh = (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    const decoded = verifyToken(refreshToken);

    const newToken = generateToken({ userId: (decoded as any).userId });

    res.json({ token: newToken });
  } catch {
    res.status(401).json({ error: "Invalid refresh token" });
  }
};
