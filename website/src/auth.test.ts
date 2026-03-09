import request from 'supertest';
import { app } from './server';
import pool from './db/db';

// Stop the test from hitting the real database
jest.mock('./src/db/db', () => ({
    execute: jest.fn()
}));

describe('Authentication API', () => {
    
    beforeEach(() => {
        jest.clearAllMocks(); 
    });

    it('should login successfully with correct credentials', async () => {
        (pool.execute as jest.Mock).mockResolvedValue([
            [{ username: 'admin' }] 
        ]);

        const res = await request(app)
            .post('/login')
            .send({ user: 'admin', pass: '1234' });

        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(true);
    });

    it('should fail login with wrong credentials', async () => {
        (pool.execute as jest.Mock).mockResolvedValue([[]]);

        const res = await request(app)
            .post('/login')
            .send({ user: 'hacker', pass: 'wrong' });

        expect(res.statusCode).toEqual(401);
        expect(res.body.success).toBe(false);
    });

    it('should return 401 for unauthorized dashboard access', async () => {
        const res = await request(app).get('/dashboard');
        expect(res.statusCode).toEqual(401);
    });
});