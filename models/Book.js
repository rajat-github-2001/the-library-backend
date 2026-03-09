import mongoose from "mongoose";

const bookSchema = new mongoose.Schema({
    title: { type: String, required: true },
    author: { type: String, required: true },
    isAvailable: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    }
})

export default mongoose.model('Book', bookSchema)