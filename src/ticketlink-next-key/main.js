import createAlertModule from '../common/alertModule';
import createKeyboardModule from './modules/keyboardModule';

(function() {
    'use strict';

    // 初始化所有模块
    function initApp() {
        // 初始化自定义alert模块
        const alertModule = createAlertModule();
        
        // 初始化键盘操作模块，并传入alertModule用于显示消息
        const keyboardModule = createKeyboardModule(alertModule);
        
        // 启动键盘监听
        keyboardModule.init();
        
        // 显示初始化成功消息
        alertModule.showMessage('Ticketlink快捷键助手已启动');
    }

    // 页面加载完成后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initApp);
    } else {
        initApp();
    }
})();