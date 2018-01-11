import {Slide} from './slide';
import {lazyload} from './lazyload';
import {RECOMMEND_URL} from "./url";

export class Recommend {
    constructor(el) {
        this.$el = el;
        this.getData();
    }

    getData() {
        fetch(RECOMMEND_URL)
            .then(res => res.json())
            .then(recJson => this.renderRec(recJson))
    }

    renderRec(recJson) {
        document.querySelector('#content .loading').style.display = 'none'
        this.renderSlide(recJson.data.slider);
        this.renderRadios(recJson.data.radioList);
        this.renderSongs(recJson.data.songList);
        this.renderfooter(document.querySelector('.rec-tab'));
        lazyload(document.querySelectorAll('.lazyload'));
    }

    renderSlide(slides) {
        let slide = slides.map(slide => {
            return {link: slide.linkUrl, image: slide.picUrl}
        })
        new Slide({
            el: document.querySelector('.swiper-container'),
            slide
        })
    }

    renderRadios(radioList) {
        document.querySelector('#content .rec-tab .radio-list .list-ct').innerHTML = radioList.map(radio =>
            `<li class="list-item">
                 <a class="main-wrap" href="javascript:;">
                     <div class="media-list">
                          <img class="lazyload" data-src="${radio.picUrl}" alt="">
                          <span class="icon icon_play"></span>
                     </div>
                     <div class="info-list">
                          <h3 class="info-title mod-twocol-list-title">${radio.Ftitle}</h3>
                     </div>
                 </a>
            </li>`).join('');
    }

    renderSongs(songList) {
        document.querySelector('#content .rec-tab .songs-list .list-ct').innerHTML = songList.map(song =>
            `<li class="list-item">
                 <a class="main-wrap" href="javascript:;">
                     <div class="media-list">
                          <img class="lazyload" data-src="${song.picUrl}" alt="">
                          <span class="listen-count"><i class="icon_listen"></i>${(song.accessnum / 10000).toFixed(1)}万</span>
                          <span class="icon icon_play"></span>
                     </div>
                     <div class="info-list">
                          <h3 class="info-title">${song.songListDesc}</h3>
                          <p class="list-text">${song.songListAuthor}</p>
                     </div>
                 </a>
            </li>`).join('');
    }

    renderfooter(node) {
        let footer = document.createElement('div');
        footer.classList.add('footer');
        footer.innerHTML =
            `<div class="web-vision">
                <a href="http://y.qq.com/?ADTAG=myqq&nomobile=1#type=index">查看电脑版网页</a>
            </div>
             <div class="footer-logo"></div>
                <div class="copyright">
                    <p>Copyright © 1998 - 2018 NanYang. All Rights Reserved.</p>
                    <a href="mailto:nanyang24@hotmail.com" class="e-link">联系邮箱: nanyang24@hotmail.com</a>
                </div>
             </div>`;
        node.appendChild(footer);
    }
}


