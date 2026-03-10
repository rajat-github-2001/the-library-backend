# 📚 BookShelf API - Advanced REST Backend

A professional-grade RESTful API built with the MERN stack (Node.js, Express, MongoDB). This project features full user authentication, cloud-based image uploads, and automated email services.

## 🚀 Live Demo

**Base URL:** https://the-library-backend.onrender.com

---

## 🛠️ Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (via Mongoose)
- **Security:** JWT (JSON Web Tokens), Bcrypt.js, Helmet, Express-Validator
- **Cloud Media:** Cloudinary (Image storage & transformation)
- **Email:** Nodemailer (via Mailtrap for testing)
- **Deployment:** Render

---

## ✨ Key Features

- **Secure Authentication:** JWT-based login/register with hashed passwords.
- **Image Management:** Book covers are automatically resized and optimized in the cloud upon upload.
- **Protected Routes:** Middleware to ensure only authorized users can create or modify data.
- **Advanced Queries:** Built-in support for:
  - **Search:** Case-insensitive partial matches on titles.
  - **Filtering:** Filter books by specific authors.
  - **Pagination:** Large datasets handled via `limit` and `page` parameters.
- **Password Recovery:** Secure "Forgot Password" flow using hashed tokens and automated emails.
- **Global Error Handling:** Clean, user-friendly JSON error responses for all edge cases.

---

## 📡 API Endpoints

### Authentication

| Method | Endpoint                    | Description                        |
| :----- | :-------------------------- | :--------------------------------- |
| POST   | `/api/users`                | Register a new user                |
| POST   | `/api/users/login`          | Login & get JWT Token              |
| GET    | `/api/users/me`             | Get current user profile (Private) |
| POST   | `/api/users/forgotpassword` | Send reset email                   |

### Books

| Method | Endpoint         | Description                            |
| :----- | :--------------- | :------------------------------------- |
| GET    | `/api/books`     | Get all books (Supports Search/Filter) |
| POST   | `/api/books`     | Create a book (Private + Image Upload) |
| PUT    | `/api/books/:id` | Update book (Owner only)               |
| DELETE | `/api/books/:id` | Delete book & cloud image (Owner only) |

---
