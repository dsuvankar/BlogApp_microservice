// src/middleware/isAuth.ts
import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import User, { IUser } from "../model/User";

export interface AuthenticatedRequest extends Request {
  user?: IUser | null;
}

export const isAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({
        message: "Please Login - No auth header",
      });
      return;
    }

    const token = authHeader.split(" ")[1];

    const decodeValue = jwt.verify(
      token,
      process.env.JWT_SECRET as string,
    ) as JwtPayload;

    // ✅ Check for 'userId' instead of 'user'
    if (!decodeValue || !decodeValue.userId) {
      res.status(401).json({
        message: "Invalid token",
      });
      return;
    }

    console.log("Decoded JWT payload: ", decodeValue);

    // ✅ Fetch the actual user from database using userId
    const user = await User.findById(decodeValue.userId);

    if (!user) {
      res.status(401).json({
        message: "User not found",
      });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    console.log("JWT verification error: ", error);
    res.status(401).json({
      message: "Please Login - JWT error",
    });
  }
};
