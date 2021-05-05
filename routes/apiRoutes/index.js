const router = require('express').Router();
const stockNewsRoutes = require('../apiRoutes/stockNewsRoutes');
const alphaVantageRoutes = require('../apiRoutes/alphaVantageRoutes');

router.use(stockNewsRoutes);
router.use(alphaVantageRoutes);

module.exports = router;