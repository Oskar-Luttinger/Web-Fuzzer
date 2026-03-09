"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const server_1 = require("./server");
const db_1 = __importDefault(require("./db/db"));
// Stop the test from hitting the real database
jest.mock('./src/db/db', () => ({
    execute: jest.fn()
}));
describe('Authentication API', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    it('should login successfully with correct credentials', () => __awaiter(void 0, void 0, void 0, function* () {
        db_1.default.execute.mockResolvedValue([
            [{ username: 'admin' }]
        ]);
        const res = yield (0, supertest_1.default)(server_1.app)
            .post('/login')
            .send({ user: 'admin', pass: '1234' });
        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(true);
    }));
    it('should fail login with wrong credentials', () => __awaiter(void 0, void 0, void 0, function* () {
        db_1.default.execute.mockResolvedValue([[]]);
        const res = yield (0, supertest_1.default)(server_1.app)
            .post('/login')
            .send({ user: 'hacker', pass: 'wrong' });
        expect(res.statusCode).toEqual(401);
        expect(res.body.success).toBe(false);
    }));
    it('should return 401 for unauthorized dashboard access', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(server_1.app).get('/dashboard');
        expect(res.statusCode).toEqual(401);
    }));
});
