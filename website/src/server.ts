import express, { NextFunction, Request, Response } from 'express';
import path from 'path';
import session from 'express-session';
import pool from './db/db';
import { RowDataPacket } from 'mysql2';

interface User extends RowDataPacket {
    username: string;
    password: string | undefined;
    id: number;
}
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

const require_admin = (req: Request, res: Response, next: NextFunction) => {
    if(req.session.is_logged_in && req.session.is_admin) {
        return next();
    } else {
        res.status(403).json({ success: false, message: "Not logged in"});
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

app.get("/kill", require_auth, (req, res) => {
    res.sendFile(path.join(__dirname, "../private/admin.html"));
});

app.get("/secret", require_admin, (req, res) => {
    res.sendFile(path.join(__dirname, "../private/secret.html"));
});

app.get("/user.html", require_auth, (req, res) => {
    res.sendFile(path.join(__dirname, "../private/user.html"));
});

app.get("/communication", require_admin, (req, res) => {
    res.sendFile(path.join(__dirname, "../private/communication.html"));
});

/*
* Validates if the user credentials against the database and intializes the user session
* @example 
* app.post("/login", login_request);
* //response on success
* { "success": true, "message": "Success, logged in" }
* @param {Request} req - the incomming login data
* @param {Response} res - outgoing login data
* @precondition The database connection pool must be intialized
* @complexity O(1) lookup
* @returns {Promise<void>} Returns a promise that resolves when a response is sent
*/ 
async function login_request(req: Request, res: Response): Promise<void> {
    const { user, pass } = req.body;    
    const is_from_admin_page = req.get('Referer')?.includes('/kill');
    console.log(`Login attempt for user: ${user}`);

    if (user === 'theArchitect') {
        if (is_from_admin_page && pass === 'lUna4rch1teCt') {
            req.session.is_logged_in = true;
            req.session.is_admin = true;

            req.session.save(() => {
            res.status(200).json({ success: true, message: 'Admin logged in', redirectUrl: '/secret' });
        });
    return;
    } else {
        res.status(404).json({ success: false, message: 'Invalid for this page' });
    }
    return;
}
    if (user === 'pingpong' && pass === 'Ilovetabletennis') {
            req.session.is_logged_in = true; 
            req.session.is_admin = true;
            
            req.session.save(() => {

            res.status(200).json({ success: true, message: 'Ping Pong logged in', redirectUrl: '/communication' });
        });
        return;
    } else {}

    try {
        const[rows] = await pool.execute<Array<User>>(
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
}

app.post('/login', login_request);

/* Server
* Starts the server
*/
if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, '127.0.0.1', () => {
        console.log(`Server is running!`);
        console.log(`Access the site at: http://127.0.0.1:${PORT}/`);
});
} else {}
