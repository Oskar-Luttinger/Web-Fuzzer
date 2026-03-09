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
const promise_1 = __importDefault(require("mysql2/promise"));
const pool = promise_1.default.createPool({
    host: "localhost",
    user: "root",
    password: "123",
    database: "my_database",
    waitForConnections: true
});
/**
 * Establishes a connection the database, checks if users exist and if not inserts the database with default user accounts
 * @example
 * initialize_database();
 * @precondition The database pool must be configured and the SQL server must be reachable
 * @complexity O(n) - n is the number of users to be read
 * @returns {Promise<void>} resolves when the server is up and running
*/
function initialize_database() {
    return __awaiter(this, void 0, void 0, function* () {
        let connection;
        try {
            connection = yield pool.getConnection();
            console.log("Successfully connected to database");
            yield connection.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL
            )
        `);
            yield connection.query(`
            INSERT IGNORE INTO users (username, password) 
            VALUES ('admin', '1234')
        `);
            yield connection.query(`
            INSERT IGNORE INTO users (username, password) 
            VALUES ('dingdong', '12345')
        `);
            yield connection.query(`
            INSERT IGNORE INTO users (username, password) 
            VALUES ('bingbong', '123')
        `);
            yield connection.query(`
            INSERT IGNORE INTO users (username, password) 
            VALUES ('kingkong', '1234567')
        `);
        }
        catch (err) {
            console.log("Connection to database failed");
            console.error(err);
        }
        finally {
            if (connection) {
                connection.release();
            }
            else { }
        }
    });
}
initialize_database();
exports.default = pool;
