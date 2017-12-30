(function () {
    let nav = document.querySelector('.nav')

    nav.addEventListener('click', function (e) {
        let target = e.target;
        Array.prototype.forEach.call(target.parentElement.children, children =>
            children.classList.remove('active')
        );
        target.classList.add('active');

        // 兼容写法
        let currentTab = document.querySelector(target.dataset.tab) ? document.querySelector(target.dataset.tab) : document.querySelector(target.getAttribute('data-tab'))
        if (currentTab) {
            Array.prototype.forEach.call(currentTab.parentElement.children, children =>
                children.classList.remove('active')
            )
            currentTab.classList.add('active')
        }
    })
})()