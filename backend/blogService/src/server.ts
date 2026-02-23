import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import blogRoutes from "./routes/route.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5002;

app.use("/api/v1", blogRoutes);

app.listen(PORT, () => {
  console.log(`Blog service is running on port ${PORT}`);
});
