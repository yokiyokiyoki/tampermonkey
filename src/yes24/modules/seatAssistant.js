/**
 * 座位助手模块 - 负责初始化座位信息显示面板
 */
import { analyzeSeatInfo } from './seatAnalyzer';
import { createControlPanel, updatePanelData, updateRefreshStatus } from './uiManager';
import { clickSeat, clickSeats, clickLockButton } from './seatGrabber';
import { getIframe } from './iframeDetector';

// 全局状态
let activeIframe = null;
let isActive = false;
let seatObserver = null;
let currentSeatInfo = null;

// 自动刷新状态
let autoRefreshInterval = null;
let refreshCountdown = null;
let autoRefreshConfig = {
    isActive: false,
    interval: 0,
    count: 0,
    type: 'any',
    autoLock: false
};
let countdownTimer = null;

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
        currentSeatInfo = seatInfo; // 保存当前座位信息
        
        // 创建控制面板
        createControlPanel(seatInfo);
        
        // 设置监控，以便更新座位状态
        setupSeatMonitor(iframe);
        
        // 监听自动选座请求
        document.addEventListener('autoSeatRequest', handleAutoSeatRequest);
        
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
    currentSeatInfo = seatInfo; // 更新保存的座位信息
    updatePanelData(seatInfo);
}

/**
 * 处理自动选座请求
 * @param {CustomEvent} event - 包含自动选座请求参数的事件
 */
function handleAutoSeatRequest(event) {
    const { count, type, autoLock, refreshInterval } = event.detail;
    console.log(`收到自动选座请求: 数量=${count}, 类型=${type}, 自动锁票=${autoLock}, 刷新间隔=${refreshInterval}秒`);
    
    if (!activeIframe || !isActive) {
        console.warn('无法执行自动选座，座位信息不可用');
        return;
    }
    
    // 清除现有的自动刷新
    stopAutoRefresh();
    
    // 如果设置了刷新间隔，启动自动刷新
    if (refreshInterval > 0 && refreshInterval <= 180) {
        // 保存当前选座配置，用于刷新后重新执行
        autoRefreshConfig = {
            isActive: true,
            interval: refreshInterval,
            count: count,
            type: type,
            autoLock: autoLock
        };
        
        startAutoRefresh(refreshInterval);
        
        // 立即执行一次选座
        executeAutoSeat(count, type, autoLock);
    } else {
        // 没有设置刷新间隔，直接执行一次选座
        executeAutoSeat(count, type, autoLock);
    }
}

/**
 * 执行自动选座
 * @param {number} count - 座位数量
 * @param {string} type - 座位类型
 * @param {boolean} autoLock - 是否自动锁票
 */
function executeAutoSeat(count, type, autoLock) {
    if (!currentSeatInfo) {
        console.warn('无法执行自动选座，座位信息不可用');
        return;
    }
    
    // 如果座位数为0，不执行选座
    if (count === 0) {
        console.log('座位数为0，不执行自动选座');
        return;
    }
    
    // 根据类型选择座位
    let seatsToSelect = [];
    
    switch (type) {
        case 'vip':
            if (currentSeatInfo.vipInfo.length > 0) {
                seatsToSelect = currentSeatInfo.vipInfo.slice(0, count);
            } else {
                // 如果没有VIP座位，使用任意可用座位
                seatsToSelect = currentSeatInfo.availableInfo.slice(0, count);
            }
            break;
        case 'r':
            if (currentSeatInfo.rInfo.length > 0) {
                seatsToSelect = currentSeatInfo.rInfo.slice(0, count);
            } else {
                seatsToSelect = currentSeatInfo.availableInfo.slice(0, count);
            }
            break;
        case 's':
            if (currentSeatInfo.sInfo.length > 0) {
                seatsToSelect = currentSeatInfo.sInfo.slice(0, count);
            } else {
                seatsToSelect = currentSeatInfo.availableInfo.slice(0, count);
            }
            break;
        case 'any':
        default:
            seatsToSelect = currentSeatInfo.availableInfo.slice(0, count);
            break;
    }
    
    if (seatsToSelect.length > 0) {
        console.log(`准备自动选择${seatsToSelect.length}个座位:`, seatsToSelect);
        const seatIds = seatsToSelect.map(seat => seat.id);
        
        // 调用点击座位函数
        clickSeats(seatIds);
        
        // 如果开启了自动锁票，在选择座位后自动点击锁票按钮
        if (autoLock && seatIds.length > 0) {
            // 延迟一点时间再点击锁票按钮，确保座位选择操作已完成
            setTimeout(() => {
                console.log('准备自动点击锁票按钮');
                clickLockButton();
                
                // 如果锁票成功，停止自动刷新
                stopAutoRefresh();
            }, 1000);
        }
    } else {
        console.warn('没有找到符合条件的可用座位');
    }
}

/**
 * 开始自动刷新
 * @param {number} interval - 刷新间隔秒数
 */
function startAutoRefresh(interval) {
    if (interval <= 0 || interval > 180) {
        console.warn('刷新间隔无效:', interval);
        return;
    }
    
    console.log(`启动自动刷新，间隔${interval}秒`);
    
    autoRefreshConfig.isActive = true;
    refreshCountdown = interval;
    
    // 更新UI状态
    updateRefreshStatus(true, refreshCountdown);
    
    // 启动倒计时
    countdownTimer = setInterval(() => {
        refreshCountdown--;
        updateRefreshStatus(true, refreshCountdown);
        
        if (refreshCountdown <= 0) {
            clearInterval(countdownTimer);
        }
    }, 1000);
    
    // 设置刷新定时器
    autoRefreshInterval = setTimeout(() => {
        if (!autoRefreshConfig.isActive) return;
        
        console.log('执行自动刷新...');
        refreshIframe().then(() => {
            console.log('iframe已刷新，重新执行自动选座');
            
            // 刷新后重新执行自动选座
            setTimeout(() => {
                executeAutoSeat(
                    autoRefreshConfig.count, 
                    autoRefreshConfig.type, 
                    autoRefreshConfig.autoLock
                );
                
                // 重新开始下一轮刷新
                startAutoRefresh(interval);
            }, 1000); // 刷新后等待1秒再选座，确保页面加载完成
        });
    }, interval * 1000);
}

/**
 * 停止自动刷新
 */
function stopAutoRefresh() {
    if (autoRefreshInterval) {
        clearTimeout(autoRefreshInterval);
        autoRefreshInterval = null;
    }
    
    if (countdownTimer) {
        clearInterval(countdownTimer);
        countdownTimer = null;
    }
    
    autoRefreshConfig.isActive = false;
    updateRefreshStatus(false);
    console.log('已停止自动刷新');
}

/**
 * 刷新iframe
 * @returns {Promise} 刷新完成的Promise
 */
function refreshIframe() {
    return new Promise((resolve) => {
        const iframe = getIframe();
        if (!iframe) {
            console.warn('找不到iframe，无法刷新');
            resolve();
            return;
        }
        
        // 监听iframe加载完成事件
        const onLoadHandler = () => {
            iframe.removeEventListener('load', onLoadHandler);
            
            // 刷新后更新座位信息
            setTimeout(() => {
                if (iframe.contentDocument) {
                    const seatInfo = analyzeSeatInfo(iframe.contentDocument);
                    currentSeatInfo = seatInfo;
                    updatePanelData(seatInfo);
                }
                resolve();
            }, 500);
        };
        
        iframe.addEventListener('load', onLoadHandler);
        
        // 刷新iframe
        try {
            iframe.contentWindow.location.reload();
        } catch (error) {
            console.error('刷新iframe时出错:', error);
            iframe.removeEventListener('load', onLoadHandler);
            resolve();
        }
    });
}

/**
 * 关闭座位助手
 */
export function closeSeatAssistant() {
    // 停止自动刷新
    stopAutoRefresh();
    
    // 移除事件监听
    document.removeEventListener('autoSeatRequest', handleAutoSeatRequest);
    
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
    currentSeatInfo = null;
}
