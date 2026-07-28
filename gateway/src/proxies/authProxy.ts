import { createProxyMiddleware } from "http-proxy-middleware";
import { getInternalServiceToken } from "../utils/internalToken";

const authProxy = createProxyMiddleware({
  target: process.env.AUTH_SERVICE_URL,
  changeOrigin: true,

  pathRewrite: (path) => path.replace(/^\/auth/, ""),

  proxyTimeout: 5000,
  timeout: 5000,

  on: {
    proxyReq: (proxyReq, req: any) => {
      proxyReq.setHeader("x-internal-token", getInternalServiceToken());
      console.log("➡️ AUTH PROXY:", req.method, req.originalUrl);
    },

    proxyRes: () => {
      console.log("✅ Response from auth-service");
    },

    error: (err) => {
      console.error("❌ Auth Proxy Error:", err);
    },
  },
});

export default authProxy;
