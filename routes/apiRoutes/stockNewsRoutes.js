const fetch = require('node-fetch');
require('dotenv').config();

const router = require('express').Router();

// general news sentiment
router.get('/stockNews', (req, res) => {
    const baseUrl = 'https://stocknewsapi.com/api/v1/category?section=general&items=50&token=';
    const apiId = process.env.DB_STOCKNEWS;

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

// sentiment over last 30 days
router.get('/stockNews/pastSentiment', (req, res) => {
    const baseUrl = 'https://stocknewsapi.com/api/v1/stat?&section=alltickers&date=last30days&token=';
    const apiId = process.env.DB_STOCKNEWS;

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

// top sentiment last 7 days
router.get('/stockNews/topPicks', (req, res) => {
    const baseUrl = 'https://stocknewsapi.com/api/v1/top-mention?&date=last7days&token=';
    const apiId = process.env.DB_STOCKNEWS;

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

// general market news
router.get('/stockNews/genNews', (req, res) => {
    const baseUrl = 'https://stocknewsapi.com/api/v1/category?section=general&items=50&token=';
    const apiId = process.env.DB_STOCKNEWS;

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

// stock news for one ticker
router.get('/stockNews/:id', (req, res) => {
    const urlStart = 'https://stocknewsapi.com/api/v1?tickers=';
    const urlTicker = req.params.id;
    const urlEnd = '&items=50&token=';
    const apiId = process.env.DB_STOCKNEWS;

    const apiUrl = urlStart + urlTicker + urlEnd + apiId;

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