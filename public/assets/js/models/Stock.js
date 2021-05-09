class Stock {
    constructor(yahoo, alphaVantage) {
        this.yahoo = yahoo;
        this.alphaVantage = alphaVantage;
        // note that previous is previous day
        this.name = this.yahoo.price.shortName;
        this.sector = this.yahoo.summaryProfile.sector;
        this.currentPrice = this.yahoo.financialData.currentPrice.raw;
        this.marketOpen = this.yahoo.summaryDetail.regularMarketOpen.raw;
        this.percentChange = this.yahoo.price.regularMarketChangePercent.raw * 100;
        this.previousOpen;
        this.previousClose;
        this.fiftyDayAvg = this.yahoo.summaryDetail.fiftyDayAverage.raw;
        this.twoHddDayAvg = this.yahoo.summaryDetail.twoHundredDayAverage.raw;
        this.yearHigh = this.yahoo.summaryDetail.fiftyTwoWeekHigh.raw;
        this.yearLow = this.yahoo.summaryDetail.fiftyTwoWeekLow.raw;
        this.volume = this.yahoo.summaryDetail.volume.raw;
        this.avgVolume = this.yahoo.summaryDetail.averageVolume.raw;
        this.tenDayVol = this.yahoo.summaryDetail.averageDailyVolume10Day.raw;
        this.threeMonthVol = this.yahoo.price.averageDailyVolume3Month.raw;
        this.previousVol;
        this.heldByInsiders = this.yahoo.defaultKeyStatistics.heldPercentInsiders.raw * 100;
        this.heldByInstitutions = this.yahoo.defaultKeyStatistics.heldPercentInstitutions.raw * 100;
        this.targetMeanPrice = this.yahoo.financialData.targetMeanPrice.raw;
        this.shortPercentOfFloat = this.yahoo.defaultKeyStatistics.shortPercentOfFloat.raw * 100;
        this.shortShares = this.yahoo.defaultKeyStatistics.sharesShort.raw;
        this.shortPriorMonth = this.yahoo.defaultKeyStatistics.sharesShortPriorMonth.raw;
        this.floatShares = this.yahoo.defaultKeyStatistics.floatShares.raw;

        this.previousDayValues = [];
        this.dailyPriceArr = [];
        this.techValuesArr = [];
    }

    previousDayData() {
        // get yesterdays date
        let yesterdayDate = moment().subtract(1, 'days').format('YYYY-MM-DD');
        let weekendDay = moment().format('dddd');
        // set date to previous close if on a weekend
        if (weekendDay === 'Sunday') {
            yesterdayDate = moment().subtract(2, 'days').format('YYYY-MM-DD');
        }
        if (weekendDay === 'Monday') {
            yesterdayDate = moment().subtract(3, 'days').format('YYYY-MM-DD');
        }
        let dailyData = this.alphaVantage['Time Series (Daily)'];
        let previousDayData = dailyData[yesterdayDate];
        let open = previousDayData['1. open'];
        let close = previousDayData['4. close'];
        let vol = previousDayData['5. volume'];
        
        this.previousOpen = parseFloat(open).toFixed(2);
        this.previousClose = parseFloat(close).toFixed(2);
        this.previousVol = parseFloat(vol).toFixed(2);
    }

    priceChangeColors() {
        if (this.marketOpen < this.currentPrice) {
            return 'price-positive';
        } else {
            return 'price-negative';
        }
    }

    percentChangeColors() {
        if (this.marketOpen < this.currentPrice) {
            return 'percent-positive';
        } else {
            return 'percent-negative';
        }
    }

    stockDataElements() {
        return `
            <h4 class='card-header'>${this.name}</h4>
            <p class='sector'>Sector: ${this.sector}</p>
            <ul class='price-data id='price-data'>
                <h5>Price Info</h5>
                <li>Current Ask: <span class=${this.priceChangeColors()}>$${this.currentPrice}</span></li>
                <li>Price at Open: $${this.marketOpen}</li>
                <li>Percent Change: <span class=${this.percentChangeColors()}>${this.percentChange.toFixed(2)}%</span></li>
                <li>Previous Day Open: $${this.previousOpen}</li>
                <li>Previous Day Close: $${this.previousClose}</li>
                <li>50 Day Average: $${this.fiftyDayAvg.toFixed(2)}</li>
                <li>200 Day Average: $${this.twoHddDayAvg.toFixed(2)}</li>
                <li>Year High: $${this.yearHigh}</li>
                <li>Year Low: $${this.yearLow}</li>
            </ul>
            <ul class='volume-data' id='volume-data'>
                <h5>Volume Info</h5>
                <li>Current Volume: ${this.volume}</li>
                <li>Average Volume: ${this.avgVolume}</li>
                <li>10 Day Volume: ${this.tenDayVol}</li>
                <li>3 Month Volume: ${this.threeMonthVol}</li>
                <li>Previous Day Vol: ${this.previousVol}</li>
            </ul>
            <ul class='other-data' id='other-data'>
                <h5>Other Data</h5>
                <li>Held by Insiders: ${this.heldByInsiders.toFixed(2)}%</li>
                <li>Held by Institutions: ${this.heldByInstitutions.toFixed(2)}%</li>
                <li>Average Price Target: ${this.targetMeanPrice}</li>
                <li>Shares Short: ${this.shortPercentOfFloat.toFixed(2)}%</li>
                <li>Short Float: ${this.shortShares}</li>
                <li>Short Float Prior Month: ${this.shortPriorMonth}</li>
                <li>Total Float: ${this.floatShares}</li>
            </ul>
        `;
    }

    dailyStockPriceData() {
        let dailyData = this.alphaVantage['Time Series (Daily)'];
        let arr = [];
        // store the daily open values in an array
        for (var x in dailyData) {
            // get price value
            let openPrice = parseFloat(dailyData[x]['1. open']);
            // new array to store data
            let priceArr = [];
            priceArr.push(new Date(x));
            priceArr.push(openPrice);
            // push to dailypricearr
            this.dailyPriceArr.push(priceArr);
        }

        return this.dailyPriceArr;
    }
}

