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

export const getUserById = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      res.status(404).json({
        message: "No user with this id",
      });
      return;
    }

    res.json(user);
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateUser = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, instagram, facebook, linkedin, bio } = req.body;
    console.log("Update User Request Body:", req.body);

    const user = await User.findByIdAndUpdate(
      req.user?._id,
      {
        name,
        instagram,
        facebook,
        linkedin,
        bio,
      },
      { new: true },
    );

    const token = jwt.sign({ user }, process.env.JWT_SECRET as string, {
      expiresIn: "5d",
    });

    res.json({
      message: "User Updated",
      token,
      user,
    });
  } catch (error) {
    console.log("Error updating user:", error);
    res.status(500).json({ message: "Server error" });
  }
};
