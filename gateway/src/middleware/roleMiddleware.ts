import { NextFunction, Response } from "express";

export const requireDeveloper = (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  if (req.user?.role !== "DEVELOPER") {
    return res.status(403).json({
      error: "Developer access required",
    });
  }

  next();
};
