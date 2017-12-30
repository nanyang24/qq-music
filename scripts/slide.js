class Slide {
    constructor(option = {}) {
        this.$el = option.el;
        this.slide = option.slide;

        this.autoPlay = option.autoPlay || true;
        this.interval = option.interval || 1000;

        this.index = 0;
        this.render();
        // this.start();
    }

    render() {
        this.$el.innerHTML = `<div class="slide-wrap"></div>`
        this.$wrap = this.$el.firstElementChild;
        this.$wrap.style.width = `${this.slide.length * 100}%`;
        this.$wrap.innerHTML = this.slide.map(slide =>
            `<div class="slide-item">
                <a href="${slide.link}">
                    <img src="${slide.image}" alt="#">
                </a>
            </div>`
        ).join('');
    }

    // start() {
    //     setInterval(this.next.bind(this), this.interval)
    // }

    // next() {
    //     this.$wrap.style.transform =
    // }
}