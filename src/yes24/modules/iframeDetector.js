/**
 * iframe检测模块 - 检测seat frame并进行处理
 */
import { initSeatAssistant } from './seatAssistant';

// iframe检测初始化
export function initIframeDetector() {
    console.log('初始化iframe检测模块');
    checkForIframe();
}
// 获取iframe元素
export function getIframe(){
    return document.querySelector('iframe[name="ifrmSeatFrame"]');
}

// 检查iframe是否存在
function checkForIframe() {
    // 先直接检查是否已存在
    const iframe = getIframe();
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
    console.log('发现座位iframe，准备初始化座位助手');
    
    // 确保iframe内容已加载
    if (iframe.contentDocument && 
        iframe.contentDocument.readyState === 'complete' && 
        iframe.contentDocument.querySelector('.seatarea')) {
        console.log('iframe内容已加载，直接初始化座位助手');
        initSeatAssistant(iframe);
    } else {
        // 监听iframe加载事件
        iframe.addEventListener('load', function() {
            console.log('座位iframe内容已加载完成');
            initSeatAssistant(iframe);
        });
    }
}
