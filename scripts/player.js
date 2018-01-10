class MusicPlayer {
    constructor(el) {
        this.$el = el;
        this.$el.addEventListener('click', this.clickHandle.bind(this));
        this.$audio = this.createAudio();
        this.lyrics = new Lyrics(this.$el.querySelector('.player-lyrics'), this.$audio);
        this.progress = new ProgressBar(this.$el.querySelector('.progress'));
        this.fetching = false;
    }

    createAudio() {
        let audio = document.createElement('audio');
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

    onPlay(event) {
        //如果正在 fetching 返回
        if (this.fetching) return
        this.$audio.play()
        this.lyrics.start()
        this.progress.start()
        event.target.classList.remove('icon-play');
        event.target.classList.add('icon-pause');
    }

    onPause() {
        this.$audio.pause()
        this.lyrics.pause()
        this.progress.pause()
        event.target.classList.remove('icon-pause');
        event.target.classList.add('icon-play');
    }

    play(options = {}) {
        if (!options) return;
        this.$el.querySelector('.song-name').innerText = options.songname;
        this.$el.querySelector('.song-artist').innerText = options.artist;
        this.progress.reset(options.duration);

        let url = `https://y.gtimg.cn/music/photo_new/T002R150x150M000${options.albummid}.jpg`;
        this.$el.querySelector('.album-cover').src = url;
        this.$el.querySelector('.player-background').style.background = `url(${url})`;

        if (options.songid) {
            this.songid = options.songid;
            this.$audio.src = `http://dl.stream.qqmusic.qq.com/C400${options.songmid}.m4a?fromtag=38&vkey=CA1B66F5E6D873B0FF3183D430C87C3E3A066D49133BB24A9B6F845F0CF13DA60807A28770161A8B06E78535415931C5A691223893A27824&guid=2638402844`;
            this.fetching = true;
            fetch(`https://qq-music-api.now.sh/lyrics?id=${this.songid}`)
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

    show() {
        this.$el.classList.add('show');
    }

    hide() {
        this.$el.classList.remove('show');
    }
}

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

    restart() {
        this.reset()
        this.start()
    }

    pause() {
        clearInterval(this.intervalId)
    }

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

    render() {
        let html = this.lyrics.map(line => `
          <div class="player-lyrics-line">${line.slice(10)}</div>
        `).join('')
        this.$lines.innerHTML = html
    }

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
        if (this.index > 2) {
            let topY = -(this.index - 2) * this.LINE_HEIGHT;
            this.$lines.style.transform = `translateY(${topY}px)`
        }
        console.log(this.index)
    }

    getSeconds(line) {
        return +line.replace(/\[(\d{2})\:(\d{2}).*/, (match, p1, p2) =>
            (+p1) * 60 + (+p2)
        )
    }

    formatText(text) {   // 将歌词文本变正常
        let div = document.createElement('div');
        div.innerHTML = text;
        return div.innerText;
    }
}

Lyrics.prototype.LINE_HEIGHT = 42

class ProgressBar {
    constructor(el, duration, start) {
        this.$el = el;
        this.elapsed = 0;
        this.duration = duration || 0;
        this.progress = 0;
        this.render();
        this.$progress = this.$el.querySelector('.progress-bar-progress');
        this.$elapsed = this.$el.querySelector('.progress-elapsed');
        this.$duration = this.$el.querySelector('.progress-duration');
        this.$elapsed.innerText = this.formatTime(this.elapsed);
        this.$duration.innerText = this.formatTime(this.duration);
        if (start) this.start();
    }

    start() {
        this.pause()
        this.intervalId = setInterval(this.update.bind(this), 50)
    }

    pause() {
        clearInterval(this.intervalId)
    }

    update() {
        this.elapsed += 0.05
        // 如果当前时间大于总的持续时间的话就时间重置
        if (this.elapsed >= this.duration) this.reset()
        this.progress = this.elapsed / this.duration
        this.$progress.style.transform = `translate(${this.progress * 100 - 100}%)`
        this.$elapsed.innerText = this.formatTime(this.elapsed)
    }

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

    render() {
        this.$el.innerHTML = `
            <div class="progress-time progress-elapsed"></div>
            <div class="progress-bar">
              <div class="progress-bar-progress"></div>
            </div>
            <div class="progress-time progress-duration"></div>
        `
    }

    formatTime(seconds) {
        let mins = Math.floor(seconds / 60)
        let secs = Math.floor(seconds % 60)
        if (mins < 10) mins = '0' + mins
        if (secs < 10) secs = '0' + secs
        return `${mins}:${secs}`
    }
}
