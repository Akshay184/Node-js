const express = require('express');

const router = express.Router();

router.get('/', (req, res, next) => {
    // console.log("In another middleware");
    res.send('<h1>Wow I make it!!!</h1>');
});

module.exports = router;