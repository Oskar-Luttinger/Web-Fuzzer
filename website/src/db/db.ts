import mysql from "mysql2/promise";
import { Connection } from "mysql2/typings/mysql/lib/Connection";

const pool = mysql.createPool ({
    host: "localhost",
    user: "root",
    password: "1234",
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
                password VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL
            )
        `);
        
        await connection.query(`
            INSERT IGNORE INTO users (username, password) 
            VALUES ('theArchitect', 'lunA4RCH1teCT')
            ON DUPLICATE KEY UPDATE password = VALUES(password)
        `);

        await connection.query(`
            INSERT IGNORE INTO users (username, password) 
            VALUES ('dingdong', 'bingbong')
            ON DUPLICATE KEY UPDATE password = VALUES(password)
        `);

        await connection.query(`
            INSERT IGNORE INTO users (username, password) 
            VALUES ('bingbong', 'dingdong')
            ON DUPLICATE KEY UPDATE password = VALUES(password)
        `);

        await connection.query(`
            INSERT IGNORE INTO users (username, password) 
            VALUES ('kingkong', '1234567')
            ON DUPLICATE KEY UPDATE password = VALUES(password)
        `);

        await connection.query(`
            INSERT INTO users (username, password) 
            VALUES ('pingpong', 'Ilovetabletennis')
            ON DUPLICATE KEY UPDATE password = VALUES(password)
        `);

        await connection.query(`
            INSERT IGNORE INTO users (username, password) 
            VALUES ('birgitta', 'CatHater46')
            ON DUPLICATE KEY UPDATE password = VALUES(password)
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