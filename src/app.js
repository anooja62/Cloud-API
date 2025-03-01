import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import userRoutes from "./routes/user.routes.js";
import fileRoutes from "./routes/file.routes.js";
import { authMiddleware } from "./middlewares/auth.middleware.js";

dotenv.config();
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());


// Routes
app.use("/api/users", userRoutes);
app.use("/api/files", authMiddleware, fileRoutes);

export default app;
app.get("/", (req, res) => {
    res.send("Welcome to the CloudX API");
});

