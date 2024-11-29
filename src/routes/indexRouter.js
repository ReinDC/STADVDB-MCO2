const express = require('express')
//const router = express.Router()
// const controller = require('../controller/controller.js')

const router = express()
// GET endpoint to retrieve all games
router.get('/games', (req, res) => {
    dbNode1.query('SELECT * FROM more_Info', (error, results) => {
        if (error) {
            console.error('Database query error:', error);
            res.status(500).send('Database error');
        } else {
            // console.log(results)
            res.json(results);
        }
    });
});

router.get('/', (req, res) => {
    res.render("games", {
        title: "Front Page",
    })
});


module.exports = router