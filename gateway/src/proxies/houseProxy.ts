import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import { getInternalServiceToken } from "../utils/internalToken";

const houseProxy = [
  express.json(),

  createProxyMiddleware({
    target: process.env.HOUSE_SERVICE_URL,
    changeOrigin: true,

    pathRewrite: (path) => {
      return "/houses" + path;
    },

    proxyTimeout: 5000,
    timeout: 5000,

    on: {
      proxyReq: (proxyReq, req: any) => {
        proxyReq.setHeader("x-internal-token", getInternalServiceToken());
        console.log("🏠 HOUSE PROXY:", req.method, req.originalUrl);

        // FORWARD USER ID
        if (req.user?.userId) {
          proxyReq.setHeader("x-user-id", req.user.userId);
        }

        // FORWARD BODY
        if (req.body && Object.keys(req.body).length > 0) {
          const bodyData = JSON.stringify(req.body);
          proxyReq.setHeader("Content-Type", "application/json");
          proxyReq.setHeader("Content-Length", Buffer.byteLength(bodyData));
          proxyReq.write(bodyData);
          proxyReq.end();
        }
      },

      proxyRes: () => {
        console.log("✅ Response from house-service");
      },

      error: (err) => {
        console.error("❌ House Proxy Error:", err);
      },
    },
  }),
];

export default houseProxy;
