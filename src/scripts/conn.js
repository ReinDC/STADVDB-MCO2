const mysql = require('mysql2');
require('dotenv').config();

// Define your nodes and create the connection pools
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

// Export connection pools
module.exports = { connectionPools };