import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";

const paymentProxy = [
  express.json(),

  createProxyMiddleware({
    target: process.env.PAYMENT_SERVICE_URL,
    changeOrigin: true,

    pathRewrite: (path) => {
      return "/payments" + path;
    },

    proxyTimeout: 5000,
    timeout: 5000,

    on: {
      proxyReq: (proxyReq, req: any) => {
        console.log("🏠 payment PROXY:", req.method, req.originalUrl);

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
        console.log("✅ Response from payment-service");
      },

      error: (err) => {
        console.error("❌ payment Proxy Error:", err);
      },
    },
  }),
];

export default paymentProxy;
