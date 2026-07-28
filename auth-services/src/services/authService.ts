import axios from "axios";
import bcrypt from "bcrypt";
import { generateToken, generateRefreshToken } from "../utils/jwt";
import "dotenv/config";

const USER_SERVICE_URL = process.env.USER_SERVICE_URL!; // 🔥 HARDCODE DULU BUAT DEBUG

const getInternalHeaders = () => {
  const token = process.env.INTERNAL_SERVICE_TOKEN;

  if (!token) throw new Error("INTERNAL_SERVICE_TOKEN must be configured");

  return { "x-internal-token": token };
};
console.log("USER_SERVICE_URL:", USER_SERVICE_URL);

export const loginService = async (email: string, password: string) => {
  try {
    console.log("🔥 LOGIN SERVICE HIT");
    console.log("EMAIL:", email);

    console.log("➡️ CALL USER SERVICE");

    const res = await axios.get(`${USER_SERVICE_URL}/findByEmail`, {
      params: { email }, // 🔥 JANGAN pakai query string manual
      timeout: 5000, // 🔥 WAJIB biar ga hang
      headers: getInternalHeaders(),
    });

    console.log("✅ USER SERVICE RESPONSE RECEIVED");

    const user = res.data;

    if (!user) {
      throw new Error("User not found");
    }

    console.log("➡️ CHECK PASSWORD");

    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) throw new Error("Invalid password");

    console.log("✅ PASSWORD VALID");

    const token = generateToken({ userId: user.id });
    const refreshToken = generateRefreshToken({ userId: user.id });

    console.log("✅ TOKEN GENERATED");

    return {
      token,
      refreshToken,
      userId: user.id,
    };
  } catch (err: any) {
    console.error("❌ LOGIN SERVICE ERROR:", err.message);
    throw err;
  }
};
