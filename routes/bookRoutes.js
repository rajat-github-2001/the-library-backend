import express from 'express';
import { createBook, deleteBook, getAllBooks, getBookById, updateBook } from '../controllers/bookController.js';
import { protect } from '../middleware/authMiddleware.js';
import { bookRules, validate } from '../middleware/validator.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.get('/', getAllBooks);
router.get('/:id', getBookById);
router.post(
    '/',
    protect,
    upload.single('image'),
    bookRules,
    validate,
    createBook
);
router.patch('/:id', protect, updateBook);
router.delete('/:id', protect, deleteBook);

export default router