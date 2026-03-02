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
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const express_session_1 = __importDefault(require("express-session"));
const db_1 = __importDefault(require("./db/db"));
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
app.post('/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { user, pass } = req.body;
    console.log(`Login attempt for user: ${user}`);
    try {
        const [rows] = yield db_1.default.execute('SELECT * FROM users WHERE username = ? AND password = ?', [user, pass]);
        if (rows.length > 0) {
            const dbUser = rows[0];
            req.session.isLoggedIn = true;
            req.session.username = dbUser.username;
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
    }
    catch (error) {
        console.error("Database error: error");
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}));
/* Server
* Starts the server
*/
app.listen(PORT, '127.0.0.1', () => {
    console.log(`Server is running!`);
    console.log(`Access the site at: http://127.0.0.1:${PORT}/`);
});
