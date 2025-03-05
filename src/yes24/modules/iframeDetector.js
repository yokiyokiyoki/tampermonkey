/**
 * iframe检测模块 - 检测seat frame并进行处理
 */

// iframe检测初始化
export function initIframeDetector() {
    console.log('初始化iframe检测模块');
    checkForIframe();
}

// 检查iframe是否存在
function checkForIframe() {
    // 先直接检查是否已存在
    const iframe = document.querySelector('iframe[name="ifrmSeatFrame"]');
    if (iframe) {
        handleIframeFound(iframe);
        return;
    }
    
    // 设置观察器监听DOM变化
    setupObserver();
}

// 设置DOM变化观察器
function setupObserver() {
    console.log('未找到座位iframe，开始监控DOM变化');
    
    const observer = new MutationObserver(mutations => {
        for (const mutation of mutations) {
            if (mutation.type === 'childList' && mutation.addedNodes.length) {
                const iframe = document.querySelector('iframe[name="ifrmSeatFrame"]');
                if (iframe) {
                    console.log('通过DOM变化监控发现座位iframe!');
                    observer.disconnect();
                    handleIframeFound(iframe);
                    break;
                }
            }
        }
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
    
    // 设置超时，避免长时间消耗资源
    setTimeout(() => {
        observer.disconnect();
        console.log('停止DOM监控 (30秒超时)');
    }, 30000);
}

// 处理找到iframe的情况
function handleIframeFound(iframe) {
    // 显示提醒
    alert('已发现座位选择框架，座位助手已准备就绪！');
    
    console.log('座位iframe信息:', iframe);
    
    // 监听iframe内容变化
    iframe.addEventListener('load', function() {
        console.log('座位iframe内容已加载');
        // 这里可以添加后续处理，如初始化座位选择助手等
    });
}
