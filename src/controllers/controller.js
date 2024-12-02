const { connectionPools, isAvailable} = require('../scripts/conn'); // Assuming you have a file that exports these

// Function to replicate the update to the appropriate slave node
const updateToSlave = (gameId, newTitle, nodeNum) => {
    return new Promise((resolve, reject) => {
        const sql = 'UPDATE more_Info SET name = ? WHERE AppId = ?';
        const params = [newTitle, gameId];

        // Use the correct connection pool based on the node number (Node 2 or Node 3)
        connectionPools[nodeNum - 1].query(sql, params, (error, results) => {
            if (error) {
                console.error(`Error replicating to Node ${nodeNum}:`, error);
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

    getGames: (req, res) => {
        const sql = 'SELECT * FROM more_Info LIMIT 20';

        connectionPools[0].query(sql, (error, results) => {
            if (error) {
                console.error('Database query error:', error);
                res.status(500).send('Database error');
            } else {
                res.json(results);
            }
        });
    },

    deleteGame: (req, res) => {
        const { appID } = req.params;
        const { releaseYear } = req.body;
        
        if (!appID) {
            return res.status(400).json({ error: "'appID' is required." });
        }
    
        const sql = 'DELETE FROM more_Info WHERE AppId = ?';
        const params = [appID];
    
        connectionPools[0].query(sql, params, async (error, results) => {
            if (error) {
                console.error('Database query error:', error);
                res.status(500).json({ error: 'An error occurred while deleting the game.' });
            } else if (results.affectedRows > 0) {
                try {
                    if (releaseYear < 2010) {
                        // Replicate to Node 2 (games before 2010)
                        await deleteToSlave(appID, 2);
                    } else {
                        // Replicate to Node 3 (games after 2010)
                        await deleteToSlave(appID, 3);
                    }
                    res.json({ message: 'Game title deleted successfully.' });
                } catch (replicationError) {
                    console.error('Error replicating to slave:', replicationError);
                    return res.status(500).json({ error: 'Error replicating the update to slave node.' });
                }
                res.json({ message: 'Game deleted successfully.' });
            } else {
                res.status(404).json({ error: 'Game not found.' });
            }
        });
    },    

    searchConcurrent: (req, res) =>{
        const searchName = 'Counter-Strike';
        const sql = 'SELECT * FROM more_Info WHERE name LIKE ?';
    
        
        for (let n = 0; n < connectionPools.length; n++) {
            connectionPools[n].query(sql, [`%${searchName}%`], (error, results) => {
                if (error) {
                    console.log('Database query error:', error);
                } else {
                    if (results.length === 0) {
                        return console.log('No games found matching the search criteria.');
                    }
                    console.log(results);
                }
            });
        }
    },

    updateGameTitle: (req, res) => { // Correctly assign the function as a property
        const { name } = req.body;
        const { appID } = req.params;
        const { releaseYear } = req.body;
    
        if (!name || !appID) {
            return res.status(400).json({ error: "Both 'name' and 'appID' are required." });
        }
    
        const sql = 'UPDATE more_Info SET name = ? WHERE AppId = ?';
        const params = [name, appID];
    
        connectionPools[0].query(sql, params, async (error, results) => {
            if (error) {
                console.error('Database query error:', error);
                res.status(500).json({ error: 'An error occurred while updating the game title.' });
            } else if (results.affectedRows > 0) {
                try {
                    if (releaseYear < 2010) {
                        // Replicate to Node 2 (games before 2010)
                        await updateToSlave(appID, name, 2);
                    } else {
                        // Replicate to Node 3 (games after 2010)
                        await updateToSlave(appID, name, 3);
                    }
                    res.json({ message: 'Game title updated successfully.' });

                } catch (replicationError) {
                    console.error('Error replicating to slave:', replicationError);
                    return res.status(500).json({ error: 'Error replicating the update to slave node.' });
                }
            } else {
                res.status(404).json({ error: 'Game not found.' });
            }
        });
    },

    searchGames: (req, res) => {
        const searchName = req.query.name;

        if (!searchName) {
            return res.status(400).send('Game name query parameter is required.');
        }

        const sql = 'SELECT * FROM more_Info WHERE name LIKE ?';

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
    },

    recoverNode: (req, res) => {
        const { failedNodeIndex, transactionLog } = req.body;

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
    appIDSearch: async (req, res) => {
        // Validate if AppId is provided and is of correct format
        const { AppId } = req.query; // Use req.query since AppId is in the URL query string
        if (!AppId) {
            return res.status(400).send('AppId is required.');
        }
    
        const sql = 'SELECT * FROM more_Info WHERE AppID = ?';
        const params = [AppId];
    
        connectionPools[0].query(sql, params, (error, results) => {
            if (error) {
                console.error('Database query error:', error);
                return res.status(500).send('Internal server error');
            }
    
            if (results.length === 0) {
                return res.status(404).send('No games found matching the search criteria.');
            }
    
            res.json(results); // Return results as JSON response
        });
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
                res.sendStatus(200);  // Node is available
            } else {
                res.sendStatus(401);  // Node is unavailable
            }
        } catch (error) {
            console.error("Error checking node availability:", error);  // Log the error for debugging
            res.status(500).json({ error: "Internal Server Error" });  // Return a more descriptive error
        }
    }
    ,    
}


module.exports = gameController;