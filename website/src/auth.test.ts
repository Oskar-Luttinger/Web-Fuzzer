import request from 'supertest';
import { app } from './server';
import pool from './db/db';

jest.mock('./db/db', () => ({
    __esModule:true,
    default: {
    execute: jest.fn()
    }
}));

describe('Authentication API', () => {
    
    beforeEach(() => {
        jest.clearAllMocks(); 
    });

    it('should login successfully with correct credentials', async () => {
        (pool.execute as jest.Mock).mockResolvedValue([
            [{ username: 'birgitta' }] 
        ]);

        const res = await request(app)
            .post('/login')
            .send({ user: 'pinpong', pass: 'Ilovetabletennis' });

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