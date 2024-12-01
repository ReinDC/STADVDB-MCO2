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
        await connectionPools[node_num - 1].query("SELECT 1");
        return true;
    } catch (err) {
        console.error(`Node ${node_num} is unavailable:`, err);
        return false;
    }
}

// Export connection pools
module.exports = { connectionPools, queryNodeDelay, isAvailable};
