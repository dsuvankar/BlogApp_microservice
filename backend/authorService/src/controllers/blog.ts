import getBuffer from "../utils/dataURI.js";
import cloudinary from "cloudinary";
import { sql } from "../utils/db.js";
import { AuthenticatedRequest } from "../middleware/isAuth.js";
import { invalidateCachingJob } from "../utils/rabbitmq.js";

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

    await invalidateCachingJob(["blogs:*"]);

    res.json({
      message: "Blog Created",
      blog: result[0],
    });
  } catch (error) {
    console.error("Error creating blog:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateBlog = async (req: AuthenticatedRequest, res: any) => {
  try {
    const { id } = req.params;
    const { title, description, blogcontent, category } = req.body;

    const file = req.file;

    const blog = await sql`SELECT * FROM blogs WHERE id = ${id}`;

    if (!blog.length) {
      res.status(404).json({
        message: "No blog with this id",
      });
      return;
    }

    if (blog[0].author !== req.user?._id) {
      res.status(401).json({
        message: "You are not author of this blog",
      });
      return;
    }

    // helper to pull public_id from a Cloudinary URL
    const extractPublicId = (url: string) => {
      const clean = url.split("?")[0];
      const parts = clean.split("/");
      const filename = parts.pop() || "";
      const folderIdx = parts.lastIndexOf("blogs");
      const relevant = folderIdx !== -1 ? parts.slice(folderIdx) : parts;
      relevant.push(filename);
      const publicWithExt = relevant.join("/");
      return publicWithExt.replace(/\.[^/.]+$/, "");
    };

    let imageUrl = blog[0].image;

    if (file) {
      const fileBuffer = getBuffer(file);

      if (!fileBuffer || !fileBuffer.content) {
        res.status(400).json({
          message: "Failed to generate buffer",
        });
        return;
      }

      // upload new image before deleting old one
      const cloud = await cloudinary.v2.uploader.upload(fileBuffer.content, {
        folder: "blogs",
      });

      imageUrl = cloud.secure_url;

      // delete old image if present
      if (blog[0].image) {
        try {
          const oldPublicId = extractPublicId(blog[0].image);
          await cloudinary.v2.uploader.destroy(oldPublicId);
        } catch (delErr) {
          console.warn("Could not delete old image from Cloudinary:", delErr);
        }
      }
    }

    //Previous code

    /* const updatedBlog = await sql`UPDATE blogs SET
    title = ${title || blog[0].title},
    description = ${title || blog[0].description},
    image= ${imageUrl},
    blogcontent = ${title || blog[0].blogcontent},
    category = ${title || blog[0].category}

    WHERE id = ${id}
    RETURNING *
    `; */

    //updated code

    const updatedBlog = await sql`UPDATE blogs SET
    title = ${title || blog[0].title},
    description = ${description || blog[0].description},
    image= ${imageUrl},
    blogcontent = ${blogcontent || blog[0].blogcontent},
    category = ${category || blog[0].category}

    WHERE id = ${id}
    RETURNING *
    `;

    await invalidateCachingJob(["blogs:*", `blog:${id}`]);

    res.json({
      message: "Blog Updated",
      blog: updatedBlog[0],
    });
  } catch (error) {
    console.error("Error updating blog:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteBlog = async (req: AuthenticatedRequest, res: any) => {
  try {
    const blog = await sql`SELECT * FROM blogs WHERE id = ${req.params.id}`;

    // helper to pull public_id from a Cloudinary URL
    const extractPublicId = (url: string) => {
      const clean = url.split("?")[0];
      const parts = clean.split("/");
      const filename = parts.pop() || "";
      const folderIdx = parts.lastIndexOf("blogs");
      const relevant = folderIdx !== -1 ? parts.slice(folderIdx) : parts;
      relevant.push(filename);
      const publicWithExt = relevant.join("/");
      return publicWithExt.replace(/\.[^/.]+$/, "");
    };

    if (!blog.length) {
      res.status(404).json({
        message: "No blog found with this id",
      });
      return;
    }

    if (blog[0].author !== req.user?._id) {
      res.status(401).json({
        message: "You are not authorised to delete this blog",
      });
      return;
    }

    // remove the image from Cloudinary if present
    if (blog[0].image) {
      try {
        const oldPublicId = extractPublicId(blog[0].image);
        await cloudinary.v2.uploader.destroy(oldPublicId);
      } catch (delErr) {
        console.warn(
          "Failed to delete Cloudinary image for blog",
          req.params.id,
          delErr,
        );
      }
    }

    await sql`DELETE FROM savedblogs WHERE blogid = ${req.params.id}`;
    await sql`DELETE FROM comments WHERE blogid = ${req.params.id}`;
    await sql`DELETE FROM blogs WHERE id = ${req.params.id}`;

    await invalidateCachingJob(["blogs:*", `blog:${req.params.id}`]);

    res.json({
      message: "Blog Delete",
    });
  } catch (error) {
    console.error("Error deleting blog:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
