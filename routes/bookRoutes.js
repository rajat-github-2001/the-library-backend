import express from 'express';
import { createBook, deleteBook, getAllBooks, getBookById, updateBook } from '../controllers/bookController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getAllBooks);
router.get('/:id', getBookById);
router.post('/', protect, createBook);
router.patch('/:id', protect, updateBook);
router.delete('/:id', protect, deleteBook);

export default router