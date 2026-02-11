// src/middleware/errorLogger.middleware.ts
import { Request, Response, NextFunction } from "express";
import logger from "../utils/logger";

export const errorLogger = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  logger.error("Unhandled Error", {
    message: err.message,
    stack: err.stack,
    method: req.method,
    url: req.url,
  });

  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
};
