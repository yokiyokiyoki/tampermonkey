import { initIframeDetector } from './modules/iframeDetector';
import { initAlertHandler } from './modules/alertHandler';

(function() {
    'use strict';
    
    console.log('Yes24购票助手已加载');
    
    // 初始化各个模块
    function initialize() {
        // 初始化Alert自动处理模块
        initAlertHandler();
        
        // 初始化iframe检测模块，它会在找到iframe后启动座位助手
        initIframeDetector();
    }
    
    // 页面加载完成后初始化
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        initialize();
    } else {
        document.addEventListener('DOMContentLoaded', initialize);
    }
})();
