class PriceVsSentiment {
    constructor(sentiment, price, ticker) {
        this.sentiment = sentiment;
        this.price = price;
        this.ticker = ticker;
        this.dailySentimentArr = [];
        this.dailyStockSentimentArr = [];
        this.dailyStockArr = [];
    }
    getPastSentiment() {
        let dailySentiment = this.sentiment.data['data'];
        // store the daily open values in an array
        for (var x in dailySentiment) {
            // get price value
            let sentimentValue = parseFloat(dailySentiment[x]['sentiment_score']);
            // new array to store data
            let sentimentArr = [];
            sentimentArr.push(new Date(x));
            sentimentArr.push(sentimentValue);
            // push to dailypricearr
            this.dailySentimentArr.push(sentimentArr);
        }
        return this.dailySentimentArr;
    }

    getPastTickerSentiment() {
        let dailySentiment = this.sentiment.data;
        // store values in array
        for (var x in dailySentiment) {
            let sentimentValue = parseFloat(dailySentiment[x][this.ticker]['sentiment_score']);
            // new array to store data
            let sentimentArr = [];
            sentimentArr.push(new Date(x));
            sentimentArr.push(sentimentValue);
            // push to dailypricearr
            this.dailyStockSentimentArr.push(sentimentArr);
        }
        return this.dailyStockSentimentArr;
    }

    getIndexPrice() {
        let dailyStockData = this.price.data['Time Series (Daily)'];
        // store the daily open values in an array
        for (var x in dailyStockData) {
            // get price value
            let openPrice = parseFloat(dailyStockData[x]['1. open']);
            // new array to store data
            let priceArr = [];
            priceArr.push(new Date(x));
            priceArr.push(openPrice);
            // push to dailypricearr
            this.dailyStockArr.push(priceArr);
        }
        this.dailyStockArr = this.dailyStockArr.slice(0, 21);
        return this.dailyStockArr;
    }
}