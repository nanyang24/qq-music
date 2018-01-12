# 原生 JS 实现 移动端QQ音乐 webApp
纯原生 JS ，ES6、7 语法实现，无依赖任何框架或库。
仿 QQ音乐 移动端的单页应用，采用 Express 伪造请求 API 数据。

## 在线演示

<div align=center><a href="https://qqmusic.n-y.io" target=_blank>在线预览戳我</a></div>
<div align=center>为了更好的体验，请用开发者工具模拟移动端体验</div>
<br>
<div align=center>
<img src="https://raw.githubusercontent.com/nanyang24/qq-music/master/githubimg/qqmusic.png" width="20%">
<div>扫二维码在手机上查看</div>
<div>效果更好</div>
</div>

> 服务器身在国外，网络可能会有波动

## 项目截图

<div align=center>
	<img src="https://raw.githubusercontent.com/nanyang24/qq-music/master/githubimg/qqmusic1.png" width="25%">
	<img src="https://raw.githubusercontent.com/nanyang24/qq-music/master/githubimg/qqmusic2.png" width="25%">
  <img src="https://raw.githubusercontent.com/nanyang24/qq-music/master/githubimg/qqmusic3.png" width="25%">
</div>

## 主要技术栈

ES6/7 + Webpack + Sass + Nodejs + Express + Cors + Request

## 实现功能

- 移动 web 端模仿 QQ 音乐，采用原生 JS 实现推荐页、排行榜页和搜索页
- 数据通过 伪造请求获取 QQ 音乐API 的数据，实现推荐页、排行榜页和搜索页 与官方同步
- 播放器页面显示可以进行播放、暂停、循环播放以及歌词同步滚动高亮显示
- 采用模块化的思想实现: Tab组件、推荐页rec组件、排行榜rank组件、搜索search组件、播放器player组件、歌词lyric组件和进度条progress bar 组件
- 首页轮播采用第三方组件 swiper，图片加载采用 自写 lazyload，对于滚动优化使用 自写 throttle 函数
- qqmusicserver.js 的服务器端口为4001，当 前端进行数据获取时存在跨域，因此引入 CORS 解决跨域问题。

## 项目运行

``` bash
# clone
git clone git@github.com:nanyang24/qq-music.git

# install dependencies
npm install

# local server
node server.js &

# start
npm run server
```





## 项目总结


### 1. 首页展示时，派发滚动事件，以供 lazyload 使用
```js
window.dispatchEvent(new Event('scroll'))
```

### 2. lazyload 函数要点

#### 加载图片
```js
function loadImage(image) {
        let img = new Image();  // new Image()
        img.src = image.dataset.src;
        img.onload = function () {
            image.src = img.src;
            image.classList.remove('lazyload');
            //
        }
    }
```

#### 判断是否在视窗
```js
function inViewPort(image) {
        let {top, right, bottom, left} = image.getBoundingClientRect();
        let vpWidth = document.documentElement.clientWidth;
        let vpHeight = document.documentElement.clientHeight;
        return (
            (top > 0 && top < vpHeight || bottom > 0 && bottom < vpHeight) &&
            (left > 0 && left < vpWidth || right > 0 && right < vpWidth)
        )
    }
```

#### 节流函数
```js
function throttle(func, wait) {
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
    };
```


网页开发时，常常需要了解某个元素是否进入了"视口"（viewport），即用户能不能看到它。

传统的实现方法是，监听到scroll事件后，调用目标元素（绿色方块）的 `getBoundingClientRect()` 方法，得到它对应于视口左上角的坐标，再判断是否在视口之内。这种方法的缺点是，由于scroll事件密集发生，计算量很大，容易造成性能问题。

目前有一个新的 IntersectionObserver API，可以自动"观察"元素是否可见，Chrome 51+ 已经支持。由于可见（visible）的本质是，目标元素与视口产生一个交叉区，所以这个 API 叫做"交叉观察器"。
`var io = new IntersectionObserver(callback, option);`

```js
let observer = new IntersectionObserver(function (entries) {
    entries.forEach(entry => {
        if (entry.intersectionRatio > 0) {
            loadImage(entry.target, () => {
                observer.unobserve(entry.target);
            })
        }
    })
}, {threshold: 0.01});

images.forEach(image => observer.observe(image));
```



### 3. flex 与 省略文本
在flex中使用 `text:ellipsis` 时，发现不起作用，发现p元素并没有实现超出自动使用...省略。
后来查了一下，有个小技巧，给column2加上min-width: 0, 问题解决。
而且要在，即除了text-overflow，white-space，overflow之外需要在flex项（就flex:1那一些容器）里面设置宽度！

### 4. QQ音乐接口 问题
https://segmentfault.com/q/1010000012698827/a-1020000012700711

http://c.y.qq.com/base/fcgi-bin/fcg_musicexpress.fcg?json=3&guid={0}