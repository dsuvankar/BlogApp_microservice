import express from "express";
import { getAllBlogs } from "../controller/blog.js";

const router = express.Router();

router.get("/blogs/all", getAllBlogs);

export default router;
