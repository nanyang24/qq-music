!function () {
    fetch('http://104.236.134.72:4001/')
        .then(res => res.json())
        .then(renderRec)

    fetch('http://104.236.134.72:4001/toplist')
        .then(res => res.json())
        .then(renderRank)

    function renderRec(recJson) {
        renderSlide(recJson.data.slider);
        renderRadios(recJson.data.radioList);
        renderSongs(recJson.data.songList);
        lazyload(document.querySelectorAll('.lazyload'));
        renderfooter(document.querySelector('.rec-tab'))
    }

    function renderRank(rankJson) {
        renderToplist(rankJson.data.topList)
        lazyload(document.querySelectorAll('.lazyload'));
    }

    function renderSlide(slides) {
        let slide = slides.map(slide => {
            return {link: slide.linkUrl, image: slide.picUrl}
        })
        new Slide({
            el: document.querySelector('.swiper-container'),
            slide
        })
    }

    let search = new Search(document.querySelector('.search-tab'))
    let player = new MusicPlayer(document.querySelector('#player'))
    document.querySelector('#show_player').addEventListener('click',() => {
        player.show();
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

    function renderRadios(radioList) {
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

    function renderSongs(songList) {
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

    function renderToplist(topList) {
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
                                ${songsList(topic.songList)}
                            </div>
                            <i class="topic-arrow"></i>
                        </div>
                    </div>
             </li>`).join('');
    }

    function songsList(songs) {
        return songs.map((song, i) =>
            `<p>${i + 1}<span class="text-name">${song.songname}</span>- ${song.singername}</p>
            `).join('');
    }


    function renderfooter(node) {
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
}()


