import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";

const searchProxy = [
  express.json(),

  createProxyMiddleware({
    target: process.env.SEARCH_SERVICE_URL,
    changeOrigin: true,

    pathRewrite: (path) => {
      return "/search" + path;
    },

    proxyTimeout: 5000,
    timeout: 5000,

    on: {
      proxyReq: (proxyReq, req: any) => {
        console.log("🏠 SEARCH PROXY:", req.method, req.originalUrl);

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
        console.log("✅ Response from search-service");
      },

      error: (err) => {
        console.error("❌ Search Proxy Error:", err);
      },
    },
  }),
];

export default searchProxy;
