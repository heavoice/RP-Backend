import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import cors from "cors";
import "dotenv/config";

const app = express();
app.use(cors());
app.use(express.json());
const port = process.env.PORT;

// HEALTH CHECK
app.get("/", (req, res) => {
  res.send("Gateway is running 🚀");
});

app.use(
  "/auth",
  createProxyMiddleware({
    target: process.env.AUTH_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { "^/auth": "" },
  }),
);

app.use(
  "/users",
  createProxyMiddleware({
    target: process.env.USER_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: (path, req) => {
      return "/users" + path; // 🔥 manually add it back
    },
  }),
);

app.listen(port, () => {
  console.log(`🚀 Gateway running on http://localhost:${port}`);
});
