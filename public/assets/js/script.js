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

const topSentimentEl = document.querySelector('.top-suggestions');
const govTradesEl = document.querySelector('.gov-transactions');
let newsEl = document.querySelector('.news')
let newsTicker = document.querySelector('.news-ticker');

let tickerFormEl = document.querySelector('#stock-ticker');
let tickerInput = document.querySelector('#ticker');

const yahooDataEl = document.querySelector('#yahoo-data');

let cardHeaderEl = document.querySelector('.card-header');
const chartGenerateButtonEl = document.getElementById('tech-charts');

const generalMarketSentiment = () => {
    fetch('/api/stockNews')
    .then(res => res.json())
    .then(data => {
        let item = new OverallSentiment(data);
        item.getSentiment();
    });
}

const sentimentVsPrice = () => {
    let sentiment;
    let price;
    fetch('/api/stockNews/pastSentiment') 
    .then(res => res.json())
    .then(data => {
        sentiment = data;
    }).then(x => {
        return fetch('/api/alphaIndex')})
    .then(res => res.json())
    .then(data => {
        price = data;
    }).then(x => {
        let arrays = new PriceVsSentiment(sentiment, price);
        sentimentChart(arrays.getPastSentiment(), arrays.getIndexPrice());
    })
}

// function to create the chart
function sentimentChart(sentiment, qqqPrice) {
    JSC.Chart('sentimentChartDiv', {
        debug: true,
        type: 'line',
        legend: {
            template: '%icon %name',
            position: 'inside top left'
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
                name: 'QQQ Movement',
                yAxis: 'rightAxis',
                points: qqqPrice
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

    let stockEl = $(this).attr('id');
    stockTicker = stockEl;
    console.log(stockTicker);
    $('.news-ticker').html(`${stockTicker} `);
    // pass the stock ticker to the summary function
    yahooStockData(stockTicker);
    // pass ticker to news call
    singleStockNews(stockTicker);
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
        console.log(json);
        let newsPiece = json.data.data;
        newsPiece.forEach(item => {
            let news = new NewsArticle(item);
            newsEl.appendChild(news.createCard());
        })
    })
}

// function to create cards for gov transactions
const govTrades = senatorData => {
    senatorData.forEach(element => {
        if (element.transactionData.length === 0) {
            return;
        }
        let transactionCard = document.createElement('li');
        transactionCard.classList = 'card gov-card';
        transactionCard.innerHTML = `
            <h5 class="gov-header">${element.senator}</h6>
            <h6>Transactions:</h6>
            ${transactionGenerator(element.transactionData)}
            `;

        govTradesEl.appendChild(transactionCard);
    });
    // run clickable info function once this is done
    slideDown();
}

// function to loop over gov transactions
const transactionGenerator = data => {
    let transactionText = '';
    data.forEach(element => {
        transactionText = transactionText + `
            <button class='collapsible font-weight-bold'>${element.ticker}</br>${purchaseTypeColor(element.purchaseType)}</button>
            <div class='content'>
                <p>Asset: ${element.asset}</br>
                Date: ${element.date}</br>
                Amount: ${element.amount}</p>
            </div>
        `;
    })
    return transactionText;
}
// purchase type text colors for gov transactions
const purchaseTypeColor = purchase => {
    if (purchase === 'Purchase') {
        return `<span class='font-weight-bold text-success'>${purchase}</span>`
    } else {
        return `<span class='font-weight-bold text-danger'>${purchase}</span>`
    }
}
// slide down info for gov transactions
const slideDown = function() {
    let govTradesBtn = document.getElementsByClassName('collapsible');
    for (let i=0; govTradesBtn.length; i++) {
        console.log(govTradesBtn[i]);
        govTradesBtn[i].addEventListener('click', function() {
            this.classList.toggle('active');
            let content = this.nextElementSibling;
            if (content.style.maxHeight) {
                content.style.maxHeight = null;
            } else {
                content.style.maxHeight = content.scrollHeight + 'px';
            }
        });
    }
};

const submitButtonHandler = function(event) {
    event.preventDefault();
    // clear stockTicker value
    stockTicker = '';

    stockTicker = tickerInput.value.trim();

    if (stockTicker) {
        yahooStockData(stockTicker);
    }
};

const yahooDataElements = (yahooData, alphaData) => {
    // clear previous content
    yahooDataEl.innerHTML = '';
    // fill with new content
    yahooDataEl.innerHTML = `
        <h4 class="card-header" >Stock Name: ${yahooData.price.shortName}</h4>
        <p class='sector'>Sector: ${yahooData.summaryProfile.sector}</p>
        <ul class= price-data id="price-data">
            <h5>Price Info</h5>
            <li>Current Ask: $${yahooData.financialData.currentPrice.raw}</li>
            <li>Price at Open: $${yahooData.summaryDetail.regularMarketOpen.raw}</li>
            <li>Percent Change Since Open: ${yahooData.price.regularMarketChangePercent.fmt}</li>
            <li>Previous Day Open: $${alphaData.yesterdayOpen}</li>
            <li>Previous Day Close: $${alphaData.yesterdayClose}</li>
            <li>50 Day Average: $${yahooData.summaryDetail.fiftyDayAverage.raw}</li>
            <li>200 Day Average: $${yahooData.summaryDetail.twoHundredDayAverage.raw}</li>
            <li>Year High: $${yahooData.summaryDetail.fiftyTwoWeekHigh.raw}</li>
            <li>Year Low: $${yahooData.summaryDetail.fiftyTwoWeekLow.raw}</li>
        </ul>
        <ul class="volume-data" id="volume-data">
            <h5>Volume Info</h5>
            <li>Current Volume: ${yahooData.summaryDetail.volume.raw}</li>
            <li>Average Volume: ${yahooData.summaryDetail.averageVolume.raw}</li>
            <li>10 Day Volume: ${yahooData.summaryDetail.averageDailyVolume10Day.raw}</li>
            <li>Three Month Volume: ${yahooData.price.averageDailyVolume3Month.raw}</li>
            <li>Previous Day Volume: ${alphaData.yesterdayVol}</li>
        </ul>
        <ul class="other-data" id="other-data">
            <h5>Other Data</h5>
            <li>Held by Insiders (% of Float): ${(yahooData.defaultKeyStatistics.heldPercentInsiders.raw * 100).toFixed(2)}%</li>
            <li>Held by Institutions (% of Float): ${(yahooData.defaultKeyStatistics.heldPercentInstitutions.raw * 100).toFixed(2)}%</li>
            <li>Average Price Target: $${yahooData.financialData.targetMeanPrice.raw}</li>
            <li>Shares Short (% of Float): ${yahooData.defaultKeyStatistics.shortPercentOfFloat.fmt}</li>
            <li>Short Float: ${yahooData.defaultKeyStatistics.sharesShort.raw}</li>
            <li>Short Float Previus Month: ${yahooData.defaultKeyStatistics.sharesShortPriorMonth.raw}</li>
            <li>Total Float: ${yahooData.defaultKeyStatistics.floatShares.raw}</li>
        </ul>
        `;
    return new Promise((resolve) => {
        resolve();
    });
}

const technicalChartsButtonHandler = function(event) {
    event.preventDefault();

    $('#chartDiv').html('');

    let indicatorSelection = document.getElementById('tech-indicator').value;
    let intervalSelection = document.getElementById('time-interval').value;
    console.log(stockTicker, indicatorSelection, intervalSelection, timePeriod, seriesType);
    technicalIndicators(stockTicker, indicatorSelection, intervalSelection, timePeriod, seriesType);
};

// function to create the chart
function renderChart(data1, data2) {
    JSC.Chart('chartDiv', {
        debug: true,
        type: 'line',
        legend: {
            template: '%icon %name',
            position: 'inside top left'
        },
        defaultPoint_marker_type: 'none',
        xAxis_crosshair_enabled: true,
        yAxis_formatString: 'c',
        series: [
            {
                name: 'Technical Indicator',
                points: data1
            }, {
                name: 'Price at Open',
                points: data2
            }
        ]
    });
    return new Promise((resolve) => {
        resolve();
    });
}

tickerFormEl.addEventListener('submit', submitButtonHandler);
chartGenerateButtonEl.addEventListener('click', technicalChartsButtonHandler);

generalMarketSentiment();
sentimentVsPrice();
bestRatedStocks();
genNews();