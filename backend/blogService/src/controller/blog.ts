import axios from "axios";
import { sql } from "../utils/db.js";
import { redisClient } from "../server.js";

export const getAllBlogs = async (req: any, res: any) => {
  try {
    const { searchQuery = "", category = "" } = req.query;

    const cacheKey = `blogs:${searchQuery}:${category}`;

    const cached = await redisClient.get(cacheKey);

    if (cached) {
      console.log("Serving from Redis cache");
      res.json(JSON.parse(cached));
      return;
    }
    let blogs;

    if (searchQuery && category) {
      blogs = await sql`
        SELECT *, 
          GREATEST(similarity(title, ${searchQuery}), similarity(description, ${searchQuery})) AS score
        FROM blogs 
        WHERE 
          (
            similarity(title, ${searchQuery}) > 0.1 
            OR similarity(description, ${searchQuery}) > 0.1
            OR title ILIKE ${"%" + searchQuery + "%"}
            OR description ILIKE ${"%" + searchQuery + "%"}
          )
          AND category = ${category}
        ORDER BY score DESC, created_at DESC
      `;
    } else if (searchQuery) {
      blogs = await sql`
        SELECT *, 
          GREATEST(similarity(title, ${searchQuery}), similarity(description, ${searchQuery})) AS score
        FROM blogs 
        WHERE 
          similarity(title, ${searchQuery}) > 0.1 
          OR similarity(description, ${searchQuery}) > 0.1
          OR title ILIKE ${"%" + searchQuery + "%"}
          OR description ILIKE ${"%" + searchQuery + "%"}
        ORDER BY score DESC, created_at DESC
      `;
    } else if (category) {
      blogs = await sql`
        SELECT * FROM blogs 
        WHERE category = ${category} 
        ORDER BY created_at DESC
      `;
    } else {
      blogs = await sql`SELECT * FROM blogs ORDER BY created_at DESC`;
    }

    console.log("Serving from db");

    await redisClient.set(cacheKey, JSON.stringify(blogs), { EX: 3600 });

    res.status(200).json(blogs);
  } catch (error) {
    console.error("Error fetching blogs:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getSingleBlog = async (req: any, res: any) => {
  try {
    const blogid = req.params.id;

    const cacheKey = `blog:${blogid}`;

    const cached = await redisClient.get(cacheKey);

    if (cached) {
      console.log("Serving single blog from Redis cache");
      res.status(200).json(JSON.parse(cached));
      return;
    }

    const blog = await sql`SELECT * FROM blogs WHERE id = ${blogid}`;

    if (blog.length === 0) {
      res.status(404).json({
        message: "no blog with this id",
      });
      return;
    }

    const { data } = await axios.get(
      `${process.env.USER_SERVICE_URL}/api/v1/user/${blog[0].author}`,
    );

    const responseData = { blog: blog[0], author: data };

    await redisClient.set(cacheKey, JSON.stringify(responseData), { EX: 3600 });

    res.status(200).json(responseData);
  } catch (error) {
    console.error("Error fetching blog:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
