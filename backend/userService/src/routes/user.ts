import express from "express";
import {
  getUserById,
  loginUser,
  myProfile,
  updateProfilePic,
  updateUser,
} from "../controller/user";
import { isAuth } from "../middleware/isAuth";
import uploadFile from "../middleware/multer";

const router = express.Router();

router.post("/login", loginUser);
router.get("/me", isAuth, myProfile);
router.get("/user/:id", getUserById);
router.post("/user/update", isAuth, updateUser);
router.post("/user/update/pic", isAuth, uploadFile, updateProfilePic);

export default router;
