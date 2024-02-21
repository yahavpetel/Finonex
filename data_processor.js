const fs = require('fs');
const readline = require('readline');
const { Client } = require('pg');

// db configuration
const DB_HOST = 'localhost';
const DB_NAME = 'finonex';
const DB_USERNAME = 'postgres';
const DB_PASSWORD = 'postgres';
const DB_PORT = 5432;

// PostgreSQL database configuration
const client = new Client({
    user: DB_USERNAME,
    host: DB_HOST,
    database: DB_NAME,
    password: DB_PASSWORD,
    port: DB_PORT,
});
client.connect();

const SERVER_EVENTS_FILE_NAME = 'server-events.jsonl';

const rl = readline.createInterface({
    input: fs.createReadStream(SERVER_EVENTS_FILE_NAME),
    crlfDelay: Infinity
});

const userRevenueMap = new Map();

rl.on('line', (line) => {
    const event = JSON.parse(line);
    const userId = event.userId;
    const transactionType = event.name;
    const transactionAmount = event.value;

    if (!userRevenueMap.has(userId)) {
        userRevenueMap.set(userId, 0);
    }

    const currentRevenue = userRevenueMap.get(userId);
    let newRevenue = currentRevenue;

    if (transactionType === 'add_revenue') {
        newRevenue += transactionAmount;
    } else if (transactionType === 'subtract_revenue') {
        newRevenue -= transactionAmount;
    } else {
        console.error('Unknown transaction type:', transactionType);
        return;
    }

    userRevenueMap.set(userId, newRevenue);
});

rl.on('close', async () => {

    // update on db
    for (const [userId, revenue] of userRevenueMap) {
        try {
            // get current value
            const selectQuery = 'SELECT revenue FROM users_revenue WHERE user_id = $1';
            const { rows } = await client.query(selectQuery, [userId]);
            const currentRevenue = rows[0] ? rows[0].revenue : 0;

            // calculate final value
            const newRevenue = currentRevenue + revenue;

            // db update
            const updateQuery = 'INSERT INTO users_revenue (user_id, revenue) VALUES ($1, $2) ON CONFLICT (user_id) DO UPDATE SET revenue = $2';
            await client.query(updateQuery, [userId, newRevenue]);
            console.log(`Updated revenue for user ${userId} to ${newRevenue}`);
        } catch (error) {
            console.error(error);
        }
    }

    // clear the file since we just updated the db
    fs.writeFileSync(SERVER_EVENTS_FILE_NAME, '');

    // close connection
    client.end();
});
