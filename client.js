const fs = require('fs');
const axios = require('axios');

const CLIENT_EVENTS_FILE = 'events.jsonl';
const SERVER_ADDRESS = 'http://localhost:8000';
const SECRET_KEY = 'secret';

async function sendEventToServer(event) {
    try {
        const options = {
            method: 'POST',
            url: `${SERVER_ADDRESS}/liveEvent`,
            headers: {
                'Authorization': SECRET_KEY
            },
            data: event
        };

        const response = await axios(options);
        console.log(response.data);
    } catch (error) {
        console.error(error.response.data);
    }
}

async function main(){
    try {
        const eventsData = fs.readFileSync(CLIENT_EVENTS_FILE, 'utf8');
        const lines = eventsData.split(/\n/);

        for (const line of lines) {
            try {
                const event = JSON.parse(line);
                await sendEventToServer(event);
            } catch (error) {
                console.error('Error parsing event:', error);
            }
        }
    } catch (error) {
        console.error('Error reading file:', error);
    }
}

main();