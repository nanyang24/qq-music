import './tab'
import {Recommend} from "./recommend";
import {Rank} from "./rank";
import {Search} from "./search";
import {MusicPlayer} from "./player";
import './lazyload'
import '../scss/app.scss'

let recommend = new Recommend(document.querySelector('.rec-tab'))
let rank = new Rank(document.querySelector('.rank-tab'))
let search = new Search(document.querySelector('.search-tab'))
let player = new MusicPlayer(document.querySelector('#player'))

document.querySelector('#show_player').addEventListener('click', () => {
    if (location.hash.length) {
        player.show();
    } else {
        alert('请先搜索歌曲后点击播放')
    }
})

onHashChange();

addEventListener('hashchange', onHashChange);

function onHashChange() {
    let hash = location.hash
    if (/#player\?.+/.test(hash)) {
        let matches = hash.slice(hash.indexOf('?') + 1).match(/(\w+)=([^&]+)/g)
        let options = matches && matches.reduce((res, cur) => {
            let arr = cur.split('=')
            res[arr[0]] = decodeURIComponent(arr[1])
            return res
        }, {})
        // console.log(options);
        player.play(options);
    } else {
        player.hide();
    }
}