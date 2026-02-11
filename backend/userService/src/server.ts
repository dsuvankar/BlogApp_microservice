import express from "express";
import dotenv from "dotenv";
import connectDb from "./utils/db";
import userRoutes from "./routes/user";
import { requestLogger } from "./middleware/logger.middleware";
import { errorLogger } from "./middleware/errorlogger.middleware";
dotenv.config();

const app = express();

connectDb();

app.use(express.json());
app.use(requestLogger);
app.use("/api/v1", userRoutes);

app.use(errorLogger);

app.get("/", (req, res) => {
  res.send("Hello from User Service!");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
