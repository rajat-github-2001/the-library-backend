import request from 'supertest';
import app from '../app.js';
import mongoose from 'mongoose';
import User from '../models/User.js';

describe('Book API Endpoints', () => {
    let token;

    beforeAll(async () => {
        await User.deleteMany({ email: 'test@test.com' });

        await request(app).post('/api/users').send({ name: 'test user', email: 'test@test.com', password: 'password123' });

        const loginRes = await request(app).post('/api/users/login').send({ email: 'test@test.com', password: 'password123' });

        token = loginRes.body.token;
    });

    afterAll(async () => {
        await User.deleteMany({ email: 'test@test.com' })
        await mongoose.connection.close();
    });

    it('should fetch all books', async () => {
        const res = await request(app).get('/api/books');
        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(true);
    })

    it('should fail to create a book without a token', async () => {
        const res = await request(app).post('/api/books').send({ title: "Hack the planet", author: 'Neo' });

        expect(res.statusCode).toEqual(401);
        expect(res.body.success).toBe(false);
    });

    it('should return 400 if title is missing', async () => {
        const res = await request(app).post('/api/books').set('Authorization', `Bearer ${token}`).send({ author: "No title author" });

        expect(res.statusCode).toEqual(400);
        expect(res.body.success).toBe(false);
    });

    it('should create a book successfully with a valid data', async () => {
        const res = await request(app).post('/api/books').set('Authorization', `Bearer ${token}`).send({
            title: 'Valid Book',
            author: 'Valid Author'
        });

        expect(res.statusCode).toEqual(201);
        expect(res.body.data.title).toBe('Valid Book');
    })

    it('should upload a book with an image', async () => {
        const res = await request(app)
            .post('/api/books')
            .set('Authorization', `Bearer ${token}`)
            .field('title', 'Book with Image') // Use .field for text
            .field('author', 'Artistic Author')
            .attach('image', 'tests/fixtures/test-image.png'); // Use .attach for files

        expect(res.statusCode).toEqual(201);
        expect(res.body.data.image).toContain('cloudinary');
    });
})