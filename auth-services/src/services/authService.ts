import axios from "axios";
import bcrypt from "bcrypt";
import { generateRefreshToken, generateToken } from "../utils/jwt";
import "dotenv/config";

const USER_SERVICE_URL = process.env.USER_SERVICE_URL!;

const getInternalHeaders = () => {
  const token = process.env.INTERNAL_SERVICE_TOKEN;

  if (!token) {
    throw new Error("INTERNAL_SERVICE_TOKEN must be configured");
  }

  return {
    "x-internal-token": token,
  };
};

export const loginService = async (email: string, password: string) => {
  try {
    const { data: user } = await axios.get(`${USER_SERVICE_URL}/findByEmail`, {
      params: { email },
      timeout: 5000,
      headers: getInternalHeaders(),
    });

    if (!user) {
      throw new Error("User not found");
    }

    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
      throw new Error("Invalid email or password");
    }

    const payload = {
      userId: user.id,
      role: user.role,
    };

    return {
      token: generateToken(payload),
      refreshToken: generateRefreshToken(payload),
      userId: user.id,
      role: user.role,
    };
  } catch (err: any) {
    throw new Error(err?.response?.data?.error || "Invalid email or password");
  }
};
