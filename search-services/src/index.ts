import express from "express";
import cors from "cors";
import "dotenv/config";

import searchRoutes from "./routes/searchRoutes";
import { internalMiddleware } from "./internalMiddleware";

const app = express();

const PORT = process.env.PORT;

app.use(cors());
app.use(express.json());
app.use(internalMiddleware);

app.use("/search", searchRoutes);

app.get("/", (req, res) => {
  res.send("Search Service is running 🚀");
});

app.listen(PORT, () => {
  console.log(`Search Service running on ${PORT}`);
});

export default app;
