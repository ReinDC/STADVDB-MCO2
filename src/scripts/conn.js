const mysql = require('mysql2');
require('dotenv').config();

// Define your nodes and create the connection pools
const nodes = [
    { host: 'ccscloud.dlsu.edu.ph', port: 20602, user: 'root', password: process.env.node1password, database: 'steam_games', isMaster: true }, // Node 1 as Master
    { host: 'ccscloud.dlsu.edu.ph', port: 20612, user: 'root', password: process.env.node23password, database: 'steam_games', isMaster: false }, // Node 2 as Slave
    { host: 'ccscloud.dlsu.edu.ph', port: 20622, user: 'root', password: process.env.node23password, database: 'steam_games', isMaster: false }, // Node 3 as Slave
];

// Create connection pools for each node
const connectionPools = nodes.map((node) =>
    mysql.createPool({
        host: node.host,
        port: node.port,
        user: node.user,
        password: node.password,
        database: node.database,
        waitForConnections: true,
        connectionLimit: 10,
        // Optional: add a flag or additional configuration for master/slave handling if needed
    })
);



async function queryNodeDelay(nodenum, query, values) {
    let node;
    try {
        node = await connectionPools[nodenum - 1].getConnection();
        await node.beginTransaction();

        console.log("⏳Executing Query:", query);
        
        const [results] = await node.query(query, values);

        // Simulate dirty read with delay
        console.log(`Simulating dirty read with delay for UPDATE query: ${query}`);
        await new Promise(resolve => setTimeout(resolve, 10000));

        await node.commit();
        console.log("Transaction committed successfully.", query);
        return results;
    } catch (err) {
        console.error("Transaction Error:", err);

        try {
            await node.rollback();
            console.log("Transaction rolled back successfully.");
        } catch (rollbackErr) {
            console.error("Rollback Error:", rollbackErr);
        }
        throw err;
    } finally {
        if (node) {
            node.release();
        }
    }
}

async function isAvailable(node_num) {
    try {
        // Ensure you're using the promise-based query
        await connectionPools[node_num - 1].promise().query("SELECT 1");
        return true;
    } catch (err) {
        console.error(`Node ${node_num} is unavailable:`);
        return false;
    }
}


// Export connection pools
module.exports = { connectionPools, queryNodeDelay, isAvailable};
