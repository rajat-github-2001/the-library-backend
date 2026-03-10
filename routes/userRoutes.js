import express from 'express';
import { createUser, forgotPassword, getAllUsers, getMe, loginUser, resetPassword } from '../controllers/userController.js'
import { protect } from '../middleware/authMiddleware.js';
import { registerRules, validate } from '../middleware/validator.js';

const router = express.Router();

// Order: Rules -> Validate -> Controller
router.post('/', registerRules, validate, createUser);
router.get('/', getAllUsers);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resetToken', resetPassword);

export default router;