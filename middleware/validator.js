import { body, validationResult } from 'express-validator';

export const registerRules = [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
    body('name').notEmpty().withMessage('Name is required')
];

export const bookRules = [
    body('title').trim().notEmpty().withMessage('Title cannot be empty'),
    body('author').notEmpty().withMessage('Author is required')
]

export const validate = (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array().map(err => err.msg)
        })
    }
    next();
}