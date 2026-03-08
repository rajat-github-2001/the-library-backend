import Book from '../models/Book.js';

export const createBook = async (req, res) => {
    try {
        const { title, author } = req.body;

        const newBook = new Book({
            title,
            author
        });

        const savedBook = await newBook.save();

        res.status(201).json({ success: true, data: savedBook });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const getAllBooks = async (req, res) => {
    try {
        const books = await Book.find();
        res.status(200).json({ success: true, count: books.length, data: books });
    } catch {
        res.status(500).json({ success: false, message: error.message });
    }
}

export const getBookById = async (req, res) => {
    try {
        const { id } = req.params;
        const book = await Book.findById(id);

        if (!book) {
            return res.status(404).json({ success: false, message: "Book not found" });
        }

        res.status(200).json({ success: true, data: book });
    } catch (error) {
        res.status(400).json({ success: false, message: 'Invalid Id format' })
    }
}

export const updateBook = async (req, res) => {
    try {
        const { id } = req.params;

        const updatedBook = await Book.findByIdAndUpdate(id, req.body, {
            new: true,
            runValidators: true
        });

        if (!updatedBook) {
            return res.status(404).json({ success: false, message: "Book not found" });
        }
        res.status(200).json({ success: true, data: updatedBook });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}

export const deleteBook = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedBook = await Book.findByIdAndDelete(id);

        if (!deletedBook) {
            return res.status(404).json({ success: true, message: "Book deleted successfully" });
        }
    } catch (error) {
        res.status(400).json({ success: false, message: "Invalid ID format" });
    }
}