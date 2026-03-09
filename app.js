import express from "express";
import morgan from "morgan";
import mongoose from "mongoose";
import dotenv from "dotenv";
import mongoSanitize from "express-mongo-sanitize";
import bookRoutes from "./routes/bookRoutes.js";
import userRoutes from './routes/userRoutes.js'

dotenv.config();

const app = express();

app.use(express.json());

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

app.use("/api/books", bookRoutes);
app.use("/api/users", userRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`🚀 Server running at ${PORT}`));

app.use((err, req, res, next) => {
    console.error(err.stack);

    res.status(500).json({
        success: false,
        message: "Something went wrong on our end!",
        error: err.message,
    });
});