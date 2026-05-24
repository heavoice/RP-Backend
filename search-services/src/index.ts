import express from "express";
import cors from "cors";
import "dotenv/config";

import searchRoutes from "./routes/searchRoutes";

const app = express();

const PORT = process.env.PORT;

app.use(cors());
app.use(express.json());

app.use("/search", searchRoutes);

app.get("/", (req, res) => {
  res.send("Search Service is running 🚀");
});

app.listen(PORT, () => {
  console.log(`Search Service running on ${PORT}`);
});

export default app;
