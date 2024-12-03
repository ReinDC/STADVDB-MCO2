const gameController = require('../controllers/controller');
const { connectionPools, isAvailable } = require('../scripts/conn'); // Adjust the path to app.js if needed

const express = require('express');
const router = express();

// Middleware to set transaction isolation level
router.use(async (req, res, next) => {
    const isolationLevel = req.query.isolationLevel || 'REPEATABLE READ';
    
    const maxRetries = 3;

    // Function to check if a node is available before proceeding
    async function setIsolationLevelWithRetry(pool, nodeNumber, retries = 0) {
        if (!await isAvailable(nodeNumber)) {
            console.log(`Node ${nodeNumber} is unavailable, skipping...`);
            return; // Skip this node if it's not available
        }

        try {
            await pool.promise().query(`SET SESSION TRANSACTION ISOLATION LEVEL ${isolationLevel}`);
            console.log(`Isolation level set to ${isolationLevel} for pool ${nodeNumber}.`);
        } catch (err) {
            if (retries < maxRetries) {
                console.log(`Retrying setting isolation level for node ${nodeNumber}... Attempt ${retries + 1}`);
                await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
                await setIsolationLevelWithRetry(pool, nodeNumber, retries + 1); // Retry
            } else {
                console.error(`Failed to set isolation level for node ${nodeNumber} after ${maxRetries} attempts:`, err);
                return res.status(500).send(`Failed to set isolation level for node ${nodeNumber}`);
            }
        }
    }

    const promises = connectionPools.map((pool, index) => setIsolationLevelWithRetry(pool, index + 1)); // Pass the node number (index + 1)

    // Wait for all retry attempts to finish
    await Promise.all(promises);
    next();  // Proceed to the next middleware or route handler
});


// Routes
router.get('/', gameController.getFrontPage); // Front page route
router.get('/games', gameController.getGames); // Get all games
router.get('/search/games', gameController.searchGames); // Search games by name
router.put('/games/:appID', gameController.updateGameTitle); // Update game title
router.delete('/games/:appID', gameController.deleteGame)
router.post('/recover', gameController.recoverNode); // Recover node
router.post('/check-node', gameController.isNodeAvail)
router.get('/search/case1', gameController.searchConcurrent); // Search a game concurrently
router.put('/search/case2', gameController.edit_searchConcurrent); // Search and Edit a game concurrently

module.exports = router;