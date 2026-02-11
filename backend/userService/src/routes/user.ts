import express from "express";
import { loginUser, myProfile } from "../controller/user";
import { isAuth } from "../middleware/isAuth";

const router = express.Router();

router.post("/login", loginUser);
router.get("/me", isAuth, myProfile);

export default router;
