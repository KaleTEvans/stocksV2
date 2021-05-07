class NewsArticle {
    constructor(data) {
        this.data = data;

        this.date = data.date;
        this.image = data.image_url;
        this.link = data.news_url;
        this.sentiment = data.sentiment;
        this.source = data.source_name;
        this.text = data.text;
        this.title = data.title;
    }

    getDate() {
        let newDate = this.date.split(" ");
        let newFormat = `${newDate[0]} ${newDate[1]} ${newDate[2]} ${newDate[3]}`;
        return newFormat;
    }

    getSentimentColor() {
        if (this.sentiment === 'Positive') {
            return 'news-positive'
        }
        if (this.sentiment === 'Negative') {
            return 'news-negative'
        }
        if (this.sentiment === 'Neutral') {
            return 'news-neutral'
        }
    }

    createCard() {
        let newsCard = document.createElement('li');
        newsCard.classList = `news-card`;
        newsCard.setAttribute('id', this.link)
        newsCard.innerHTML = `
        <div class='news-head card'>
            <img src='${this.image}' class='card-img-top'>
            <div class='card-body news-text'>
                <h6 class='news-header card-title'>${this.title}</h6>
                <p class='card-text'>${this.text}</p>
                <p class='date'>${this.getDate()}</p>
                <p class='news-sentiment card-text ${this.getSentimentColor()}'>${this.sentiment}</p>
            </div>
        </div>
        `;
        return newsCard;
    }
}