import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import asyncHandler from '../middleware/asyncHandler.js';
import nodemailer from 'nodemailer';

export const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // 1. find user
    const user = await User.findOne({ email });
    if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
    }

    // 2. Compare password 
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(401).json({ message: "Invalid credentials" });
    }

    // 3. Create Token
    const token = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
    );

    res.status(200).json({
        success: true,
        token,
        user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
})

export const createUser = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
        return res.status(400).json({ success: false, message: "User already exists" });
    }

    const newUser = await User.create({
        name,
        email,
        password
    });

    res.status(201).json({
        success: true,
        data: newUser
    });
})

export const getAllUsers = asyncHandler(async (req, res) => {
    const users = await User.find();
    res.status(200).json({ success: true, data: users });
});

export const getMe = asyncHandler(async (req, res) => {
    res.status(200).json({
        success: true,
        data: req.user
    })
});

export const forgotPassword = async (req, res) => {
    const user = await User.findOne({ email: req.body.email });

    if (!user) return res.status(404).json({ message: "User not found" });

    // 1. Generate Reset Token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // 2. Hash and set to user model
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 mins

    await user.save();

    // 3. Send Email
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const message = `You requested a password reset. Use this token: ${resetToken}`

    try {
        await transporter.sendMail({
            from: 'noreply@bookapp.com',
            to: user.email,
            subject: 'Password Reset Token',
            text: message,
        })
        res.status(200).json({ success: true, message: 'email sent' });
    } catch (err) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();
        console.log(err)

        res.status(500).json({ message: 'Email could not be sent' });
    }
}

export const resetPassword = async (req, res) => {
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.resetToken).digest('hex');

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
        return res.status(400).json({ message: "Invalid or expired token" });
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(200).json({ success: true, message: "Password updated successfully" });
}