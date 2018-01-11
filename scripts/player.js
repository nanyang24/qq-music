import {playerAlbumUrl, songUrl, lyricsUrl} from "./help";

/**
 * @description 音乐播放器界面
 * @export
 * @class MusicPlayer
 */
export class MusicPlayer {
    constructor(el) {
        this.$el = el;
        this.$el.addEventListener('click', this.clickHandle.bind(this));
        this.$audio = this.createAudio();
        this.lyrics = new Lyrics(this.$el.querySelector('.player-lyrics'), this.$audio);
        this.progress = new ProgressBar(this.$el.querySelector('.progress'), this.$audio);
        this.fetching = false;
    }

    /**
     * @description 创建 audio
     * @returns HTMLAudioElement
     * @memberof MusicPlayer
     */
    createAudio() {
        let audio = document.createElement('audio');
        // this.$source = document.createElement('source')
        // audio.append(this.$source);
        audio.id = `player-${Math.floor(Math.random() * 100)}-${+new Date()}`;
        //播放结束的时候
        audio.addEventListener('ended', () => {
            this.$audio.play();
            this.lyrics.restart();
            this.progress.restart();
        })
        document.body.appendChild(audio);
        return audio;
    }

    /**
     * @description 处理点击事件
     * @param {any} event
     * @memberof MusicPlayer
     */
    clickHandle(event) {
        let target = event.target;
        switch (true) {
            case target.matches('.icon-play'):
                this.onPlay(event);
                break
            case target.matches('.icon-pause'):
                this.onPause(event);
                break
            case target.matches('.icon-list'):
                this.hide();
                break
        }
    }

    /**
     * @description 显示 play 按钮
     * @param {any} event
     * @memberof MusicPlayer
     */
    onPlay(event) {
        //如果正在 fetching 返回
        if (this.fetching) return
        this.$audio.play()
        this.lyrics.start()
        this.progress.start()
        event.target.classList.remove('icon-play');
        event.target.classList.add('icon-pause');
    }

    /**
     * @description 显示暂停按钮
     * @param {any} event
     * @memberof MusicPlayer
     */
    onPause() {
        this.$audio.pause()
        this.lyrics.pause()
        this.progress.pause()
        event.target.classList.remove('icon-pause');
        event.target.classList.add('icon-play');
    }

    /**
     * @description 播放
     * @param {any} [options={}]
     * @returns
     * @memberof MusicPlayer
     */
    play(options = {}) {
        if (!options) return;
        this.$el.querySelector('.song-name').innerText = options.songname;
        this.$el.querySelector('.song-artist').innerText = options.artist;
        this.progress.reset(options.duration);
        let url = playerAlbumUrl(options.albummid);

        this.$el.querySelector('.album-cover').src = url;
        this.$el.querySelector('.player-background').style.background = `url(${url})`;
        this.$el.querySelector('.player-background').style.backgroundSize = `cover`;
        this.$el.querySelector('.player-background').style.backgroundPosition = `bottom center`;
        if (options.songid) {
            if (this.songid !== options.songid) {
                this.$el.querySelector('.icon-action').className = 'icon-action icon-play';
            }
            this.songid = options.songid;
            // this.$audio.src = `http://dl.stream.qqmusic.qq.com/C400${options.songmid}.m4a?fromtag=38`;
            // this.$audio.src = `http://dl.stream.qqmusic.qq.com/C400003jdNrv1YWLY3.m4a?fromtag=38&vkey=4C845C218B8389A1651B261E5E2F9B75B1D5FBFB06F9D11665AC899C4FA533EDB113CBBDA623DC1781F5BCCC0EE6F78A980D687E0DDD8200&guid=2638402844`;
            this.$audio.src = songUrl(options.songmid);

            this.fetching = true;
            fetch(lyricsUrl(this.songid))
                .then(res => res.json())
                .then(json => json.lyric)
                .then(text => this.lyrics.reset(text))
                .catch((err) => console.log(err))
                .then(() => {
                    this.fetching = false;
                })
        }
        this.show();
    }

    /**
     * @description 显示播放器
     * @memberof MusicPlayer
     */
    show() {
        this.$el.classList.add('show');
        document.body.classList.add('noscroll')
    }

    /**
     * @description 隐藏播放器
     * @memberof MusicPlayer
     */
    hide() {
        this.$el.classList.remove('show');
        document.body.classList.remove('noscroll')
    }
}

/**
 * @description 歌词
 * @export
 * @class LyricsPlayer
 */
class Lyrics {
    constructor(el, audio) {
        this.$el = el;
        this.$audio = audio;
        this.$el.innerHTML = '<div class="player-lyrics-lines"></div>';
        this.$lines = this.$el.querySelector('.player-lyrics-lines');

        this.text = '';
        this.index = 0;
        this.lyrics = [];
        this.elapsed = 0;
        this.reset(this.text);
    }

    start() {
        this.pause()
        this.intervalId = setInterval(this.update.bind(this), 1000);
    }

    /**
     * @description 重新开始
     * @memberof LyricsPlayer
     */
    restart() {
        this.reset()
        this.start()
    }

    pause() {
        clearInterval(this.intervalId)
    }

    /**
     * @description 重置
     * @param {any} text
     * @memberof LyricsPlayer
     */
    reset(text) {
        this.pause();
        this.index = 0;
        this.$lines.style.transform = `translateY(0)`;
        let $active = this.$lines.querySelector('.active');
        if ($active) {
            $active.classList.remove('active')
        }
        if (text) {
            this.text = this.formatText(text) || '';
            this.lyrics = this.text.match(/^\[\d{2}:\d{2}.\d{2}\](.+)$/gm) || [];
            //如果 lyrics 数组有长度
            if (this.lyrics.length) this.render();
        }

        if (this.lyrics.length) {
            this.$lines.children[this.index].classList.add('active')
        }
    }

    /**
     * @description 渲染
     * @memberof LyricsPlayer
     */
    render() {
        let html = this.lyrics.map(line => `
          <div class="player-lyrics-line">${line.slice(10)}</div>
        `).join('')
        this.$lines.innerHTML = html
    }

    /**
     * @description 更新歌词
     * @memberof LyricsPlayer
     */
    update() {
        this.elapsed = Math.round(this.$audio ? this.$audio.currentTime : this.elapsed + 1);
        if (this.index === this.lyrics.length - 1) return;

        for (let i = this.index + 1; i < this.lyrics.length; i++) {
            let seconds = this.getSeconds(this.lyrics[i])
            // 如果匹配到 逝去的时间等于lyrics歌词里的某一个时间，并且没有下一条歌词或者洗啊一条歌词的时间大于当前逝去的时间
            if (this.elapsed === seconds &&
                (!this.lyrics[i + 1] || this.getSeconds(this.lyrics[i + 1]) > this.elapsed)) {
                this.$lines.children[this.index].classList.remove('active');
                this.$lines.children[i].classList.add('active');
                this.index = i;
            }
        }
        //如果歌词页数大于2的话，歌词向上翻
        if (this.index > 3) {
            let topY = -(this.index - 3) * this.LINE_HEIGHT;
            this.$lines.style.transform = `translateY(${topY}px)`
        }
    }

    //获取秒数
    getSeconds(line) {
        return +line.replace(/\[(\d{2})\:(\d{2}).*/, (match, p1, p2) =>
            (+p1) * 60 + (+p2)
        )
    }

    /**
     * @description 格式化文本 类似⬇️
     * [xx:xx.xx]xxxxx
     * [xx:xx.xx]xxxxx
     * [xx:xx.xx]xxxxx
     * @param {any} text
     * @returns
     * @memberof LyricsPlayer
     */
    formatText(text) {   // 将歌词文本变正常
        let div = document.createElement('div');
        div.innerHTML = text;
        return div.innerText;
    }
}

// 默认每条歌词的行高
Lyrics.prototype.LINE_HEIGHT = 42

/**
 * @description 进度条
 * @export
 * @class Progress
 */
class ProgressBar {
    constructor(el, audio) {
        this.$el = el;
        this.$audio = audio;
        this.elapsed = 0;
        this.duration = 0;
        this.progress = 0;
        this.render();
        this.$progress = this.$el.querySelector('.progress-bar-progress');
        this.$elapsed = this.$el.querySelector('.progress-elapsed');
        this.$duration = this.$el.querySelector('.progress-duration');
        this.$elapsed.innerText = this.formatTime(this.elapsed);
        this.$duration.innerText = this.formatTime(this.duration);
    }

    /**
     * @description 重新开始
     * @memberof Progress
     */
    restart() {
        this.reset();
        this.start();
    }

    /**
     * @description 开始
     * @memberof Progress
     */
    start() {
        this.pause()
        this.intervalId = setInterval(this.update.bind(this), 50)
    }

    /**
     * @description 清除计时器
     * @memberof Progress
     */
    pause() {
        clearInterval(this.intervalId)
    }

    /**
     * @description 更新时间
     * @memberof Progress
     */
    update() {
        this.elapsed = Math.round(this.$audio ? this.$audio.currentTime : this.elapsed + 0.05);

        // this.elapsed += 0.05
        // 如果当前时间大于总的持续时间的话就时间重置
        if (this.elapsed >= this.duration) this.reset()
        this.progress = this.elapsed / this.duration
        this.$progress.style.transform = `translate(${this.progress * 100 - 100}%)`
        this.$elapsed.innerText = this.formatTime(this.elapsed)
    }

    /**
     * @description 重置
     * @param {any} duration
     * @memberof Progress
     */
    reset(duration) {
        this.pause()
        this.elapsed = 0
        this.progress = 0
        this.$progress.style.transform = 'translate(-100%)';
        this.$elapsed.innerText = this.formatTime(this.elapsed);
        if (duration) {
            this.duration = +duration
            this.$duration.innerText = this.formatTime(this.duration)
        }
    }

    /**
     * @description 渲染
     * @memberof Progress
     */
    render() {
        this.$el.innerHTML = `
            <div class="progress-time progress-elapsed"></div>
            <div class="progress-bar">
              <div class="progress-bar-progress"></div>
            </div>
            <div class="progress-time progress-duration"></div>
        `
    }

    /**
     * @description 格式化时间毫秒
     * @param {any} seconds
     * @returns 返回 05:10这种形式的时间
     * @memberof Progress
     */
    formatTime(seconds) {
        let mins = Math.floor(seconds / 60)
        let secs = Math.floor(seconds % 60)
        if (mins < 10) mins = '0' + mins
        if (secs < 10) secs = '0' + secs
        return `${mins}:${secs}`
    }
}