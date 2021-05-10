const fetch = require('node-fetch');
require('dotenv').config();

const router = require('express').Router();

// alpha vantage time series for ticker
router.get('/alphaIndex/:id', (req, res) => {
    const baseUrl = "https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=";
    const ticker = req.params.id;
    const apiId = `&apikey=${process.env.DB_ALPHAVANTAGE}`;

    const apiUrl = baseUrl + ticker + apiId;

    fetch(apiUrl)
    .then(res => res.json())
    .then(data => {
        res.send({ data });
    })
    .catch(err => {
        console.log(err);
    });
});

// alpha vantage tech indicators
router.get('/alphaIndex/:indicator/:ticker/:interval/:timePeriod/:series', (req, res) => {
    const baseUrl = `https://www.alphavantage.co/query?function=`;
    const indicator = req.params.indicator;
    const ticker = `&symbol=${req.params.ticker}`;
    const interval = `&interval=${req.params.interval}`;
    const timePeriod = `&time_period=${req.params.timePeriod}`;
    const series = `&series_type=${req.params.series}`;
    const apiId = `&apikey=${process.env.DB_ALPHAVANTAGE}`;

    const apiUrl = baseUrl + indicator + ticker + interval + timePeriod
                    + series + apiId;

    fetch(apiUrl)
    .then(res => res.json())
    .then(data => {
        res.send({ data });
    })
    .catch(err => {
        console.log(err);
    });
})

module.exports = router;