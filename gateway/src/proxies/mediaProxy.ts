import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import { getInternalServiceToken } from "../utils/internalToken";

const mediaProxy = [
  express.json(),

  createProxyMiddleware({
    target: process.env.MEDIA_SERVICE_URL,
    changeOrigin: true,

    pathRewrite: (path) => path.replace(/^\/media/, ""),

    proxyTimeout: 5000,
    timeout: 5000,

    on: {
      proxyReq: (proxyReq, req: any) => {
        proxyReq.setHeader("x-internal-token", getInternalServiceToken());

        if (req.user?.userId) {
          proxyReq.setHeader("x-user-id", String(req.user.userId));
        }

        if (req.user?.role) {
          proxyReq.setHeader("x-user-role", req.user.role);
        }

        // ❌ JANGAN write body di media proxy
      },
    },
  }),
];

export default mediaProxy;
