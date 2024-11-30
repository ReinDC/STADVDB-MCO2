const gameController = require('../controllers/controller');
const { connectionPools } = require('../scripts/conn'); // Adjust the path to app.js if needed

const express = require('express');
const router = express();

router.use((req, res, next) => {
    const isolationLevel = req.query.isolationLevel || 'REPEATABLE READ'; // Default isolation level
    connectionPools.forEach(pool => {
        pool.query(`SET SESSION TRANSACTION ISOLATION LEVEL ${isolationLevel}`, (err) => {
            if (err) console.error('Error setting isolation level:', err);
        });
    });
    next();
});

router.get('/', gameController.getFrontPage)
router.get('/games', gameController.getGames);
router.get('/search/games', gameController.searchGames);
router.post('/recover', gameController.recoverNode);

module.exports = router;