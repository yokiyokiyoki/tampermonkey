import { initIframeDetector } from './modules/iframeDetector';

(function() {
    'use strict';
    
    console.log('Yes24购票助手已加载');
    
    // 初始化各个模块
    function initialize() {
        // 初始化iframe检测模块
        initIframeDetector();
    }
    
    // 页面加载完成后初始化
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        initialize();
    } else {
        document.addEventListener('DOMContentLoaded', initialize);
    }
})();
