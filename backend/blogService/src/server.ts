import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import blogRoutes from "./routes/route.js";
import { createClient } from "redis";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5002;

export const redisClient = createClient({
  url: process.env.UPSTASH_REDIS_URL,
});

redisClient
  .connect()
  .then(() => console.log("Connected to redis"))
  .catch(console.error);

app.use("/api/v1", blogRoutes);

app.listen(PORT, () => {
  console.log(`Blog service is running on port ${PORT}`);
});
