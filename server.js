const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const { Client } = require('pg');

const app = express();
app.use(bodyParser.json());

const PORT = 8000;
const secretKey = 'secret';

// db configuration
const DB_HOST = 'localhost';
const DB_NAME = 'finonex';
const DB_USERNAME = 'postgres';
const DB_PASSWORD = 'postgres';
const DB_PORT = 5432;

// PostgreSQL database configuration - put on config file
const client = new Client({
    user: DB_USERNAME,
    host: DB_HOST,
    database: DB_NAME,
    password: DB_PASSWORD,
    port: DB_PORT,
});
client.connect();

app.post('/liveEvent', (req, res) => {
    console.log("liveEvent api was called");
    const authHeader = req.headers['authorization'];
    if (authHeader !== secretKey) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const event = req.body;
    fs.appendFile('server-events.jsonl', JSON.stringify(event) + '\n', (err) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
        return res.json({ message: 'Event saved successfully' });
    });
});

app.get('/userEvents/:userid', async (req, res) => {
    const userId = req.params.userid;

    try {
        const query = 'SELECT * FROM users_revenue WHERE user_id = ?';
        const { rows } = await client.query(query, [userId]);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
