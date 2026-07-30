import express from "express";
import cors from "cors";
import "dotenv/config";

import authProxy from "./proxies/authProxy";
import userProxy from "./proxies/userProxy";
import houseProxy from "./proxies/houseProxy";
import { authMiddleware } from "./middleware/authMiddleware";
import searchProxy from "./proxies/searchProxy";
import paymentProxy from "./proxies/paymentProxy";
import mediaProxy from "./proxies/mediaProxy";
import { getInternalServiceToken } from "./utils/internalToken";
import { requireDeveloper } from "./middleware/roleMiddleware";

const app = express();

// Gateway is the only public entry point. Fail closed if it cannot prove its
// identity to downstream services.
getInternalServiceToken();

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
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
// 🔒 protected routes
app.use("/payments", authMiddleware, paymentProxy);
// 🔒 protected routes
app.post("/media/houses/upload", authMiddleware, requireDeveloper, mediaProxy);
app.use("/media", authMiddleware, mediaProxy);

const port = process.env.PORT || 5000;

export default app;
