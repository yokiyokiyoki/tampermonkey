/**
 * 座位助手模块 - 负责初始化座位信息显示面板
 */
import { analyzeSeatInfo } from './seatAnalyzer';
import { createControlPanel, updatePanelData } from './uiManager';

// 全局状态
let activeIframe = null;
let isActive = false;
let seatObserver = null;

/**
 * 初始化座位助手
 * @param {HTMLIFrameElement} iframe - 包含座位的iframe元素
 */
export function initSeatAssistant(iframe) {
    if (isActive) return;
    
    try {
        console.log('初始化座位助手...');
        activeIframe = iframe;
        
        // 分析座位信息
        const seatInfo = analyzeSeatInfo(iframe.contentDocument);
        
        // 创建控制面板
        createControlPanel(seatInfo);
        
        // 设置监控，以便更新座位状态
        setupSeatMonitor(iframe);
        
        // 设置活动状态
        isActive = true;
    } catch (error) {
        console.error('初始化座位助手时出错:', error);
    }
}

/**
 * 设置座位监控
 * @param {HTMLIFrameElement} iframe - 包含座位的iframe元素
 */
function setupSeatMonitor(iframe) {
    const doc = iframe.contentDocument;
    const seatArea = doc.querySelector('.seatarea');
    
    if (!seatArea) {
        console.warn('未找到座位区域，无法设置监控');
        return;
    }
    
    // 创建观察器
    seatObserver = new MutationObserver(mutations => {
        // 检查是否有与座位相关的变化
        const needsUpdate = mutations.some(mutation => {
            if (mutation.type === 'attributes') {
                return ['class', 'style'].includes(mutation.attributeName);
            }
            return mutation.type === 'childList';
        });
        
        if (needsUpdate) {
            console.log('检测到座位变化，更新数据');
            updateSeatData();
        }
    });
    
    // 开始观察座位区域
    seatObserver.observe(seatArea, {
        childList: true,
        attributes: true,
        subtree: true,
        attributeFilter: ['class', 'style']
    });
    
    // 监视已选座位列表
    const selectedSeatsList = doc.querySelector('#liSelSeat');
    if (selectedSeatsList) {
        new MutationObserver(() => {
            console.log('检测到已选座位列表变化');
            updateSeatData();
        }).observe(selectedSeatsList, {
            childList: true,
            subtree: true
        });
    }
    
    console.log('座位监控已设置');
}

/**
 * 更新座位数据
 */
function updateSeatData() {
    if (!activeIframe || !isActive) return;
    
    const seatInfo = analyzeSeatInfo(activeIframe.contentDocument);
    updatePanelData(seatInfo);
}

/**
 * 关闭座位助手
 */
export function closeSeatAssistant() {
    if (seatObserver) {
        seatObserver.disconnect();
        seatObserver = null;
    }
    
    // 移除控制面板
    const panel = document.getElementById('yes24SeatAssistant');
    if (panel) {
        panel.remove();
    }
    
    isActive = false;
    activeIframe = null;
}
