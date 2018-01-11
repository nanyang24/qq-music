import {LYRICS_URL, SEARCH_URL} from './url';

// 播放器 专辑图片
export function playerAlbumUrl(id) {
    return `https://y.gtimg.cn/music/photo_new/T002R150x150M000${id}.jpg`;
}
// 搜索 专辑 图片
export function albumUrl(id) {
    return `https://y.gtimg.cn/music/photo_new/T002R68x68M000${id}.jpg?max_age=2592000`;
}

// 搜索 头像 图片
export function avatarUrl(id) {
    return `https://y.gtimg.cn/music/photo_new/T001R68x68M000${id}.jpg?max_age=2592000`;
}

// 音乐 audio url
export function songUrl(id) {
    return `http://isure.stream.qqmusic.qq.com/C100${id}.m4a?fromtag=32`;
}

// 歌词 url
export function lyricsUrl(songid) {
    return `${LYRICS_URL}?id=${songid}`;
}

// 处理搜索的 url
// @param {any} keyword 用户输入的数据
// @param {number} [page=1]  页数默认为1
export function searchUrl(keyword, page = 1) {
    return `${SEARCH_URL}?keyword=${keyword}&page=${page}`;
}