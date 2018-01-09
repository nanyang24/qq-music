class Search {
    constructor(el) {
        this.$el = el;
        this.keyword = '';  // 输入搜索的值
        this.page = 1;      // 默认页数为1
        this.songs = [];
        this.fetching = false;  // 正在 fetch
        this.noMore = false;    // 是否没有更多数据

        this.$input = this.$el.querySelector('#search-input');
        this.$cancelBtn = this.$el.querySelector('.cancel-btn');    // 取消
        this.$delBtn = this.$el.querySelector('.icon_delete');      // 删除
        this.$songsList = this.$el.querySelector('.search_content');// 搜索显示的歌曲列表
        this.$record = this.$el.querySelector('.search-record')     // 搜索历史

        this.$input.addEventListener('keyup', this.enter.bind(this));   // 绑定this，才能在 enter 执行 this.search
        this.$input.addEventListener('focus', this.onFocus.bind(this));
        window.addEventListener('scroll', this.throttle(this.onScroll.bind(this), 300));
        this.$cancelBtn.addEventListener('click', this.ClickCancelBtn.bind(this));
        this.$delBtn.addEventListener('click', () => {
            this.$input.value = '';
            this.hide(this.$delBtn);
        });
        this.$record.addEventListener('click', this.clickRecord.bind(this));
        this.getHotkey();

        this.HISTORY_KEY = 'search_history';
        this.searchRecord = localStorage.getItem(this.HISTORY_KEY) ? localStorage.getItem(this.HISTORY_KEY).split(',') : [];
        // 初始化 localStorage，如果之前的LS存在就加载，否则新建一个数组
    }

    /**
     * @description enter 事件
     * @param {any} event
     * @returns
     * @memberof Search
     */
    enter(event) {
        let keyword = event.target.value.trim();
        this.changeDelicon();
        if (event.key !== 'Enter' || this.$input.value.length === 0) return;
        if (!this.page || this.keyword === keyword) return

        this.addRecord(keyword);
        this.search(keyword);
    }

    /**
     * @description 重置
     * @memberof Search
     */
    reset() {
        this.keyword = '';
        this.songs = [];
        this.page = 1;
        this.$songsList.innerHTML = '';
        this.noMore = false;
        this.hide(document.querySelector('#load-complete'));
        this.hide(document.querySelector('.search-tab .focus-wrapper #search_result .search-null'))
    }

    /**
     * @description 搜索
     * @param {any} keyword 用户输入的数据
     * @param {any} page 页数
     * @memberof Search
     */
    search(keyword, page) {
        this.hide(this.$el.querySelector('.search-record'));
        if (keyword === '') return
        if (this.fetching || this.noMore) return;
        if (keyword !== this.keyword) this.reset();
        this.keyword = keyword;
        this.loadFlag(true);
        fetch(`https://qq-music-api.now.sh/search?keyword=${this.keyword}&page=${page || this.page}`)
            .then(res => res.json())
            .then(json => {
                this.page = json.data.semantic.curpage;
                this.noMore = (json.message === 'no results');
                if (json.data.song.totalnum < 10 && json.data.song.totalnum > 0) {
                    this.show(document.querySelector('#load-complete'));
                }
                if (json.message === 'query forbid') {
                    document.querySelector('.search-null').style.display = 'block';
                }
                return json.data
            })
            .then(songs => this.renderResult(songs))
            .then(() => this.loadFlag(false))
            .catch(() => {
                this.show(document.querySelector('.search-tab .focus-wrapper #search_result .search-null'))
                this.hide(document.querySelector('#loading'));
                this.fetching = false
            });
    }

    /**
     * @description 渲染 搜索结果的特殊条目，歌手 或者 专辑
     * @param {any} zhida QQ音乐api定义的名称
     * @memberof Search
     */
    renderSinger(zhida) {
        let type = zhida.type;
        let imgUrl;
        if (type === 2) {
            imgUrl = zhida.singermid;
            return `
            <li data-singermid="${imgUrl}">
                <span class="media avatar">
                    <img src="https://y.gtimg.cn/music/photo_new/T001R68x68M000${imgUrl}.jpg?max_age=2592000" alt="${zhida.singername}">
                </span>
                <h6 class="main_tit">${zhida.singername}</h6>
                <p class="sub_tit"><span>单曲：${zhida.songnum}</span><span> 专辑：${zhida.albumnum}</span></p>
            </li>
            `
        } else if (type === 3) {
            imgUrl = zhida.albummid;
            return `
            <li data-albummid=${imgUrl}>
                <span class="media">
                    <img src="https://y.gtimg.cn/music/photo_new/T002R68x68M000${imgUrl}.jpg?max_age=2592000" alt="The Album">
                </span>
                <h6 class="main_tit">${zhida.albumname}</h6>
                <p class="sub_tit">${zhida.singername}</p>
            </li>
            `
        }
    }

    /**
     * @description 渲染 搜索结果列表 到页面，调用了renderSinger
     * @param {any} data 结果数据
     * @memberof Search
     */
    renderResult(data) {
        let topHtml;
        let zhida = data.zhida;
        zhida.type === 0 ? topHtml = '' : topHtml = this.renderSinger(zhida);
        let songs = data.song.list
        let html = songs.map(song => `
    <li data-limit="" data-songmid="001FL0V21f8blE">
            <i class="icon"></i>
            <h6 class="main_tit">${song.songname}</h6>
            <p class="sub_tit">${song.singer.map(s => s.name).join(' / ')}</p>
    </li>`).join('');
        this.$songsList.innerHTML += topHtml + html;
        // this.$songsList.insertAdjacentHTML('beforend', html);
    }

    /**
     * @description 获取 HotKey 数据
     * @memberof Search
     */
    getHotkey() {
        fetch('https://qq-music-api.now.sh/hotkey')
            .then(res => res.json())
            .then(json => this.renderHotkey(json.data))
    }

    /**
     * @description 渲染 Hotkey 数据 到页面
     * @param {any} data 结果数据
     * @memberof Search
     */
    renderHotkey(data) {
        let specialHtml = `<a href="${data.special_url}" class="tag_s tag_hot">${data.special_key}</a>`;
        let hotkey = data.hotkey;
        if (hotkey.length > 6) {
            hotkey = hotkey.slice(0, 6);
        }
        let html = hotkey.map(key => `
      <a href="#n=${key.n}" class="tag_s">${key.k}</a>
    `).join('');
        this.$el.querySelector('.result-tags').innerHTML = specialHtml + html
    }

    /**
     * @description 点击 搜索历史列表的事件，根据matches，判断点击的元素，执行不同的函数
     * @param {any} event 具体点击的事件
     * @memberof Search
     */
    clickRecord(event) {
        let target = event.target;
        if (target.matches('.icon_close')) {        // matches 如果元素被指定的选择器字符串选择，Element.matches()  方法返回true; 否则返回false。
            let keyword = target.parentNode.dataset.key;
            this.deleteRecord(keyword)
            this.renderRecord();
        } else if (target.matches('.record_handle')) {
            this.$el.querySelector('.search-record').innerHTML = '';
            this.searchRecord = [];
            localStorage.setItem(this.HISTORY_KEY, this.searchRecord);
        } else {
            let keyword = target.innerHTML;
            this.$input.value = keyword;
            this.show(document.querySelector('.icon_delete'));
            this.search(keyword);
        }
    }

    /**
     * @description 渲染 搜索历史记录列表 到页面，数据来自于 localStorage
     * @memberof Search
     */
    renderRecord() {
        this.$record.innerHTML = ''
        if (!localStorage[this.HISTORY_KEY]) return;
        let records = localStorage[this.HISTORY_KEY];
        let keywords = records.split(',');
        let html = keywords.map(keyword => `
      <li>
        <a href="javascript:;" class="record_main" data-key="${keyword}">
          <span class="icon icon_clock"></span>
          <span class="record_con">${keyword}</span>
          <span class="icon icon_close"></span>
        </a>
      </li>
    `).join('');
        let clearHtml = `<p id="record_clear_btn" class="record_handle">清除搜索记录</p>`
        this.$record.innerHTML = html + clearHtml;
    }

    /**
     * @description 删除 单独历史记录条目
     * @param {any} keyword 关键字
     * @memberof Search
     */
    deleteRecord(keyword) {
        let index = this.searchRecord.indexOf(keyword);
        this.searchRecord.splice(index, 1);     // 删除
        localStorage.setItem(this.HISTORY_KEY, this.searchRecord);
    }

    /**
     * @description 添加 单独历史记录条目
     * @param {any} keyword 关键字
     * @memberof Search
     */
    addRecord(keyword) {
        this.searchRecord.push(keyword);
        localStorage.setItem(this.HISTORY_KEY, this.searchRecord);
    }

    /**
     * @description 滚动事件
     * @param {any} event
     * @memberof Search
     */
    onScroll(event) {
        if (this.noMore) return window.removeEventListener('scroll', this.throttle(this.onScroll.bind(this), 300));
        if (document.documentElement.clientHeight + pageYOffset > document.body.offsetHeight - 50 && this.$el.querySelector('.search-record').style.display === 'none') {
            this.search(this.keyword, this.page + 1);
        }
    }

    /**
     * @description 节流函数
     * @param {any} func 要节流的函数
     * @param {any} wait 间隔的时间
     * @memberof Search
     */
    throttle(func, wait) {     // 节流
        let pre, timer;
        return function fn() {
            let cur = Date.now();
            let diff = cur - pre;
            if (!pre || diff >= wait) {
                func();
                pre = cur;
            } else if (diff < wait) {
                clearTimeout(timer);
                timer = setTimeout(fn, wait - diff);
            }
        }
    }

    /**
     * @description 根据是否在请求中，设置相应的改变
     * @param {any} flag 一个布尔值
     * @memberof Search
     */
    loadFlag(flag) {
        if (flag) {
            this.fetching = true;
            this.show(document.querySelector('#loading'));
        } else if (!flag) {
            this.fetching = false
            this.hide(document.querySelector('#loading'));
        }
    }

    /**
     * @description input 聚焦事件
     * @memberof Search
     */
    onFocus() {
        this.hide(document.querySelector('.search-result'));
        this.show(document.querySelector('.cancel-btn'));
        document.querySelector('.search_content').children.length === 0 ?
            this.show(this.$el.querySelector('.search-record')) :
            this.hide(this.$el.querySelector('.search-record'))

        this.renderRecord();
    }

    /**
     * @description 点击取消按钮
     * @memberof Search
     */
    ClickCancelBtn() {
        this.show(document.querySelector('.search-result'));
        this.hide(document.querySelector('.cancel-btn'));
        this.hide(document.querySelector('.icon_delete'));
        this.hide(this.$el.querySelector('.search-record'));
        this.reset();
        this.$input.value = '';
    }

    /**
     * @description 根据input值得数量显示可删除按钮
     * @memberof Search
     */
    changeDelicon() {
        this.$input.value.length === 0 ? this.hide(document.querySelector('.icon_delete')) :
            this.show(document.querySelector('.icon_delete'))
    }

    /**
     * @description 显示和隐藏函数
     * @param {any} element
     * @memberof Search
     */
    show(element) {
        element.style.display = 'block';
    }

    hide(element) {
        element.style.display = 'none';
    }
}

