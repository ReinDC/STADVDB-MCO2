const mysql = require('mysql2');

// Function to create connection pools for multiple nodes
function createConnectionPools(hostName, nodes, username, database) {
    const pools = {};

    nodes.forEach((node, index) => {
        const poolName = `poolNode${index + 1}`; 
        pools[poolName] = createConnectionPool(
            hostName, 
            node.port, 
            username, 
            node.password, 
            database
        );
    });

    return pools;
}

// Function to create a single connection pool
function createConnectionPool(host, port, user, password, database) {
    return mysql.createPool({
        host: host,
        port: port,
        user: user,
        password: password,
        database: database,
        waitForConnections: true,
        connectionLimit: 10, // Maximum number of connections in the pool
        queueLimit: 0 // No limit on the number of requests waiting for a connection
    });
}

// Example usage for creating pools and exporting them
const hostName = 'ccscloud.dlsu.edu.ph';
const nodes = [
    { port: 20602, password: process.env.node1password },
    { port: 20612, password: process.env.node23password },
    { port: 20622, password: process.env.node23password }
];
const username = 'root';
const database = 'steam_games';

// Create pools
const pools = createConnectionPools(hostName, nodes, username, database);

// Export the pools object
module.exports = pools;
