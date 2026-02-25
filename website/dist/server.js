"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const express_session_1 = __importDefault(require("express-session"));
const app = (0, express_1.default)();
const PORT = 3000;
app.use((0, express_session_1.default)({
    secret: "key",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));
//Allows the server to understand the json files
app.use(express_1.default.json());
//Gives express access to all of the website files
app.use(express_1.default.static(path_1.default.join(__dirname, '../public')));
app.use('/scripts', express_1.default.static(path_1.default.join(__dirname, '.')));
const requireAuth = (req, res, next) => {
    if (req.session.isLoggedIn) {
        return next();
    }
    else {
        res.status(401).json({ succes: false, message: "unauthorized" });
    }
};
app.get("/dashboard", requireAuth, (req, res) => {
    res.sendFile(path_1.default.join(__dirname, "../private/website.html"));
});
//Handles the data sent from the login form 
app.post('/login', (req, res) => {
    const { user, pass } = req.body;
    console.log(`Login attempt for user: ${user}`);
    //Simple check (in a real app, you'd check a database here)
    if (user === 'admin' && pass === '1234') {
        req.session.isLoggedIn = true;
        req.session.username = user;
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
//Starts the server
app.listen(PORT, '127.0.0.1', () => {
    console.log(`Server is running!`);
    console.log(`Access the site at: http://127.0.0.1:${PORT}/`);
});
