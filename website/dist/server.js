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
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const express_session_1 = __importDefault(require("express-session"));
const db_1 = __importDefault(require("./db/db"));
exports.app = (0, express_1.default)();
const PORT = 3000;
/* Session Storage
* creates a session object on the server (info about who is using the server)
* maps it to a ID stored with cookies
*/
exports.app.use((0, express_session_1.default)({
    secret: "key",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));
exports.app.use(express_1.default.json());
exports.app.use('/images', express_1.default.static(path_1.default.join(__dirname, '../images')));
exports.app.use(express_1.default.static(path_1.default.join(__dirname, '../public')));
exports.app.use('/scripts', express_1.default.static(path_1.default.join(__dirname, '.')));
/*
* Verifies if a user session is active
* @param {Request} req - The incoming request
* @param {Response} res - The outgoing response
* @param {NextFunction} - Triggers the next part of the chain
* @returns {void}
*/
const require_auth = (req, res, next) => {
    if (req.session.is_logged_in) {
        return next();
    }
    else {
        res.status(401).json({ succes: false, message: "unauthorized" });
    }
};
const require_admin = (req, res, next) => {
    if (req.session.is_logged_in && req.session.is_admin) {
        return next();
    }
    else {
        res.status(403).json({ success: false, message: "Not logged in" });
    }
};
/* Protected website routing
* Gets the URL request
* Checks if the user has a valid session
* If the user does it sends the protected file
*/
exports.app.get("/dashboard", require_auth, (req, res) => {
    res.sendFile(path_1.default.join(__dirname, "../private/website.html"));
});
exports.app.get("/kill", require_auth, (req, res) => {
    res.sendFile(path_1.default.join(__dirname, "../private/admin.html"));
});
exports.app.get("/secret", require_admin, (req, res) => {
    res.sendFile(path_1.default.join(__dirname, "../private/secret.html"));
});
exports.app.get("/user.html", require_auth, (req, res) => {
    res.sendFile(path_1.default.join(__dirname, "../private/user.html"));
});
exports.app.get("/communication", require_admin, (req, res) => {
    res.sendFile(path_1.default.join(__dirname, "../private/communication.html"));
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
function login_request(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const { user, pass } = req.body;
        const is_from_admin_page = (_a = req.get('Referer')) === null || _a === void 0 ? void 0 : _a.includes('/kill');
        console.log(`Login attempt for user: ${user}`);
        if (user === 'theArchitect') {
            if (is_from_admin_page && pass === 'lUna4rch1teCt') {
                req.session.is_logged_in = true;
                req.session.is_admin = true;
                req.session.save(() => {
                    res.status(200).json({ success: true, message: 'Admin logged in', redirectUrl: '/secret' });
                });
                return;
            }
            else {
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
        }
        else { }
        try {
            const [rows] = yield db_1.default.execute(`SELECT * FROM users WHERE username = '${user}' AND password = '${pass}'`, [user, pass]);
            if (rows.length > 0) {
                const dbUser = rows[0];
                req.session.is_logged_in = true;
                req.session.username = dbUser.username;
                req.session.save((err) => {
                    if (err) {
                        return res.status(500).json({ success: false, message: 'Session error' });
                    }
                    else { }
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
    });
}
exports.app.post('/login', login_request);
/* Server
* Starts the server
*/
if (process.env.NODE_ENV !== 'test') {
    exports.app.listen(PORT, '127.0.0.1', () => {
        console.log(`Server is running!`);
        console.log(`Access the site at: http://127.0.0.1:${PORT}/`);
    });
}
else { }
