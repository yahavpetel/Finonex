# Server and Client

Follow these guidelines to set up Finonex events handler

## Creating the Database

1. Install PostgreSQL on your computer.
2. Download PgAdmin and install it too.
3. Open PgAdmin, create a database named 'finonex'.
4. Run create_db.sql

## Clone

1. Install Node.js from [nodejs.org](https://nodejs.org/).
2. Clone the repository.
3. Install dependencies: `npm install`.

## Client Configuration
Create a file called events.jsonl with events you want to send to the server.
Read more about jsonl format [here](https://jsonlines.org/)
Examples:
```
{ "userId": "user1", "name": "add_revenue", "value": 98 }
{ "userId": "user1", "name": "subtract_revenue", "value": 72 } 
{ "userId": "user2", "name": "add_revenue", "value": 70 }
{ "userId": "user1", "name": "add_revenue", "value": 1 }
{ "userId": "user2", "name": "subtract_revenue", "value": 12 }
```

## Running the Server

1. Start the server: `node server.js`.
2. The server will be running at `http://localhost:8000`.

## Running the Client

1. Run the client: `node client.js`.
2. The client will send an event to the server.

## Running the Data Processor
1. Run `node data_processor.js`
2. The data processor will process the events you sent and keep in the db the final revenue of each user.
