import asyncHandler from '../middleware/asyncHandler.js';
import Book from '../models/Book.js';
import { v2 as cloudinary } from 'cloudinary';
import redis from '../config/redis.js';

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

        await redis.del('all_books');

        res.status(201).json({ success: true, data: savedBook });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

export const getAllBooks = asyncHandler(async (req, res) => {
    const { author, search, page = 1, limit = 10 } = req.query;

    const cacheKey = 'all_books';

    const cachedBooks = await redis.get(cacheKey);

    let query = {};

    if (author) query.author = author;

    if (search) {
        query.title = { $regex: search, $options: 'i' };
    }

    const skip = (page - 1) * limit;

    const total = await Book.countDocuments(query);

    if (cachedBooks) {
        console.log('Serving from Cache');
        return res.status(200).json({
            success: true,
            source: 'cache',
            count: cachedBooks.length,
            total,
            currentPage: Number(page),
            totalPages: Math.ceil(total / limit),
            data: cachedBooks
        })
    }

    const books = await Book.find(query).populate('owner', 'name email').limit(Number(limit)).skip(skip);

    await redis.set(cacheKey, JSON.stringify(books), { ex: 3600 });


    console.log('Serving from MongoDB');
    res.status(200).json({
        success: true,
        source: 'database',
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

    await redis.del('all_books');

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

    await redis.del('all_books');
    res.status(200).json({ success: true, message: "Book and image deleted" });
});

// $match: Filter the books (like a find).
// $group: Group them by author.
// $sort: Sort by the most books.
// $project: Clean up the final output.

export const getAuthorStats = asyncHandler(async (req, res) => {
    const cacheKey = 'author_stats'

    const cachedAuthorStats = await redis.get(cacheKey);

    if (cachedAuthorStats) {
        res.status(200).json({ success: true, source: 'cache', data: cachedAuthorStats });
    }

    const stats = await Book.aggregate([
        // Stage 1: Filter (Optional - only books with ratings, for example)
        // { $match: { rating: { $gte: 4 } } },

        //   stage 2: Group by author
        {
            $group: {
                _id: '$author', // Grouping criteria
                totalBooks: { $sum: 1 },
                // averagePrice: { $avg: '$price' },
                titles: { $push: '$title' }
            }
        },

        // stage 3: Sort by totalBooks descending
        { $sort: { totalBooks: -1 } },

        // stage 4: Limit to top 5
        { $limit: 5 }
    ]);

    await redis.set(cacheKey, JSON.stringify(stats), { ex: 3600 });

    res.status(200).json({ success: true, source: 'database', data: stats });
})