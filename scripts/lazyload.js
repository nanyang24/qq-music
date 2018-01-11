export function lazyload(imagesNodeList) {
    let images = Array.prototype.slice.call(imagesNodeList);

    if ('IntersectionObserver' in window) {
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
    } else {
        let onScroll = throttle(function () {
            if (images.length === 0) {
                return window.removeEventListener('scroll', onScroll)
            }
            // images = images.filter(image => image.classList.contains('lazyload'));
            images.forEach(image => {
                if (inViewPort(image)) {
                    loadImage(image);
                }
            })
        }, 300);

        window.addEventListener('scroll', onScroll);
        window.dispatchEvent(new Event('scroll'));
    }


    function throttle(func, wait) {     // 节流
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

    function inViewPort(image) {
        let {top, right, bottom, left} = image.getBoundingClientRect();
        let vpWidth = document.documentElement.clientWidth;
        let vpHeight = document.documentElement.clientHeight;
        return (
            (top > 0 && top < vpHeight || bottom > 0 && bottom < vpHeight) &&
            (left > 0 && left < vpWidth || right > 0 && right < vpWidth)
        );
    };

    function loadImage(image, callback) {
        let img = new Image();  // new Image()
        img.src = image.dataset.src;
        img.onload = function () {
            image.src = img.src;
            image.classList.remove('lazyload'); // 加载成功的图片不在以后的遍历中出现
            if (typeof callback === 'function') {
                callback();
            }
        };
    };
}