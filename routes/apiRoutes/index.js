const router = require('express').Router();
const stockNewsRoutes = require('../apiRoutes/stockNewsRoutes');
const alphaVantageRoutes = require('../apiRoutes/alphaVantageRoutes');
const yahooRoutes = require('../apiRoutes/yahooRoutes');

router.use(stockNewsRoutes);
router.use(alphaVantageRoutes);
router.use(yahooRoutes);

module.exports = router;