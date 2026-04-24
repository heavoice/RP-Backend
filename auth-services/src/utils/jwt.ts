import jwt from "jsonwebtoken";
import "dotenv/config";

const SECRET = process.env.JWT_SECRET!;

export const generateToken = (payload: any) => {
  return jwt.sign(payload, SECRET, { expiresIn: "1d" });
};

export const generateRefreshToken = (payload: any) => {
  return jwt.sign(payload, SECRET, { expiresIn: "1d" });
};

export const verifyToken = (token: string) => {
  return jwt.verify(token, SECRET);
};
