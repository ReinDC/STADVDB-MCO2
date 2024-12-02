<<<<<<< Updated upstream
const { connectionPools, executeUpdate, nodes } = require('../scripts/conn'); // Assuming you have a file that exports these

=======
const { connectionPools } = require('../scripts/conn.js'); // Import your connection pools

// GET: Retrieve games
const getGames = (req, res) => {
    const sql = 'SELECT * FROM more_Info LIMIT 20';
>>>>>>> Stashed changes


<<<<<<< Updated upstream

const gameController = {
    getFrontPage: async (req, res) => {
        res.render("games", {
            title: "Front Page",
=======
// GET: Front page view
const getFrontPage = (req, res) => {
    res.render("games", {
        title: "Front Page",
    });
};

// PUT: Update game title
const updateGameTitle = (req, res) => {
    const { name } = req.body;
    const { appID } = req.params;

    if (!name || !appID) {
        return res.status(400).json({ error: "Both 'name' and 'appID' are required." });
    }

    const sql = 'UPDATE more_Info SET name = ? WHERE AppId = ?';
    const params = [name, appID];

    connectionPools[0].query(sql, params, (error, results) => {
        if (error) {
            console.error('Error updating game title:', error);
            return res.status(500).json({ error: 'An error occurred while updating the game title.' });
        }

        if (results.affectedRows > 0) {
            res.json({ message: 'Game title updated successfully.' });
        } else {
            res.status(404).json({ error: 'Game not found.' });
        }
    });
};

module.exports = {
    // Other exported functions
    updateGameTitle,
};

// GET: Search games by name
const searchGames = (req, res) => {
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
};

// POST: Recover failed node
const recoverNode = (req, res) => {
    const { failedNodeIndex, transactionLog } = req.body;

    if (failedNodeIndex !== undefined && transactionLog) {
        const pool = connectionPools[failedNodeIndex];
        transactionLog.forEach((query) => {
            pool.query(query, (err) => {
                if (err) console.error(`Recovery failed for Node ${failedNodeIndex + 1}:`, err);
                else console.log(`Recovered transaction: ${query}`);
            });
>>>>>>> Stashed changes
        });
    },

<<<<<<< Updated upstream
    getGames: (req, res) => {
        const sql = 'SELECT * FROM more_Info LIMIT 20';
    
        connectionPools[0].query(sql, (error, results) => {
            if (error) {
                console.error('Database query error:', error);
                res.status(500).send('Database error');
=======
// CHECK: Node availability based on server and year
const checkNodes = async (server_num, year) => {
    if (server_num == 1) {
        if (await nodes.isAvailable(server_num)) {
            return 1;
        } else {
            if (year < 2020 && (await nodes.isAvailable(2))) {
                return 2;
            } else if (year >= 2020 && (await nodes.isAvailable(3))) {
                return 3;
>>>>>>> Stashed changes
            } else {
                res.json(results);
            }
        });
    },    
    
    updateQuery: async (req, res) => {
        const { name, AppId } = req.body; // assuming these are sent in the request body
    
        const updateQuery = 'UPDATE more_Info SET name = ? WHERE AppId = ?';
        const params = [name, AppId];
    
        try {
            const result = await executeUpdate(updateQuery, params);
            if (result.affectedRows > 0) {
                res.json({ message: 'User name updated successfully' });
            } else {
                res.status(404).json({ error: 'User not found' });
            }
        } catch (error) {
            res.status(500).json({ error: 'An error occurred while updating the user name' });
        }
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
}

<<<<<<< Updated upstream

module.exports = gameController;
=======
// Export all functions
module.exports = {
    getGames,
    getFrontPage,
    updateGameTitle,
    searchGames,
    recoverNode,
    checkNodes
};
>>>>>>> Stashed changes
