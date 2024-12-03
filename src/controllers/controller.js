const { connectionPools, isAvailable} = require('../scripts/conn'); // Assuming you have a file that exports these

// Logs for recovery transactions to store and replay later
let transactionLogs = {
    1: [],  // Transaction logs for Node 1
    2: [],  // Transaction logs for Node 2
    3: [],  // Transaction logs for Node 3
};

// Function to retry database operations if a node is unavailable
const retryQuery = async (sql, params, attempts = 5, delay = 3000, nodeNum) => {
    let attempt = 0;
    while (attempt < attempts) {
        try {
            // Attempt the query using the specified connection pool
            const results = await new Promise((resolve, reject) => {
                connectionPools[nodeNum - 1].query(sql, params, (error, results) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(results);
                    }
                });
            });

            // Log success after successful retry
            console.log(`Successfully executed query on Node ${nodeNum} after ${attempt + 1} attempt(s):`, sql);

            return results;
        } catch (error) {
            attempt++;
            if (attempt >= attempts) {
                throw new Error(`Failed after ${attempts} attempts: ${error.message}`);
            }
            console.log(`Retrying... Attempt ${attempt + 1} of ${attempts}`);
            await new Promise(resolve => setTimeout(resolve, delay)); // Wait before retrying
        }
    }
};

// Function to replicate the update to the appropriate slave node
const updateToSlave = (gameId, newTitle, nodeNum) => {
    return new Promise((resolve, reject) => {
        const sql = 'UPDATE more_Info SET name = ? WHERE AppId = ?';
        const params = [newTitle, gameId];

        // Use the correct connection pool based on the node number (Node 2 or Node 3)
        connectionPools[nodeNum - 1].query(sql, params, (error, results) => {
            if (error) {
                console.error(`Error replicating to Node ${nodeNum}:`, error);
                
                // Log the failed transaction for recovery
                transactionLogs[nodeNum].push({ sql, params });

                reject(error);  // Reject the promise if the replication fails
            } else {
                console.log(`Replicated to Node ${nodeNum}:`, results);
                resolve(results);  // Resolve the promise if the replication succeeds
            }
        });
    });
};

const deleteToSlave = (appID, nodeNum) => {
    return new Promise((resolve, reject) => {
        const sql = 'DELETE FROM more_Info WHERE AppId = ?';
        const params = [appID];

        // Use the correct connection pool based on the node number (Node 2 or Node 3)
        connectionPools[nodeNum - 1].query(sql, params, (error, results) => {
            if (error) {
                console.error(`Error replicating to Node ${nodeNum}:`, error);

                // Log the failed transaction for recovery
                transactionLogs[nodeNum].push({ sql, params });

                reject(error);  // Reject the promise if the replication fails
            } else {
                console.log(`Replicated to Node ${nodeNum}:`, results);
                resolve(results);  // Resolve the promise if the replication succeeds
            }
        });
    });
};

const gameController = {
    getFrontPage: async (req, res) => {
        res.render("games", {
            title: "Front Page",
        });
    },

    getGames: async (req, res) => {
        
        const sql = 'SELECT * FROM more_Info LIMIT 20';
        const { nodeNum } = req.query; // Access query parameters here
        try {
            // Retry logic
            const results = await retryQuery(sql, [], 5, 3000, nodeNum); // Retry logic applied to query
            res.json(results);
        } catch (error) {
            console.error('Database query error:', error);
            res.status(500).send('Database error');
        }
    },

    deleteGame: async (req, res) => {
        const { appID } = req.params;
        const { releaseYear } = req.body;
    
        if (!appID) {
            return res.status(400).json({ error: "'appID' is required." });
        }
    
        const sql = 'DELETE FROM more_Info WHERE AppId = ?';
        const params = [appID];
    
        try {
            // Retry logic added
            const results = await retryQuery(sql, params, 5, 3000, 1); // Retry logic applied to query
    
            if (results.affectedRows > 0) {
                try {
                    // If replication to slave node fails, log the failed transaction for recovery later
                    if (releaseYear < 2010) {
                        await deleteToSlave(appID, 2); // Replication to Node 2
                    } else {
                        await deleteToSlave(appID, 3); // Replication to Node 3
                    }
                    res.json({ message: 'Game deleted successfully.' });
                } catch (replicationError) {
                    console.error('Error replicating to slave:', replicationError);
                    return res.status(500).json({ error: 'Error replicating the delete to slave node.' });
                }
            } else {
                res.status(404).json({ error: 'Game not found.' });
            }
        } catch (error) {
            console.error('Database query error:', error);
            res.status(500).json({ error: 'An error occurred while deleting the game.' });
        }
    },    

    searchConcurrent: async (req, res) =>{
        const sql = 'SELECT * FROM more_Info WHERE AppId = 20';

        for (let n = 0; n < connectionPools.length; n++) {
            // get the current time as a string
            const currentTime = Date.now();
            console.log('Timestamp (ms): ' + currentTime);

            // get the execution time
            console.time('Execution Time of Node ' + (n+1));
            connectionPools[n].query(sql, (error, results) => {
                if (error) {
                    console.log('Database query error:', error);
                } else {
                    if (results.length === 0) {
                        return console.log('No games found matching the search criteria for Node ' + (n + 1));
                    }
                    console.log("Node " + (n + 1));
                    console.log(results);
                }
            });
            console.timeEnd('Execution Time of Node ' + (n+1));
        }
        res.status(200).send(`Case 1 Concurrency successful. Check console log.`);
    },

    edit_searchConcurrent: async (req, res) =>{
        const { name } = req.body;

        const edit_sql = 'UPDATE more_Info SET name = ? WHERE AppId = 10';
        const search_sql = 'SELECT * FROM more_Info WHERE AppId = 10';

        for (let n = 0; n < connectionPools.length; n++) {
            // get the current time as a string
            const currentTime = Date.now();
            console.log('Timestamp (ms): ' + currentTime);

            // get the execution time
            console.time('Execution Time of Node ' + (n+1));

            if (n==0) { //Node 1 performs edit
                connectionPools[n].query(edit_sql, name, (error, results) => {
                    if (error) {
                        console.log('Database query error:', error);
                    } else {
                        if (results.length === 0) {
                            return console.log('No games found matching the search criteria for Node ' + (n+1));
                        }
                        console.log("Node " + (n+1));
                        console.log(results);
                    }
                });
                console.timeEnd('Execution Time of Node ' + (n+1));
                await updateToSlave(10, name, 2);   //Replicate to Node 2
            }
            else {  //Node 2 and 3 performs search
                connectionPools[n].query(search_sql, (error, results) => {
                    if (error) {
                        console.log('Database query error:', error);
                    } else {
                        if (results.length === 0) {
                            return console.log('No games found matching the search criteria for Node ' + (n+1));
                        }
                        console.log("Node " + (n+1));
                        console.log(results);
                    }
                });
                console.timeEnd('Execution Time of Node ' + (n+1));
            }    
        }
        res.json({ message: 'Case 2 Concurrency successful. Check console log.' });
    },

    updateGameTitle: async (req, res) => {
        const { name } = req.body;
        const { appID } = req.params;
        const { releaseYear } = req.body;
    
        if (!name || !appID) {
            return res.status(400).json({ error: "Both 'name' and 'appID' are required." });
        }
    
        const sql = 'UPDATE more_Info SET name = ? WHERE AppId = ?';
        const params = [name, appID];
    
        try {
            // **Retry logic added here**
            const results = await retryQuery(sql, params, 5, 3000, 1); // Retry logic applied to query
    
            if (results.affectedRows > 0) {
                try {
                    // If replication to slave node fails, log the failed transaction for recovery later
                    if (releaseYear < 2010) {
                        await updateToSlave(appID, name, 2); // Replication to Node 2
                    } else {
                        await updateToSlave(appID, name, 3); // Replication to Node 3
                    }
                    res.json({ message: 'Game title updated successfully.' });
                } catch (replicationError) {
                    console.error('Error replicating to slave:', replicationError);
                    return res.status(500).json({ error: 'Error replicating the update to slave node.' });
                }
            } else {
                res.status(404).json({ error: 'Game not found.' });
            }
        } catch (error) {
            console.error('Database query error:', error);
            res.status(500).json({ error: 'An error occurred while updating the game title.' });
        }
    },

    searchGames: async (req, res) => {
        const searchName = req.query.name;
    
        if (!searchName) {
            return res.status(400).send('Game name query parameter is required.');
        }
    
        const sql = 'SELECT * FROM more_Info WHERE name LIKE ?';
    
        try {
            // **Retry logic added here**
            const results = await retryQuery(sql, [`%${searchName}%`], 5, 3000, 1); // Retry logic applied to query
            if (results.length === 0) {
                return res.status(404).send('No games found matching the search criteria.');
            }
            res.json(results);
        } catch (error) {
            console.error('Database query error:', error);
            res.status(500).send('Database error');
        }
    },

    recoverNode: (req, res) => {
        const { failedNodeIndex, transactionLog } = req.body;

        if (failedNodeIndex !== undefined && transactionLog) {
            const pool = connectionPools[failedNodeIndex];

            transactionLog.forEach((query) => {
                pool.query(query.sql, query.params, (err) => {
                    if (err) console.error(`Recovery failed for Node ${failedNodeIndex + 1}:`, err);
                    else console.log(`Recovered transaction: ${query.sql}`);
                });
            });

            // Clear log for this node after recovery
            transactionLogs[failedNodeIndex] = [];
            res.status(200).send(`Node ${failedNodeIndex + 1} recovered.`);
        } else {
            res.status(400).send('Invalid recovery request.');
        }
    },

    checkNodes: async (server_num, year) => {
        if (server_num == 1) {
            if (await nodes.isAvailable(server_num)) {
                return 1;
            } else {
                if (year < 2020 && (await nodes.isAvailable(2))) {
                    return 2;
                } else if (year >= 2020 && (await nodes.isAvailable(3))) {
                    return 3;
                } else {
                    return 0;
                }
            }
        } else {
            if (await nodes.isAvailable(server_num)) {
                return server_num;
            } else {
                if (await nodes.isAvailable(1)) {
                    return 1;
                } else {
                    return 0;
                }
            }
        }
    },
    isNodeAvail: async (req, res) => {
        const { nodeNum } = req.body;
    
        // Validate nodeNum (should be a number between 1 and 3)
        if (!nodeNum || nodeNum < 1 || nodeNum > 3) {
            return res.status(400).json({
                error: 'Invalid node number. Please provide a value between 1 and 3.'
            });
        }
    
        try {
            const available = await isAvailable(nodeNum);
    
            // If node is available, return 200, else return 401
            if (available) {
                return res.sendStatus(200);  // Node is available
            } else {
                return res.sendStatus(401);  // Node is unavailable
            }
        } catch (error) {
            console.error("Error checking node availability:", error);  // Log the error for debugging
            if (!res.headersSent) {  // Make sure a response is not already sent
                return res.status(500).json({ error: "Internal Server Error" });  // Return a more descriptive error
            }
        }
    }
}


module.exports = gameController;