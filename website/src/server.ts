import express, { NextFunction, Request, Response } from 'express';
import path from 'path';
import session from 'express-session';

const app = express();
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

/* Authorization check
* If the user is logged in, the user can proceed to the requested page
* If the user is not logged in, the user will get an unauthorized error message
*/
const requireAuth = (req: Request, res: Response, next: NextFunction) => {
    if(req.session.isLoggedIn) {
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
app.get("/dashboard", requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, "../private/website.html"));
});

/* Login/Authentication controller
* To lazy to comment rn
*/ 
app.post('/login', (req, res) => {
    const { user, pass } = req.body;

    console.log(`Login attempt for user: ${user}`);

    //Checks for user
    if (user === 'admin' && pass === '1234') {
        req.session.isLoggedIn = true;
        req.session.username = user;
    
    //Tells the server to write the logged in status before doing anything else (to prevent issues when accsesing dashboard too fast)
    req.session.save((err) => {
            if (err) {
                return res.status(500).json({ success: false, message: 'Session error' });
            }
            res.status(200).json({ success: true, message: 'Success, logged in' });
        });
    } else {
        res.status(401).json({ success: false, message: 'Invalid username or password.' });
    }
});

/* Server
* Starts the server
*/
app.listen(PORT, '127.0.0.1', () => {
    console.log(`Server is running!`);
    console.log(`Access the site at: http://127.0.0.1:${PORT}/`);
});