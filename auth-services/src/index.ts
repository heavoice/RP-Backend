import express from "express";
import authRoutes from "./routes/authRoutes";
import "dotenv/config";

const app = express();

app.use(express.json());

app.use("/", authRoutes);

app.get("/", (req, res) => {
  res.send("Auth Service is running 🚀");
});

export default app;
