import express from "express";
import authRoutes from "./routes/authRoutes";
import "dotenv/config";
import { internalMiddleware } from "./internalMiddleware";

const app = express();

app.use(express.json());

app.use(internalMiddleware);
app.use("/", authRoutes);

app.get("/", (req, res) => {
  res.send("Auth Service is running 🚀");
});

export default app;
