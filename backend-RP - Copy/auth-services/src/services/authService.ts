import axios from "axios";
import bcrypt from "bcrypt";
import { generateToken, generateRefreshToken } from "../utils/jwt";
import "dotenv/config";

const USER_SERVICE_URL = process.env.USER_SERVICE_URL!;
console.log("USER_SERVICE_URL:", USER_SERVICE_URL);

export const loginService = async (email: string, password: string) => {
  // 🔥 ambil user dari user-service
  const res = await axios.get(
    `${USER_SERVICE_URL}/users/findByEmail?email=${email}`,
  );

  const user = res.data;

  const isValid = await bcrypt.compare(password, user.password);

  if (!isValid) throw new Error("Invalid password");

  const token = generateToken({ userId: user.id });
  const refreshToken = generateRefreshToken({ userId: user.id });

  return {
    token,
    refreshToken,
    userId: user.id,
  };
};
