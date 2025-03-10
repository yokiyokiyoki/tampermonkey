/**
 * 键盘操作模块
 * 处理各种键盘快捷键
 */
export default function createKeyboardModule(alertModule) {
    // 按键映射配置
    const keyActions = {
        'm': () => {
            clickButton('[ng-click="right.next()"]', 'M键触发下一页点击');
            clickButton('[ng-click="fn.common.goToNextStep()"]', 'M键触发下一步点击');
        },
        'n': () => {
            clickButton('[ng-click="right.next()"]', 'N键触发下一页点击');
            clickButton('[ng-click="fn.common.goToNextStep()"]', 'N键触发下一步点击');
        },
        'j': () => {
            clickButton('[ng-click="right.next()"]', 'J键触发下一页点击');
            clickButton('[ng-click="fn.common.goToNextStep()"]', 'J键触发下一步点击');
        },
        'k': () => {
            clickButton('[ng-click="right.next()"]', 'K键触发下一页点击');
            clickButton('[ng-click="fn.common.goToNextStep()"]', 'K键触发下一步点击');
        },
        'l': () => {
            clickButton('[ng-click="right.next()"]', 'L键触发下一页点击');
            clickButton('[ng-click="fn.common.goToNextStep()"]', 'L键触发下一步点击');
        }
    };

    // 点击按钮的通用函数
    function clickButton(selector, message) {
        const button = document.querySelector(selector);
        if (button) {
            button.click();
            alertModule.showMessage(message);
            return true;
        }
        return false;
    }

    // 初始化键盘监听
    function init() {
        document.addEventListener('keydown', function(event) {
            // 如果当前焦点在输入框、文本框等元素中，则不响应快捷键
            if (['input', 'textarea', 'select'].includes(document.activeElement.tagName.toLowerCase())) {
                return;
            }

            const key = event.key.toLowerCase();
            if (keyActions[key]) {
                event.preventDefault(); // 阻止默认行为
                keyActions[key]();
            }
        });
    }

    return {
        init: init
    };
}
