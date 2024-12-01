const { connectionPools } = require('../scripts/conn.js'); // Import your connection pools

// GET: List of games
exports.getGames = (req, res) => {
    const sql = 'SELECT * FROM more_Info LIMIT 20';

    connectionPools[0].query(sql, (error, results) => {
        if (error) {
            console.error('Database query error:', error);
            res.status(500).send('Database error');
        } else {
            res.json(results);
        }
    });
};

exports.getFrontPage = (req, res) => {
    res.render("games", {
        title: "Front Page",
    });
}

exports.updateQuery = async (req, res) => {
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
};


// GET: Search games by name
exports.searchGames = (req, res) => {
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
exports.recoverNode = (req, res) => {
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
};






