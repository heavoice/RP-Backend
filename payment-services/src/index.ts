import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import paymentRoutes from "./routes/paymentRoutes";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/payments", paymentRoutes);

app.get("/", (req, res) => {
  res.send("Payment Service is running 🚀");
});

export default app;
