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
        console.log(this.date);
        let newDate = this.date.split(" ");
        let newFormat = `${newDate[0]} ${newDate[1]} ${newDate[2]} ${newDate[3]}`;
        return newFormat;
    }

    createCard() {
        let newsCard = document.createElement('li');
        newsCard.classList = `card news-card`;
        newsCard.setAttribute('id', this.link)
        newsCard.innerHTML = `
            <img src='${this.image}'>
            <h5 class='news-header'>${this.title}</h5>
            <p>${this.text}</p>
            <p class='news-sentiment'>${this.sentiment}</p>
        `;
        return newsCard;
    }
}