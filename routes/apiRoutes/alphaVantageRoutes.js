const fetch = require('node-fetch');
require('dotenv').config();

const router = require('express').Router();

// qqq index price
router.get('/alphaIndex', (req, res) => {
    const baseUrl = "https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=QQQ&apikey=";
    const apiId = process.env.DB_ALPHAVANTAGE;

    const apiUrl = baseUrl + apiId;

    fetch(apiUrl)
    .then(res => res.json())
    .then(data => {
        res.send({ data });
    })
    .catch(err => {
        console.log(err);
    });
});

module.exports = router;