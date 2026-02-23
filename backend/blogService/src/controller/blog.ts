import { sql } from "../utils/db.js";

export const getAllBlogs = async (req: any, res: any) => {
  try {
    const { searchQuery, category } = req.query;
    let blogs;

    if (searchQuery && category) {
      blogs = await sql`SELECT * FROM blogs WHERE (title ILIKE ${
        "%" + searchQuery + "%"
      } OR description ILIKE ${
        "%" + searchQuery + "%"
      }) AND category = ${category} ORDER BY created_at DESC`;
    } else if (searchQuery) {
      blogs = await sql`SELECT * FROM blogs WHERE (title ILIKE ${
        "%" + searchQuery + "%"
      } OR description ILIKE ${"%" + searchQuery + "%"}) ORDER BY created_at DESC`;
    } else if (category) {
      blogs =
        await sql`SELECT * FROM blogs WHERE category=${category} ORDER BY created_at DESC`;
    } else {
      blogs = await sql`SELECT * FROM blogs ORDER BY created_at DESC`;
    }
    res.status(200).json(blogs);
  } catch (error) {
    console.error("Error fetching blogs:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
