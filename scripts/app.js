!function () {
    fetch('./json/rec.json')
        .then(res => res.json())
        .then(render)

    function render(json) {
        reanderSlide(json.data.slider);
        renderRadios(json.data.radioList);
        renderSongs(json.data.songList);
        lazyload(document.querySelectorAll('.lazyload'));
    }

    function reanderSlide(slides) {
        let slide = slides.map(slide => {
            return {link: slide.linkUrl, image: slide.picUrl}
        })
        new Slide({
            el: document.querySelector('#slide'),
            slide
        })
    }

    function renderRadios(radioList) {
        document.querySelector('.content .rec-tab .radio-list .list-ct').innerHTML = radioList.map(radio =>
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

    function renderSongs(songList) {
        document.querySelector('.content .rec-tab .songs-list .list-ct').innerHTML = songList.map(song =>
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
}()


