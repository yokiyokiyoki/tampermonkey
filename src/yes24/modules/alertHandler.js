/**
 * Alert处理模块 - 自动处理页面上的alert弹窗
 */

/**
 * 初始化Alert处理器
 */
export function initAlertHandler() {
    console.log('初始化Alert自动处理模块');
    
    // 保存原始的window.alert函数
    const originalAlert = window.alert;
    
    // 重写alert函数，自动点击确定
    window.alert = function(message) {
        console.log('检测到Alert弹窗，内容:', message);
        console.log('自动关闭Alert');
        
        // 可以在这里添加日志记录或其他处理
        
        // 如果需要，可以调用原始alert函数，但通常我们会直接屏蔽它
        // originalAlert.call(window, message);
        
        // 返回undefined，与原始alert保持一致
        return undefined;
    };
    
    // 处理可能的confirm对话框
    const originalConfirm = window.confirm;
    window.confirm = function(message) {
        console.log('检测到Confirm弹窗，内容:', message);
        console.log('自动确认Confirm');
        
        // 始终返回true，模拟用户点击了"确定"
        return true;
    };
    
    // 监听iframe中的alert (针对Yes24特殊情况)
    monitorIframeAlerts();
    
    console.log('Alert自动处理模块初始化完成');
}

/**
 * 监控iframe中的alert
 */
function monitorIframeAlerts() {
    // 监听iframe加载
    const observeDocument = new MutationObserver(mutations => {
        for (const mutation of mutations) {
            if (mutation.type === 'childList' && mutation.addedNodes.length) {
                // 检查是否有iframe被添加
                const iframes = document.querySelectorAll('iframe');
                iframes.forEach(iframe => {
                    try {
                        // 尝试访问iframe内容
                        if (iframe.contentWindow && !iframe.alertOverridden) {
                            overrideIframeAlert(iframe);
                            iframe.alertOverridden = true;
                        }
                    } catch (e) {
                        // 由于同源策略可能无法访问某些iframe
                        console.log('无法访问iframe内容:', e);
                    }
                });
            }
        }
    });
    
    observeDocument.observe(document.documentElement, {
        childList: true,
        subtree: true
    });
    
    // 处理现有的iframe
    const existingIframes = document.querySelectorAll('iframe');
    existingIframes.forEach(iframe => {
        try {
            overrideIframeAlert(iframe);
            iframe.alertOverridden = true;
        } catch (e) {
            console.log('无法访问已存在的iframe内容:', e);
        }
    });
}

/**
 * 重写iframe中的alert
 * @param {HTMLIFrameElement} iframe - iframe元素
 */
function overrideIframeAlert(iframe) {
    try {
        if (iframe.contentWindow) {
            iframe.addEventListener('load', function() {
                try {
                    // iframe加载完成后重写alert
                    const iframeWindow = iframe.contentWindow;
                    
                    // 保存原始函数
                    const originalIframeAlert = iframeWindow.alert;
                    const originalIframeConfirm = iframeWindow.confirm;
                    
                    // 重写alert
                    iframeWindow.alert = function(message) {
                        console.log('检测到iframe中的Alert弹窗，内容:', message);
                        console.log('自动关闭iframe中的Alert');
                        return undefined;
                    };
                    
                    // 重写confirm
                    iframeWindow.confirm = function(message) {
                        console.log('检测到iframe中的Confirm弹窗，内容:', message);
                        console.log('自动确认iframe中的Confirm');
                        return true;
                    };
                    
                    console.log('成功重写iframe alert');
                } catch (e) {
                    console.error('重写iframe alert失败:', e);
                }
            });
        }
    } catch (e) {
        console.error('访问iframe时出错:', e);
    }
}
