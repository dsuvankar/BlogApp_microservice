import express from "express";
import {
  getUserById,
  loginUser,
  myProfile,
  updateUser,
} from "../controller/user";
import { isAuth } from "../middleware/isAuth";

const router = express.Router();

router.post("/login", loginUser);
router.get("/me", isAuth, myProfile);
router.get("/user/:id", getUserById);
router.post("/user/update", isAuth, updateUser);

export default router;
