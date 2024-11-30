const express = require('express');
const mysql = require('mysql2');
require('dotenv').config();
const hbs = require('hbs');
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
    { host: 'ccscloud.dlsu.edu.ph', port: 20602, user: 'root', password: process.env.node1password, database: 'steam_games' },
    { host: 'ccscloud.dlsu.edu.ph', port: 20612, user: 'root', password: process.env.node23password, database: 'steam_games' },
    { host: 'ccscloud.dlsu.edu.ph', port: 20622, user: 'root', password: process.env.node23password, database: 'steam_games' },
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

app.get('/games', (req, res) => {
    const sql = 'SELECT * FROM more_Info LIMIT 20'; // Add LIMIT to restrict the number of records

    connectionPools[0].query(sql, (error, results) => {
        if (error) {
            console.error('Database query error:', error);
            res.status(500).send('Database error');
        } else {
            res.json(results);
        }
    });
});

app.get('/search/games', (req, res) => {
    const searchName = req.query.name; // Get the 'name' query parameter

    if (!searchName) {
        return res.status(400).send('Game name query parameter is required.');
    }

    // SQL query with LIKE to search for the game name
    const sql = 'SELECT * FROM more_Info WHERE name LIKE ?';

    // Run the query
    connectionPools[0].query(sql, [`%${searchName}%`], (error, results) => {
        if (error) {
            console.error('Database query error:', error);
            res.status(500).send('Database error');
        } else {
            if (results.length === 0) {
                return res.status(404).send('No games found matching the search criteria.');
            }
            res.json(results);
        }
    });
});


app.get('/', (req, res) => {
    res.render("games", {
        title: "Front Page",
    });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server: Running on http://localhost:${PORT}`);
});