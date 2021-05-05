
class OverallSentiment {
    constructor(sentiment) {
        this.sentiment = sentiment;
    }

    getSentiment() {
        let sentimentPositive = 0;
        let sentimentNegative = 0;
        let sentimentNeutral = 0;
        // loop over the articles to retrieve sentiment
        for (let i=0; i < this.sentiment.data.data.length; i++) {
            let generalSentiment = this.sentiment.data.data[i].sentiment;
            // Add 1 for each sentiment type
            if (generalSentiment === 'Positive') {
                sentimentPositive++;
            }
            if (generalSentiment === 'Negative') {
                sentimentNegative++;
            }
            if (generalSentiment === 'Neutral') {
                sentimentNeutral++;
            }
        }
        this.sentimentValue(sentimentPositive, sentimentNegative, sentimentNeutral);
    };

    sentimentValue(sentimentPositive, sentimentNegative, sentimentNeutral) {
        let genSentimentValue = document.getElementById('gen-sent-value');
        if (sentimentNeutral > sentimentPositive + sentimentNegative) {
            genSentimentValue.textContent = 'Neutral';
            genSentimentValue.classList = 'neutral';
        } 
        if (sentimentPositive > sentimentNegative && sentimentPositive <= sentimentNeutral) {
            genSentimentValue.textContent = 'Slightly Positive';
            genSentimentValue.classList = 'slightly-positive';
        }
        if (sentimentPositive > sentimentNegative && sentimentPositive > sentimentNeutral) {
            genSentimentValue.textContent = 'Positive';
            genSentimentValue.classList = 'positive';
        }
        if (sentimentNegative > sentimentPositive && sentimentNegative <= sentimentNeutral) {
            genSentimentValue.textContent = 'Slightly Negative';
            genSentimentValue.classList = 'slightly-negative';
        }
        if (sentimentNegative > sentimentPositive && sentimentNegative > sentimentNeutral) {
            genSentimentValue.textContent = 'Negative';
            genSentimentValue.classList = 'negative';
        }
    }
}


