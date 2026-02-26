import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { sql } from "./utils/db.js";
import { v2 as cloudinary } from "cloudinary";
import blogRoutes from "./routes/blog.js";
import { connectRabbitMQ } from "./utils/rabbitmq.js";

dotenv.config();
const app = express();

const PORT = process.env.PORT;

app.use(express.json());
app.use(cors());
connectRabbitMQ();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function initDB() {
  try {
    await sql`
        CREATE TABLE IF NOT EXISTS blogs(
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description VARCHAR(255) NOT NULL,
        blogcontent TEXT NOT NULL,
        image VARCHAR(255) NOT NULL,
        category VARCHAR(255) NOT NULL,
        author VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        `;

    await sql`
        CREATE TABLE IF NOT EXISTS comments(
        id SERIAL PRIMARY KEY,
        comment VARCHAR(255) NOT NULL,
        userid VARCHAR(255) NOT NULL,
        username VARCHAR(255) NOT NULL,
        blogid VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        `;

    await sql`
        CREATE TABLE IF NOT EXISTS savedblogs(
        id SERIAL PRIMARY KEY,
        userid VARCHAR(255) NOT NULL,
        blogid VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        `;

    console.log("database initialized successfully");
  } catch (error) {
    console.log("Error initDb", error);
  }
}

app.get("/", (req, res) => {
  res.send("Author Service is running");
});

app.use(express.json());
app.use("/api/v1/blogs", blogRoutes);

initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Author Server is running on http://localhost:${PORT}`);
  });
});
