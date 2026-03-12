import express from "express";
import morgan from "morgan";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from 'cors';
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import bookRoutes from "./routes/bookRoutes.js";
import userRoutes from './routes/userRoutes.js'
import errorHandler from './middleware/errorMiddleware.js';
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per window
    message: 'Too many requests from this IP, please try again after 15 minutes'
});

dotenv.config();

const app = express();

app.use(express.json());
app.use(helmet());
app.use(cors())

// app.use(
//     mongoSanitize({
//         replaceWith: "_",
//     })
// );

if (process.env.NODE_ENV === "development") {
    app.use(morgan("dev"));
    console.log("🛠️ Running in Development Mode");
}

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log("🍃 Connected to MongoDB"))
    .catch((err) => console.error("❌ DB Connection Error:", err));

app.use('/api/', limiter);
app.use("/api/books", bookRoutes);
app.use("/api/users", userRoutes);

app.use(errorHandler);

app.use((err, req, res, next) => {
    console.error(err.stack);

    res.status(500).json({
        success: false,
        message: "Something went wrong on our end!",
        error: err.message,
    });
});

export default app