import mysql from "mysql2/promise";
import { Connection } from "mysql2/typings/mysql/lib/Connection";

const pool = mysql.createPool ({
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
async function initialize_database(): Promise<void> {
    let connection;
    try {
        connection = await pool.getConnection();
        console.log("Successfully connected to database");
        await connection.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL
            )
        `);
        
        await connection.query(`
            INSERT IGNORE INTO users (username, password) 
            VALUES ('admin', '1234')
        `);

        await connection.query(`
            INSERT IGNORE INTO users (username, password) 
            VALUES ('dingdong', '12345')
        `);

        await connection.query(`
            INSERT IGNORE INTO users (username, password) 
            VALUES ('bingbong', '123')
        `);

        await connection.query(`
            INSERT IGNORE INTO users (username, password) 
            VALUES ('kingkong', '1234567')
        `);

    } catch (err) {
        console.log("Connection to database failed");
        console.error(err);
    } finally {
        if (connection) {
            connection.release();
        } else {}
    }
}

initialize_database();

export default pool;