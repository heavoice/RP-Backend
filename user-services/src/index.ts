import express from "express";
import cors from "cors";
import "dotenv/config";
import userRoutes from "./routes/userRoutes";
import { internalMiddleware } from "./internalMiddleware";

const app = express();
const PORT = process.env.PORT;

app.use(cors());
app.use(express.json());
app.use(internalMiddleware);

app.use((req, res, next) => {
  console.log("👉 USER SERVICE HIT:", req.method, req.url);
  next();
});

// health check (biar gampang debug)
app.get("/", (req, res) => {
  res.send("User Service is running 🚀");
});

// 🔗 route utama
app.use("/", userRoutes);

export default app;
