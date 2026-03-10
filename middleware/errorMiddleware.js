const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;

    console.error(err.stack); // Still log the error for you to see in the console

    // Mongoose Bad ObjectId (e.g., trying to find a book with ID "123")
    if (err.name === 'CastError') {
        error.message = 'Resource not found';
        return res.status(404).json({ success: false, message: error.message });
    }

    // Mongoose Duplicate Key (e.g., same email twice)
    if (err.code === 11000) {
        error.message = 'Duplicate field value entered';
        return res.status(400).json({ success: false, message: error.message });
    }

    res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Server Error'
    });
};

export default errorHandler;