class PriceVsSentiment {
    constructor(sentiment, price) {
        this.sentiment = sentiment;
        this.price = price;
        this.dailySentimentArr = [];
        this.dailyQQQArr = [];
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

    getIndexPrice() {
        let dailyQQQData = this.price.data['Time Series (Daily)'];
        // store the daily open values in an array
        for (var x in dailyQQQData) {
            // get price value
            let openPrice = parseFloat(dailyQQQData[x]['1. open']);
            // new array to store data
            let priceArr = [];
            priceArr.push(new Date(x));
            priceArr.push(openPrice);
            // push to dailypricearr
            this.dailyQQQArr.push(priceArr);
        }
        this.dailyQQQArr = this.dailyQQQArr.slice(0, 21);
        return this.dailyQQQArr;
    }
}