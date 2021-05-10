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
            <div class='card-body news-text'>
                <div class='row news-info mb-1'>
                    <img src='${this.image}' class='card-img col-4'>
                    <p class='card-text col-8 text-left'>${this.title}</p>
                </div>
                <p class='date mb-0'>${this.getDate()}</p>
                <p class='news-sentiment card-text ${this.getSentimentColor()}'>${this.sentiment}</p>
            </div>
        </div>
        `;
        return newsCard;
    }
}