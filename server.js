const express = require('express');
const mysql = require('mysql2');
require('dotenv').config();
const hbs = require('hbs');
const path = require('path');

const gameRouter = require('./src/routes/indexRouter');


// Create Express app
const app = express();
app.use(express.json());
app.set('view engine', 'hbs');
app.use(express.static(path.join(__dirname, 'public')));

// Global middleware for concurrency control
app.use((req, res, next) => {
    req.transactionLogs = []; // Track transaction logs
    next();
});

app.use(gameRouter);

// Data replication logic
const replicateData = (query, callback) => {
    connectionPools.forEach((pool, index) => {
        pool.query(query, (err, results) => {
            if (err) {
                console.error(`Replication failed on Node ${index + 1}:`, err);
            } else {
                console.log(`Data replicated successfully on Node ${index + 1}`);
            }
            if (callback) callback(err, results);
        });
    });
};


// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server: Running on http://localhost:${PORT}`);
});