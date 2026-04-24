import express from "express";
import cors from "cors";
import "dotenv/config";
import userRoutes from "./routes/userRoutes";

const app = express();
const PORT = process.env.PORT;

app.use(cors());
app.use(express.json());

// 🔗 route utama
app.use("/users", userRoutes);

// health check (biar gampang debug)
app.get("/", (req, res) => {
  res.send("User Service is running 🚀");
});

app.use((req, res, next) => {
  console.log("👉 USER SERVICE HIT:", req.method, req.url);
  next();
});

app.listen(PORT, () => {
  console.log(`User Service running on ${PORT}`);
});
