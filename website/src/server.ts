import express from 'express';
import path from 'path';

const app = express();
const PORT = 3000;

//Allows the server to understand the json files
app.use(express.json());

//Gives express acces to all of the website files
app.use(express.static(path.join(__dirname, '../')));

//Handels the data sent from the login form 
app.post('/login', (req, res) => {
    const { user, pass } = req.body;

    console.log(`Login attempt for user: ${user}`);

    // Simple check (in a real app, you'd check a database here)
    if (user === 'admin' && pass === '1234') {
        res.status(200).json({ success: true, message: 'Succes, logged in' });
    } else {
        res.status(401).json({ success: false, message: 'Invalid username or password.' }); 
    }
});

//Starts the servver
app.listen(PORT, '127.0.0.1', () => {
    console.log(`Server is running!`);
    console.log(`Access your site at: http://127.0.0.1:${PORT}/`);
});