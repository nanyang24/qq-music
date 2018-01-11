import Swiper from './swiper.min'

export class Slide {
    constructor(option = {}) {
        this.$el = option.el;
        this.slide = option.slide;

        this.autoPlay = option.autoPlay || true;
        this.interval = option.interval || 1000;

        this.index = 0;
        this.render();
        window.onload = this.swiper(this.$el);
    }

    render() {
        this.$el.innerHTML = '<div class="swiper-wrapper"></div><div class="swiper-pagination" id="swiper-pagination"></div>';
        let $swiperWrapper = this.$el.querySelector('.swiper-wrapper');
        $swiperWrapper.innerHTML = this.slide.map(slide =>
            `<div class="swiper-slide">
          <a href="${slide.link}" >
          <img src="${slide.image}" style="width: 100%;height: 100%;">
          </a>
        </div>`
        ).join('');
    }

    swiper(node) {
        let mySwiper = new Swiper(node, {
            direction: 'horizontal',
            loop: true,
            autoplay: true,
            pagination: {
                el: '.swiper-pagination',
            }
        })
    }
}