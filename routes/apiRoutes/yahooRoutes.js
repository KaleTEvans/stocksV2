const fetch = require('node-fetch');
require('dotenv').config();

const router = require('express').Router();

// get yahoo data for a ticker
router.get('/yahoo/:id', (req, res) => {
    const urlStart = 'https://apidojo-yahoo-finance-v1.p.rapidapi.com/stock/v2/get-summary?symbol=';
    const urlTicker = req.params.id;
    const urlEnd = '&region=US';
    const apiId = process.env.DB_YAHOO;

    const apiUrl = urlStart + urlTicker + urlEnd;

    fetch(apiUrl, {
        'headers': {
            'x-rapidapi-key': `${apiId}`,
            'x-rapidapi-host': "apidojo-yahoo-finance-v1.p.rapidapi.com"
        }
    })
    .then(res => res.json())
    .then(data => {
        res.send({ data });
    })
    .catch(err => {
        console.log(err);
    });
})

module.exports = router;