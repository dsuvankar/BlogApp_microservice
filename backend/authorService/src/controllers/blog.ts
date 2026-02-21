import getBuffer from "../utils/dataURI.js";
import cloudinary from "cloudinary";
import { sql } from "../utils/db.js";

export const createBlog = async (req: any, res: any) => {
  try {
    const { title, description, blogcontent, category } = req.body;

    const file = req.file;

    if (!file) {
      res.status(400).json({
        message: "No file to upload",
      });
      return;
    }

    const fileBuffer = getBuffer(file);

    if (!fileBuffer || !fileBuffer.content) {
      res.status(400).json({
        message: "Failed to generate buffer",
      });
      return;
    }

    const cloud = await cloudinary.v2.uploader.upload(fileBuffer.content, {
      folder: "blogs",
    });

    const result =
      await sql`INSERT INTO blogs (title, description, image, blogcontent,category, author) VALUES (${title}, ${description},${cloud.secure_url},${blogcontent},${category},${req.user?._id}) RETURNING *`;

    //   await invalidateChacheJob(["blogs:*"]);

    res.json({
      message: "Blog Created",
      blog: result[0],
    });
  } catch (error) {
    console.error("Error creating blog:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
