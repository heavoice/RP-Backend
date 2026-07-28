import { timingSafeEqual } from "crypto";
import { Request, Response, NextFunction } from "express";

export const internalMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const expectedToken = process.env.INTERNAL_SERVICE_TOKEN;
  const providedToken = req.get("x-internal-token");

  if (
    !expectedToken ||
    !providedToken ||
    expectedToken.length !== providedToken.length ||
    !timingSafeEqual(Buffer.from(expectedToken), Buffer.from(providedToken))
  ) {
    return res.status(401).json({ error: "Unauthorized service request" });
  }

  next();
};
