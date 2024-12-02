const gameController = require('../controllers/controller');
const { connectionPools } = require('../scripts/conn'); // Adjust the path to app.js if needed

const express = require('express');
const router = express();

// Middleware to set transaction isolation level
router.use((req, res, next) => {
    const isolationLevel = req.query.isolationLevel || 'REPEATABLE READ'; // Default isolation level
    connectionPools.forEach(pool => {
        pool.query(`SET SESSION TRANSACTION ISOLATION LEVEL ${isolationLevel}`, (err) => {
            if (err) console.error('Error setting isolation level:', err);
        });
    });
    next();
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