/* **************** Stock Data Collector **************

Purpose is to predict stock movement based on several factors
1. Collect top mentioned stocks and their sentiment and then rank them
2. Input the tickers into the yahoo api to collect all stock data
3. Determine pricing, volume, and other data for each stock
    3a. Compare current volume to average volume (if high, give ranking points)
    3b. Compare current price to average price (if around average, or lower than average, give ranking points)
    3c. Compare current price to mean target price (print this to page, no points)
    3d. Compare percent insiders and institutions holding (will need to determine what is high and whats not)
    3e. Determine whether short percent float is high or not
4. Gather past data to determine if a big move is possible
5. Compare all this data to produce the most likely mover
6. Collect price data for each top ranked mover over a period of time to determine prediction outcome

*/

 /*
                ************** NEXT ADDITIONS *****************
                Volume at current time yesterday
                Stock Price vs Sentiment Chart
                Add stock price to top sentiment list

                Compare performance to sector performance
                
                */

let stockTicker;
let selectedStock;

const topSentimentEl = document.querySelector('.top-suggestions');
const govTradesEl = document.querySelector('.gov-transactions');
let newsEl = document.querySelector('.news')
let newsTicker = document.querySelector('.news-ticker');

let tickerFormEl = document.querySelector('#stock-ticker');
let tickerInput = document.querySelector('#ticker');

const yahooDataEl = document.querySelector('#yahoo-data');

let cardHeaderEl = document.querySelector('.card-header');
const chartGenerateButtonEl = document.getElementById('tech-charts');


// add button to return to the overall market news
const generalMarketSentiment = () => {
    fetch('/api/stockNews')
    .then(res => res.json())
    .then(data => {
        let item = new OverallSentiment(data);
        item.getSentiment();
    });
}

const sentimentVsPrice = (ticker) => {
    let sentiment;
    let price;
    const chartLocation = 'sentimentChartDiv';
    fetch('/api/stockNews/pastSentiment') 
    .then(res => res.json())
    .then(data => {
        sentiment = data;
    }).then(() => {
        return fetch(`api/alphaIndex/${ticker}`)})
    .then(res => res.json())
    .then(data => {
        price = data;
    }).then(() => {
        let arrays = new PriceVsSentiment(sentiment, price, ticker);
        sentimentChart(arrays.getPastSentiment(), arrays.getIndexPrice(), ticker, chartLocation);
    })
}

// function to create the chart
const sentimentChart = (sentiment, price, ticker, chartLocation) => {
    JSC.Chart(`${chartLocation}`, {
        debug: true,
        type: 'line',
        legend: {
            template: '%icon %name',
            position: 'inside top right'
        },
        defaultPoint_marker_type: 'none',
        xAxis_crosshair_enabled: true,
        yAxis: [
            {
                id: 'leftAxis',
                label_text: 'Sentiment Score',
            }, {
                id: 'rightAxis',
                label_text: 'Price Range',
                formatString: 'c0',
                orientation: 'right'
            }
        ],
        series: [
            {
                name: 'Sentiment Score',
                yAxis: 'leftAxis',
                points: sentiment
            }, {
                name: `${ticker} Movement`,
                yAxis: 'rightAxis',
                points: price
            }
        ]
    });
};

// obtain top sentiment stocks
const bestRatedStocks = () => {
    fetch('/api/stockNews/topPicks')
    .then(res => res.json())
    .then(json => {
        const topMentionsArr = json.data.data.all;
        let i = 0;
        const weightedMentionsArr = [];
        topMentionsArr.forEach(stock => {
            i++;
            let sentimentScore = stock.sentiment_score;
            let mentionedTicker = stock.ticker;
            // weight news traffic rank with sentiment score
            let weightedScore = (1 - (0.01 * i)) * sentimentScore;
            weightedMentionsArr.push({
                ticker: mentionedTicker,
                score: weightedScore
            });
        });
        weightedMentionsArr.sort(function(a, b) {
            return b.score - a.score;
        })
        stockSuggestions(weightedMentionsArr);
    })
}

const stockSuggestions = data => {
    data.forEach(stock => {
        let card = document.createElement('li');
        card.classList = `card top-suggested ${stockSuggestionColors(stock.score)}`;
        card.setAttribute('id', stock.ticker)
        card.innerHTML = `
            <h6 class="ticker-header">${stock.ticker}</h6>
            <p class='card-info'>Score: ${stock.score.toFixed(2)}</p>
        `;
        topSentimentEl.appendChild(card);
    }) 
}

// function to make card colors
const stockSuggestionColors = score => {
    if (score > 1) {
        return 'best-suggested';
    }
    if (score > 0.75 && score <= 1) {
        return 'better-suggested';
    }
    if (score <= 0.75) {
        return 'last-suggested';
    }
}

$('.top-suggestions').on('click', '.card', function() {
    // clear stock ticker value
    stockTicker = '';
    // clear chart
    $('#chartDiv').html('');
    // clear news
    $('.news-ticker').html('');
    $('.news').html('');
    // clear stock data
    yahooDataEl.innerHTML = '';
    // grab ticker from id
    let stockEl = $(this).attr('id');
    stockTicker = stockEl;
    console.log(stockTicker);
    $('.news-ticker').html(`${stockTicker} `);
    // pass ticker to news call and stock data functions
    singleStockNews(stockTicker);
    stockData(stockTicker);
});

// create cards for general news
const genNews = () => {
    fetch('/api/stockNews/genNews') 
    .then(res => res.json())
    .then(json => {
        let newsPiece = json.data.data;
        newsPiece.forEach(item => {
            let news = new NewsArticle(item);
            newsEl.appendChild(news.createCard());
        })
    });
};

$('.news').on('click', '.news-card', function() {
    let newsEl = $(this).attr('id');
    window.open(newsEl);
});

// generate news for a single ticker when selected
const singleStockNews = (ticker) => {
    fetch(`/api/stockNews/${ticker}`)
    .then(res => res.json())
    .then(json => {
        let newsPiece = json.data.data;
        newsPiece.forEach(item => {
            let news = new NewsArticle(item);
            newsEl.appendChild(news.createCard());
        });
    });
};

const submitButtonHandler = function(event) {
    event.preventDefault();
    // clear stockTicker value
    stockTicker = '';

    stockTicker = tickerInput.value.trim();

    if (stockTicker) {
        // clear news
        $('.news-ticker').html('');
        $('.news').html('');
        // clear chart
        $('#chartDiv').html('');
        // new ticker name
        $('.news-ticker').html(`${stockTicker} `);
        // pass ticker to news call
        singleStockNews(stockTicker);
        // pass ticker to get gen stock info
        stockData(stockTicker);
    }
};

const stockData = (ticker) => {
    let yahoo;
    let alphaVantage;
    let alphaVantageData;
    selectedStock = '';
    fetch(`/api/yahoo/${ticker}`)
    .then(res => res.json())
    .then(json => {
        yahoo = json.data;
    }).then(() => {
        fetch(`/api/alphaIndex/${ticker}`)
        .then(res => res.json())
        .then(json => {
            alphaVantage = json;
            alphaVantageData = json.data;
        }).then(() => {
            selectedStock = new Stock(yahoo, alphaVantageData);
            selectedStock.previousDayData();
            yahooDataEl.innerHTML = selectedStock.stockDataElements();
            techData(selectedStock.dailyStockPriceData(), ticker, 'SMA', 'daily', '10', 'open');
            singleSentimentVsPrice(alphaVantage, ticker);
            volumeChart(selectedStock.dailyVolumeData());
        })
    })
}

const techData = (dailyData, ticker, techIndicator, interval, timePeriod, seriesType) => {
    // fetch the technical data
    fetch(`/api/alphaIndex/${techIndicator}/${ticker}/${interval}/${timePeriod}/${seriesType}`)
    .then(res => res.json())
    .then(json => {
        let data = json.data;
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
        renderChart(techAnalysisArr, dailyData);
    })
};

// function to create the chart
const renderChart = (data1, data2) => {
    JSC.Chart('smaChartDiv', {
        debug: true,
        type: 'line',
        legend: {
            template: '%icon %name',
            position: 'inside top right'
        },
        defaultPoint_marker_type: 'none',
        xAxis_crosshair_enabled: true,
        yAxis_formatString: 'c',
        series: [
            {
                name: 'SMA',
                points: data1
            }, {
                name: 'Price at Open',
                points: data2
            }
        ]
    });
};

// function to create volume chart
const volumeChart = (volume) => {
    JSC.Chart('volumeChartDiv', {
        debug: true,
        type: 'line',
        legend: {
            template: '%icon %name',
            position: 'inside top right'
        },
        defaultPoint_marker_type: 'none',
        xAxis_crosshair_enabled: true,
        series: [
            {
                name: 'Volume',
                points: volume
            }
        ]
    });
};

// create arrays for sentiment vs price over the last month for 
//  a single ticker
const singleSentimentVsPrice = (alphaVantage, ticker) => {
    // label chart location
    const chartLocation = 'priceChartDiv';
    // fetch stock's past sentiment
    fetch(`/api/stockNews/ticker/${ticker}`)
    .then(res => res.json())
    .then(json => {
        let data = json.data
        let arrays = new PriceVsSentiment(data, alphaVantage, ticker);
        // call charting function
        sentimentChart(arrays.getPastTickerSentiment(), arrays.getIndexPrice(), ticker, chartLocation);
    })
}

tickerFormEl.addEventListener('submit', submitButtonHandler);

generalMarketSentiment();
sentimentVsPrice('QQQ');
bestRatedStocks();
genNews();
stockData('TSLA');

// // function to create cards for gov transactions
// const govTrades = senatorData => {
//     senatorData.forEach(element => {
//         if (element.transactionData.length === 0) {
//             return;
//         }
//         let transactionCard = document.createElement('li');
//         transactionCard.classList = 'card gov-card';
//         transactionCard.innerHTML = `
//             <h5 class="gov-header">${element.senator}</h6>
//             <h6>Transactions:</h6>
//             ${transactionGenerator(element.transactionData)}
//             `;

//         govTradesEl.appendChild(transactionCard);
//     });
//     // run clickable info function once this is done
//     slideDown();
// }

// // function to loop over gov transactions
// const transactionGenerator = data => {
//     let transactionText = '';
//     data.forEach(element => {
//         transactionText = transactionText + `
//             <button class='collapsible font-weight-bold'>${element.ticker}</br>${purchaseTypeColor(element.purchaseType)}</button>
//             <div class='content'>
//                 <p>Asset: ${element.asset}</br>
//                 Date: ${element.date}</br>
//                 Amount: ${element.amount}</p>
//             </div>
//         `;
//     })
//     return transactionText;
// }
// // purchase type text colors for gov transactions
// const purchaseTypeColor = purchase => {
//     if (purchase === 'Purchase') {
//         return `<span class='font-weight-bold text-success'>${purchase}</span>`
//     } else {
//         return `<span class='font-weight-bold text-danger'>${purchase}</span>`
//     }
// }
// // slide down info for gov transactions
// const slideDown = function() {
//     let govTradesBtn = document.getElementsByClassName('collapsible');
//     for (let i=0; govTradesBtn.length; i++) {
//         console.log(govTradesBtn[i]);
//         govTradesBtn[i].addEventListener('click', function() {
//             this.classList.toggle('active');
//             let content = this.nextElementSibling;
//             if (content.style.maxHeight) {
//                 content.style.maxHeight = null;
//             } else {
//                 content.style.maxHeight = content.scrollHeight + 'px';
//             }
//         });
//     }
// };