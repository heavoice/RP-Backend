import express from "express";
import cors from "cors";
import "dotenv/config";

import authProxy from "./proxies/authProxy";
import userProxy from "./proxies/userProxy";
import houseProxy from "./proxies/houseProxy";
import { authMiddleware } from "./middleware/authMiddleware";
import searchProxy from "./proxies/searchProxy";

const app = express();

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization", "x-user-id"],
  }),
);

app.use((req, res, next) => {
  console.log("GLOBAL REQ:", req.path);
  console.log("AUTH HEADER:", req.headers.authorization);
  next();
});

// health check
app.get("/", (req, res) => {
  res.send("Gateway is running 🚀");
});

// proxies
app.use("/auth", authProxy);
// 🔒 protected routes
app.use("/users", authMiddleware, userProxy);
// 🔒 protected routes
app.use("/houses", authMiddleware, houseProxy);
// 🔒 protected routes
app.use("/search", authMiddleware, searchProxy);

const port = process.env.PORT || 5000;

export default app;
