import { Request, Response, NextFunction } from "express";
import logger from "../utils/logger";

export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const start = Date.now();

  logger.info("Incoming Request", {
    method: req.method,
    url: req.url,
    ip: req.ip,
  });

  res.on("finish", () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
    };

    if (res.statusCode >= 400) {
      logger.error("Request Failed", logData);
    } else {
      logger.success("Request Success", logData);
    }
  });

  next();
};
