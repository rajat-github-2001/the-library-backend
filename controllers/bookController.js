import asyncHandler from '../middleware/asyncHandler.js';
import Book from '../models/Book.js';
import { v2 as cloudinary } from 'cloudinary';

export const createBook = asyncHandler(async (req, res) => {
    try {
        const { title, author } = req.body;

        const imageUrl = req.file ? req.file.path : undefined;

        const newBook = new Book({
            title,
            author,
            owner: req.user.id,
            image: imageUrl
        });

        const savedBook = await newBook.save();

        res.status(201).json({ success: true, data: savedBook });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

export const getAllBooks = asyncHandler(async (req, res) => {
    const { author, search, page = 1, limit = 10 } = req.query;

    let query = {};

    if (author) query.author = author;

    if (search) {
        query.title = { $regex: search, $options: 'i' };
    }

    const skip = (page - 1) * limit;

    const books = await Book.find(query).populate('owner', 'name email').limit(Number(limit)).skip(skip);

    const total = await Book.countDocuments(query);

    res.status(200).json({
        success: true,
        count: books.length,
        total,
        currentPage: Number(page),
        totalPages: Math.ceil(total / limit),
        data: books
    });
})

export const getBookById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const book = await Book.findById(id);

    if (!book) {
        return res.status(404).json({ success: false, message: "Book not found" });
    }

    res.status(200).json({ success: true, data: book });
});

export const updateBook = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const updatedBook = await Book.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true
    });

    if (!updatedBook) {
        return res.status(404).json({ success: false, message: "Book not found" });
    }
    res.status(200).json({ success: true, data: updatedBook });
});

export const deleteBook = asyncHandler(async (req, res) => {
    const book = await Book.findById(req.params.id);

    if (!book) return res.status(404).json({ message: "Book not found" });

    if (book.image && book.image.includes('cloudinary')) {
        const publicId = book.image.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(`book_covers/${publicId}`);
    }

    await book.deleteOne();
    res.status(200).json({ success: true, message: "Book and image deleted" });
});