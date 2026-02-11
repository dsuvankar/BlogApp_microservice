import { Request, Response } from "express";
import User from "../model/User";
import jwt from "jsonwebtoken";
import { AuthenticatedRequest } from "../middleware/isAuth";

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, name, image } = req.body;

    if (!email || !name || !image) {
      return res.status(400).json({ message: "All fields are required" });
    }

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({ email, name, image });
    } else {
      return res
        .status(202)
        .json({ message: "User already exists", token: null });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || "secret",
      {
        expiresIn: "7d",
      },
    );
    return res.status(200).json({ user, token });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const myProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // ✅ Return user data
    return res.json({
      success: true,
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        image: user.image,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error" });
  }
};
