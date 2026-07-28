import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import { getInternalServiceToken } from "../utils/internalToken";

const userProxy = [
  express.json(),

  createProxyMiddleware({
    target: process.env.USER_SERVICE_URL,
    changeOrigin: true,

    proxyTimeout: 5000,
    timeout: 5000,

    on: {
      proxyReq: (proxyReq, req: any) => {
        proxyReq.setHeader("x-internal-token", getInternalServiceToken());
        console.log("➡️ USER PROXY:", req.method, req.originalUrl);
        console.log("REQ USER:", req.user);
        console.log("FINAL USER ID:", req.user);

        //
        // FORWARD USER ID
        //
        if (req.user?.userId) {
          proxyReq.setHeader("x-user-id", req.user.userId);
          console.log("FORWARDING USER ID:", req.user?.userId);
        }

        //
        // FORWARD BODY
        //
        if (req.body && Object.keys(req.body).length > 0) {
          const bodyData = JSON.stringify(req.body);
          proxyReq.setHeader("Content-Type", "application/json");
          proxyReq.setHeader("Content-Length", Buffer.byteLength(bodyData));
          proxyReq.write(bodyData);
        }
      },

      proxyRes: () => {
        console.log("✅ Response from user-service");
      },

      error: (err) => {
        console.error("❌ User Proxy Error:", err);
      },
    },
  }),
];

export default userProxy;
