
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
// let techIndicator = 'SMA';
// let interval = 'daily';
// let timePeriod = '10';
// let seriesType = 'open';

const senatorTransactionsArr = [];

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