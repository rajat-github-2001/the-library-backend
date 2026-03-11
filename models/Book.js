import mongoose from "mongoose";

const bookSchema = new mongoose.Schema({
    title: { type: String, required: true, index: true },
    author: { type: String, required: true },
    isAvailable: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    image: { type: String, default: 'https://via.placeholder.com/150' }
})

bookSchema.index({ author: 1, title: 1 });

export default mongoose.model('Book', bookSchema)