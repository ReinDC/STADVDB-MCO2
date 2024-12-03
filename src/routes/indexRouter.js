const gameController = require('../controllers/controller');
const { connectionPools } = require('../scripts/conn'); // Adjust the path to app.js if needed

const express = require('express');
const router = express();

// Middleware to set transaction isolation level
router.use(async (req, res, next) => {
    const isolationLevel = req.query.isolationLevel || 'REPEATABLE READ';
    
    const maxRetries = 3;
    
    async function setIsolationLevelWithRetry(pool, retries = 0) {
        try {
            await pool.promise().query(`SET SESSION TRANSACTION ISOLATION LEVEL ${isolationLevel}`);
            console.log(`Isolation level set to ${isolationLevel} for pool.`);
            
            // Log success after setting the isolation level
            console.log(`Successfully set isolation level for pool.`);
        } catch (err) {
            if (retries < maxRetries) {
                console.log(`Retrying setting isolation level... Attempt ${retries + 1}`);
                await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
                await setIsolationLevelWithRetry(pool, retries + 1); // Retry
            } else {
                console.error(`Failed to set isolation level after ${maxRetries} attempts:`, err);
                return res.status(500).send('Failed to set isolation level');
            }
        }
    }
    
    const promises = connectionPools.map(pool => setIsolationLevelWithRetry(pool));
    
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

module.exports = router;