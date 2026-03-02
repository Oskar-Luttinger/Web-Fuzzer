"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const express_session_1 = __importDefault(require("express-session"));
const app = (0, express_1.default)();
const PORT = 4444;
/* Session Storage
* creates a session object on the server (info about who is using the server)
* maps it to a ID stored with cookies
*/
app.use((0, express_session_1.default)({
    secret: "key",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));
app.use(express_1.default.json());
app.use('/images', express_1.default.static(path_1.default.join(__dirname, '../images')));
app.use(express_1.default.static(path_1.default.join(__dirname, '../public')));
app.use('/scripts', express_1.default.static(path_1.default.join(__dirname, '.')));
/* Authorization check
* If the user is logged in, the user can proceed to the requested page
* If the user is not logged in, the user will get an unauthorized error message
*/
const requireAuth = (req, res, next) => {
    if (req.session.isLoggedIn) {
        return next();
    }
    else {
        res.status(401).json({ succes: false, message: "unauthorized" });
    }
};
/* Protected website routing
* Gets the URL request
* Checks if the user has a valid session
* If the user does it sends the protected file
*/
app.get("/dashboard", requireAuth, (req, res) => {
    res.sendFile(path_1.default.join(__dirname, "../private/website.html"));
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
    }
    else {
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
