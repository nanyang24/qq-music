import {lazyload} from './lazyload';
import {RANK_URL} from "./url";

export class Rank {
    constructor(el) {
        this.$el = el;
        this.getData();
    }

    getData() {
        fetch(RANK_URL)
            .then(res => res.json())
            .then(rankJson => this.renderRank(rankJson))
    }

    renderRank(rankJson) {
        this.renderToplist(rankJson.data.topList)
        lazyload(document.querySelectorAll('.lazyload'));
    }

    renderToplist(topList) {
        document.querySelector('.rank-tab ul').innerHTML = topList.map(topic =>
            `<li class="topic-item" data-id="${topic.id}" data-type="${topic.type}">
                   <div class="topic-main">
                        <a href="javascript:;" class="topic-media">
                            <img class="lazyload" data-src="${topic.picUrl}">
                            <span class="listen-count"><i class="icon icon_listen"></i>${(topic.listenCount / 10000).toFixed(1)}万</span>
                        </a>
                        <div class="topic-info">
                            <div class="topic-cont">
                                <h3 class="topic-tit">${topic.topTitle}</h3>
                                ${this.songsList(topic.songList)}
                            </div>
                            <i class="topic-arrow"></i>
                        </div>
                    </div>
             </li>`).join('');
    }

    songsList(songs) {
        return songs.map((song, i) =>
            `<p>${i + 1}<span class="text-name">${song.songname}</span>- ${song.singername}</p>
            `).join('');
    }
}