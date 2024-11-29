const express = require('express');
const mysql = require('mysql2'); 
require('dotenv').config();
const hbs = require('hbs');
const routes = require(`./src/routes/indexRouter.js`);
const conn = require(`./src/scripts/conn.js`);
const path = require('path');


const app = express();
app.use(express.json());
app.set('view engine', 'hbs');
app.use(express.static(path.join(__dirname, 'public')));

app.use(routes);

function createConnectionPool(host, port, user, password, database) {
    return mysql.createPool({
        host: host,
        port: port,
        user: user,
        password: password,
        database: database,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0 
    });
}

const hostName = 'ccscloud.dlsu.edu.ph';
const username = 'root'
const database = 'steam_games'

const nodes = [
    { port: 20602, password: process.env.node1password },
    { port: 20612, password: process.env.node23password },
    { port: 20622, password: process.env.node23password }
];

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

    console.log("Connected to " + poolName);
});


var port = process.env.PORT || 3000;

// Start the server
app.listen(port, function() {
    console.log(`Server: Running on http://localhost:${port}`);
});