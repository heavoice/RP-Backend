import express from "express";
import cors from "cors";
import "dotenv/config";
import houseRoutes from "./routes/houseRoutes";

const app = express();
const PORT = process.env.PORT;

app.use(cors());
app.use(express.json());

app.use("/houses", houseRoutes);

app.get("/", (req, res) => {
  res.send("House Service is running 🚀");
});

app.listen(PORT, () => {
  console.log(`House Service running on ${PORT}`);
});
