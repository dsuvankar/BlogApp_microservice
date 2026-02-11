import express from "express";
import { loginUser } from "../controller/user";

const router = express.Router();

router.post("/login", loginUser);

export default router;
