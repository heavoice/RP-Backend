import express from "express";
import authRoutes from "./routes/authRoutes";
import "dotenv/config";

const app = express();

app.use(express.json());

app.use("/auth", authRoutes);

app.listen(5001, () => {
  console.log("Auth Service running on 5001");
});
