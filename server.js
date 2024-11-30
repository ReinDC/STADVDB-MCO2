const express = require('express');
const mysql = require('mysql2');
require('dotenv').config();
const hbs = require('hbs');
const routes = require('./src/routes/indexRouter.js');
const conn = require('./src/scripts/conn.js');
const path = require('path');

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

// Create MySQL connection pool for each node
const nodes = [
    { host: 'ccscloud.dlsu.edu.ph', port: 20602, user: 'root', password: process.env.NODE1_PASSWORD, database: 'steam_games' },
    { host: 'ccscloud.dlsu.edu.ph', port: 20612, user: 'root', password: process.env.NODE2_PASSWORD, database: 'steam_games_node2' },
    { host: 'ccscloud.dlsu.edu.ph', port: 20622, user: 'root', password: process.env.NODE3_PASSWORD, database: 'steam_games_node3' },
];

const connectionPools = nodes.map((node) =>
    mysql.createPool({
        host: node.host,
        port: node.port,
        user: node.user,
        password: node.password,
        database: node.database,
        waitForConnections: true,
        connectionLimit: 10,
    })
);

// Concurrency control middleware
app.use((req, res, next) => {
    const isolationLevel = req.query.isolationLevel || 'REPEATABLE READ'; // Default isolation level
    connectionPools.forEach(pool => {
        pool.query(`SET SESSION TRANSACTION ISOLATION LEVEL ${isolationLevel}`, (err) => {
            if (err) console.error('Error setting isolation level:', err);
        });
    });
    next();
});

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

// Crash recovery simulation
app.post('/recover', (req, res) => {
    const failedNodeIndex = req.body.failedNodeIndex;
    const transactionLog = req.body.transactionLog;

    if (failedNodeIndex !== undefined && transactionLog) {
        const pool = connectionPools[failedNodeIndex];
        transactionLog.forEach((query) => {
            pool.query(query, (err) => {
                if (err) console.error(`Recovery failed for Node ${failedNodeIndex + 1}:`, err);
                else console.log(`Recovered transaction: ${query}`);
            });
        });
        res.status(200).send(`Node ${failedNodeIndex + 1} recovered.`);
    } else {
        res.status(400).send('Invalid recovery request.');
    }
});

// Route integration
app.use(routes);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});