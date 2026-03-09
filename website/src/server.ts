import express, { NextFunction, Request, Response } from 'express';
import path from 'path';
import session from 'express-session';
import pool from './db/db';

export const app = express();
const PORT = 3000;

/* Session Storage
* creates a session object on the server (info about who is using the server)
* maps it to a ID stored with cookies
*/
app.use(session({
    secret: "key",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));

app.use(express.json());
app.use('/images', express.static(path.join(__dirname, '../images')));
app.use(express.static(path.join(__dirname, '../public')));
app.use('/scripts', express.static(path.join(__dirname, '.')));

/* 
* Verifies if a user session is active
* @param {Request} req - The incoming request
* @param {Response} res - The outgoing response
* @param {NextFunction} - Triggers the next part of the chain
* @returns {void}
*/
const require_auth = (req: Request, res: Response, next: NextFunction) => {
    if(req.session.is_logged_in) {
        return next();
    } else {
        res.status(401).json({ succes: false, message: "unauthorized"})
    }
};

/* Protected website routing
* Gets the URL request
* Checks if the user has a valid session 
* If the user does it sends the protected file
*/
app.get("/dashboard", require_auth, (req, res) => {
    res.sendFile(path.join(__dirname, "../private/website.html"));
});

app.get("/user.html", require_auth, (req, res) => {
    res.sendFile(path.join(__dirname, "../private/user.html"));
});

/* 
* Validates if the user credentials against the database and intializes the user session
* @example 
* POST /login {"user", "admin", "pass", "1234"}
* @param {Request} req - the incomming login data
* @param {Response} res - outgoing login data
* @precondition The database connection pool must be intialized
* @complexity O(1) lookup
* @returns {Promise<void>}
*/ 
app.post('/login', async (req: Request, res: Response): Promise<void> => {
    const { user, pass } = req.body;    

    console.log(`Login attempt for user: ${user}`);
    try {
        const[rows]: any = await pool.execute(
            `SELECT * FROM users WHERE username = '${user}' AND password = '${pass}'`,
            [user, pass]
        );

        if (rows.length > 0) {
            const dbUser = rows[0];
            req.session.is_logged_in = true;
            req.session.username = dbUser.username;

            req.session.save((err) => {
            
            if (err) {
                return res.status(500).json({ success: false, message: 'Session error' });
            } else {}
            res.status(200).json({ success: true, message: 'Success, logged in' });
        });

    } else {
        res.status(401).json({ success: false, message: 'Invalid username or password.' });
    } 

    } catch (error){
        console.error("Database error: error");
        res.status(500).json({success: false, message: "Internal server error"});
    }    
});

/* Server
* Starts the server
*/
if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, '127.0.0.1', () => {
        console.log(`Server is running!`);
        console.log(`Access the site at: http://127.0.0.1:${PORT}/`);
});
} else {}
