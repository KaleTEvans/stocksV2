
// arrays for sentiment chart
let dailySentimentArr = [];
let dailyQQQArr = [];

let dailyPriceArr = [];
let weightedMentionsArr = [];

let trendingTickersArr = [];
let rankedTickersArr = [];

let yahooData = {};

// arrays for tech chart
let techAnalysisArr = [];
// initial chart selections
let techIndicator = 'SMA';
let interval = 'daily';
let timePeriod = '10';
let seriesType = 'open';

const senatorTransactionsArr = [];


// gather data about a specific stock when selected
const yahooStockData = ticker => {
    fetch("https://apidojo-yahoo-finance-v1.p.rapidapi.com/stock/v2/get-summary?symbol=" + ticker + "&region=US", {
        "method": "GET",
        "headers": {
            "x-rapidapi-key": rapidApiKey,
            "x-rapidapi-host": "apidojo-yahoo-finance-v1.p.rapidapi.com"
        }
    })
    .then(response => {
        if (response.ok) {
            response.json().then(function(data) {
                yahooData = {price, summaryProfile, financialData, summaryDetail, defaultKeyStatistics, ...otherData} = data;
                return fetch("https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=" + ticker + "&apikey=" + alphaVantageKey);
            })
            .then(response => {
                if (response.ok) {
                    response.json().then(function(data) {
                        // get yesterdays date
                    let yesterdayDate = moment().subtract(1, 'days').format('YYYY-MM-DD');
                    console.log(yesterdayDate);
                    let weekendDay = moment().format('dddd');
                    console.log(weekendDay);
                    // set date to previous close if on a weekend
                    if (weekendDay === 'Sunday') {
                        yesterdayDate = moment().subtract(2, 'days').format('YYYY-MM-DD');
                    }
                    if (weekendDay === 'Monday') {
                        yesterdayDate = moment().subtract(3, 'days').format('YYYY-MM-DD');
                    }
                    let dailyData = data['Time Series (Daily)'];
                    let previousDayData = dailyData[yesterdayDate];
                    const yesterdayOpen = previousDayData['1. open'];
                    const yesterdayClose = previousDayData['4. close'];
                    const yesterdayVol = previousDayData['5. volume'];
                    const previousDayObj = {yesterdayOpen, yesterdayClose, yesterdayVol};
                    alphaVantageData(dailyData)
                        .then(technicalIndicators(ticker, techIndicator, interval, timePeriod, seriesType))
                        //.then(renderChart(techAnalysisArr, dailyPriceArr))
                        .then(yahooDataElements(yahooData, previousDayObj))
                        .catch(err => {
                            console.log(err)
                        });
                    
                    });
                }
            });
        }
    })
    .catch(err => {
        console.log(err);
    });
}

const alphaVantageData = chartData => {
    // empty previous array
    dailyPriceArr = [];
    // store the daily open values in an array
    for (var x in chartData) {
        // get price value
        let openPrice = parseFloat(chartData[x]['1. open']);
        // new array to store data
        let priceArr = [];
        priceArr.push(new Date(x));
        priceArr.push(openPrice);
        // push to dailypricearr
        dailyPriceArr.push(priceArr);
    }
    return new Promise((resolve) => {       
        resolve(dailyPriceArr);
    })
};

// gather data for the chart 
const technicalIndicators = function(ticker, techIndicator, interval, timePeriod, seriesType) {
    
    fetch("https://www.alphavantage.co/query?function=" + techIndicator + "&symbol=" + ticker + 
        "&interval=" + interval + "&time_period=" + timePeriod + "&series_type=" + seriesType + "&apikey=" + alphaVantageKey)
        .then(response => {
            if (response.ok) {
                response.json().then(function(data) {
                    $("#tech-chart-title").html(data['Meta Data']['2: Indicator']);
                    let techAnalysis = data['Technical Analysis: ' + techIndicator];
                    // empty the tech analysis array
                    techAnalysisArr = [];
                    // loop over the object to put items in the array
                    for (var x in techAnalysis) {
                        // get price value
                        let dataValue = parseFloat(techAnalysis[x][techIndicator]);
                        // new array to store each date and price value
                        let newArr = [];
                        newArr.push(new Date(x));
                        newArr.push(dataValue);
                        //push to main array
                        techAnalysisArr.push(newArr);
                    }
                    techAnalysisArr = techAnalysisArr.slice(0, 100);
                    renderChart(techAnalysisArr, dailyPriceArr)
                    return new Promise((resolve) => {       
                        resolve(techAnalysisArr);
                    })
                });
            }
        })
        .catch(err => {
            console.log(err);
        });
};

const govTransactions = () => {
    return new Promise((resolve) => {
        fetch('https://senate-stock-watcher-data.s3-us-west-2.amazonaws.com/')
            .then((response) => response.text())
                .then((response) => {
                    const parser = new DOMParser()
                    const xml = parser.parseFromString(response, 'text/xml')
                    const results = [].slice.call( xml.getElementsByTagName('Key') ).filter((key) => key.textContent.includes('.json'))
                    const files = results.map(file => file.textContent.split('/')[1])
                    let dateArr = [];
                    // loop everything from 2021 into an array
                    files.forEach(element => {
                        let currentYear = '2021';
                        if (element.includes(currentYear)) {
                            dateArr.push(element);
                            //govTransactionsDaily(element);
                        }
                    });  
                    resolve(dateArr);
                })
            .catch((response) => {
                console.log(response)
            });
    });
};

const loadGovTransactions = dates => {
    let govTransactionsArr = [];
    let requests = dates.map(date => {
        // create a promise for each api call
        return new Promise((resolve) => {
            fetch('https://senatestockwatcher.com/data/' + date)
            .then(response => {
                if (response.ok) {
                    response.json().then(function(data) { 
                        resolve(data);        
                    });
                }
            })
        }) 
    })
    Promise.all(requests).then((data) => {
        data.forEach(obj => {
            govTransactionsArr.push(obj);
        })
        //console.log(govTransactionsArr);
        govTransactionsFilter(govTransactionsArr);
    })
}

// govTransactions()
//     .then(loadGovTransactions)

const govTransactionsFilter = array => {
    let senatorTransactionData = [];

    array.forEach(element => {
        element.forEach(senator => {
            //console.log(senator);
            let senatorName = senator.office
            let transactionsArr = [];
            senator.transactions.forEach(transaction => {
                if (transaction.ticker === '--') {
                    return;
                }
                let ticker = transaction.ticker.replace('<a href="https://finance.yahoo.com/q?s=', '');
                let newTicker = ticker.split('"')[0]
                transactionsArr.push({
                    amount: transaction.amount,
                    purchaseType: transaction.type,
                    asset: transaction.asset_description,
                    date: transaction.transaction_date,
                    ticker: newTicker
                });
            })
            senatorTransactionData.push({
                senator: senatorName,
                transactionData: transactionsArr
            });
        })
    })
    govTrades(senatorTransactionData);
}