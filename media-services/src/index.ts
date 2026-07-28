import express from "express";
import cors from "cors";
import "dotenv/config";
import mediaRoutes from "./routes/mediaRoutes";
import { internalMiddleware } from "./middlewares/internalMiddleware";

const app = express();
const PORT = process.env.PORT || 5006;

app.use(cors());
app.use(express.json());
app.use(internalMiddleware);

// 🔗 route utama
app.use("/", mediaRoutes);

// health check
app.get("/", (req, res) => {
  res.send("Media Service is running 🚀");
});

app.listen(PORT, () => {
  console.log(`Media Service running on ${PORT}`);
});

app.use((req, res, next) => {
  console.log("👉 MEDIA SERVICE HIT:", req.method, req.url);
  next();
});

export default app;
