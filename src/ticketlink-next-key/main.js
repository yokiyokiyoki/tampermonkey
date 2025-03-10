(function() {
    'use strict';

    // 监听键盘按下事件
    document.addEventListener('keydown', function(event) {
        // 检查按下的键是否是 M（不区分大小写）
        if (event.key.toLowerCase() === 'm') {
            // 查找目标元素
            const nextButton = document.querySelector('[ng-click="right.next()"]');

            // 如果元素存在则模拟点击
            if (nextButton) {
                nextButton.click();
                console.log('M键触发下一页点击');
            }

            const next2Button = document.querySelector('[ng-click="fn.common.goToNextStep()"]');

            // 如果元素存在则模拟点击
            if (next2Button) {
                next2Button.click();
                console.log('M键触发下一页点击');
            }
        }
    });
})();