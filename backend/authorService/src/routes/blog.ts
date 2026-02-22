import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { isAuth } from "../middleware/isAuth.js";
import uploadFile from "../middleware/multer.js";
import { createBlog, deleteBlog, updateBlog } from "../controllers/blog.js";

const router = express.Router();

router.post("/blog/new", isAuth, uploadFile, createBlog);
router.post("/blog/update/:id", isAuth, uploadFile, updateBlog);
router.post("/blog/delete/:id", isAuth, deleteBlog);

export default router;
