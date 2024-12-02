const gameController = require('../controllers/controller');
const { connectionPools } = require('../scripts/conn'); // Adjust the path to conn.js if needed

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

<<<<<<< Updated upstream
router.get('/', gameController.getFrontPage)
router.get('/games', gameController.getGames);
router.get('/search/games', gameController.searchGames);

router.post('/recover', gameController.recoverNode);
=======
// Routes
router.get('/', gameController.getFrontPage); // Front page route
router.get('/games', gameController.getGames); // Retrieve all games
router.get('/search/games', gameController.searchGames); // Search for games by name
router.post('/recover', gameController.recoverNode); // Recover failed node

// New route to update a game's title
router.put('/games/:appID', gameController.updateGameTitle); // Update game title by AppID
>>>>>>> Stashed changes

module.exports = router;