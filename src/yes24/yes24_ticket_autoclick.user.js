// ==UserScript==
// @name         yes24座位分析助手
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  分析yes24网站上的座位可选状态，支持限制座位选择数量，使用DOM观察器替代轮询
// @author       You
// @match        *://ticket.yes24.com/*
// @match        *://*.ticket.yes24.com/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_notification
// @grant        window.focus
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    // 配置参数
    const config = {
        enableNotification: true,
        maxSelectableSeats: 2,
        seatSelectors: {
            container: '.seatarea',
            seatMap: '#divSeatArray',
            selectedList: '.liSelSeat li',
            seats: {
                all: '#divSeatArray div[class^="s"]',
                available: '#divSeatArray div.s13',
                vip: '#divSeatArray div.s9',
                r: '#divSeatArray div.s6',
                s: '#divSeatArray div.s8',
                withInfo: '#divSeatArray div[title]',
            }
        },
        autoSelectSeat: false,
        preferredArea: '',
        preferredGrade: '',
        seatCount: 2,
        autoRefresh: false,    // 自动刷新功能开关
        refreshInterval: 10    // 默认刷新间隔（秒）
    };

    // 全局状态变量
    const debug = true;
    let activeSeatDocument = null;
    let activeIframe = null;
    let selectedSeatCount = 0;
    let seatAreaObserver = null;
    let isPaused = false;
    let refreshTimer = null;   // 定时刷新计时器
    
    // 全局标识符 - 在window对象上标记面板状态，避免多个面板
    window.yes24SeatAssistantActive = window.yes24SeatAssistantActive || false;
    
    // 座位状态跟踪
    const seatSelectionState = {
        inProgress: false,
        lastSelectionTime: 0,
        selectedSeatIds: new Set()
    };

    // 初始化
    console.log("yes24座位分析助手已启动");
    
    // 定期检查iframe是否出现
    checkForTargetIframe();
    const checkInterval = setInterval(checkForTargetIframe, 1000);
    
    // 30秒后取消检查，避免资源浪费
    setTimeout(() => {
        clearInterval(checkInterval);
        console.log("停止自动检查iframe");
    }, 30000);
    
    // 专门查找目标iframe并初始化助手
    function checkForTargetIframe() {
        // 如果助手已经激活，则不再重复查找
        if (window.yes24SeatAssistantActive) return;
        
        // 只查找指定名称的iframe
        const targetIframe = document.querySelector('iframe[name="ifrmSeatFrame"]');
        if (targetIframe && targetIframe.contentDocument) {
            try {
                const doc = targetIframe.contentDocument;
                const seatArea = doc.querySelector(config.seatSelectors.container);
                
                if (seatArea) {
                    console.log("在指定iframe中找到座位区域!");
                    window.yes24SeatAssistantActive = true;
                    
                    // 设置活动文档
                    activeSeatDocument = doc;
                    activeIframe = targetIframe;
                    
                    // 初始化助手 - 将面板添加到主文档而不是iframe内
                    addControlPanel(document);
                    
                    // 确保函数已定义 - 先定义analyzeSeatStatus函数
                    if (typeof analyzeSeatStatus !== 'function') {
                        console.log("定义analyzeSeatStatus函数");
                        // 将analyzeSeatStatus定义移到这里，确保它在被调用之前已经定义
                        window.analyzeSeatStatus = analyzeSeatStatus;
                    }
                    
                    // 然后再启动监控
                    startSeatMonitoring(doc, seatArea);
                    
                    // 清除定时器
                    clearInterval(checkInterval);
                }
            } catch (e) {
                console.error("访问ifrmSeatFrame内容时出错:", e);
                // 添加更多错误信息帮助调试
                console.error("错误详情:", e.message);
                console.error("错误堆栈:", e.stack);
                showMessage(`访问座位区域出错: ${e.message}`, "error", document);
            }
        }
    }
    
    // 刷新页面或iframe
    function refreshSeatArea() {
        // 检查是否已选座位，如果已选择座位则不刷新
        if (checkAndSubmitIfSeatsSelected()) {
            console.log("已选择座位，取消刷新并提交");
            return;
        }
        
        resetSeatSelection();
        
        // 备份配置，便于刷新后恢复
        const savedConfig = {
            autoSelectSeat: config.autoSelectSeat,
            preferredGrade: config.preferredGrade,
            seatCount: config.seatCount,
            autoRefresh: config.autoRefresh,          // 保存刷新设置
            refreshInterval: config.refreshInterval   // 保存刷新间隔
        };
        
        // 停止自动刷新计时器
        stopAutoRefresh();
        
        // 重置全局标识
        window.yes24SeatAssistantActive = false;
        
        if (activeIframe) {
            try {
                // 先保留当前iframe引用
                const iframe = activeIframe;
                
                // 显示刷新消息
                showMessage("正在刷新座位区域...", "info", document);
                console.log("开始刷新iframe内容");
                
                // 确保清除观察器
                if (seatAreaObserver) {
                    seatAreaObserver.disconnect();
                    seatAreaObserver = null;
                }
                
                // 重置状态
                activeSeatDocument = null;
                activeIframe = null;
                isPaused = false;
                selectedSeatCount = 0;
                seatSelectionState.inProgress = false;
                seatSelectionState.selectedSeatIds.clear();
                
                // 添加一个一次性加载事件处理器
                const loadHandler = function onLoad() {
                    // 移除这个监听器，避免重复执行
                    iframe.removeEventListener('load', loadHandler);
                    console.log("iframe加载完成，准备重新初始化助手");
                    
                    // 恢复配置
                    Object.assign(config, savedConfig);
                    
                    // 使用多个检测点确保控制面板会出现
                    checkAndInitializePanel(iframe, 5);
                };
                
                iframe.addEventListener('load', loadHandler);
                
                // 刷新iframe
                const currentSrc = iframe.src || iframe.getAttribute('src');
                console.log("当前iframe源: ", currentSrc);
                
                if (!currentSrc) {
                    console.error("无法获取iframe的原始URL，刷新整个页面");
                    location.reload();
                    return;
                }
                
                // 先清空，确保触发load事件
                iframe.src = "about:blank"; 
                
                // 延迟恢复原始URL
                setTimeout(() => {
                    console.log("恢复iframe原始地址: ", currentSrc);
                    iframe.src = currentSrc;
                    
                    // 添加安全网 - 如果15秒后面板仍未出现，尝试强制初始化
                    setTimeout(() => {
                        if (!window.yes24SeatAssistantActive) {
                            console.log("安全检查: 面板未出现，尝试强制初始化");
                            try {
                                const doc = iframe.contentDocument;
                                if (doc) {
                                    // 恢复配置
                                    Object.assign(config, savedConfig);
                                    
                                    const seatArea = doc.querySelector(config.seatSelectors.container);
                                    if (seatArea) {
                                        console.log("找到座位区域，强制初始化面板");
                                        activeSeatDocument = doc;
                                        activeIframe = iframe;
                                        addControlPanel(document);
                                        startSeatMonitoring(doc, seatArea);
                                    } else {
                                        console.log("无法找到座位区域，可能需要手动刷新页面");
                                        showMessage("无法找到座位区域，请手动刷新页面", "error", document);
                                    }
                                }
                            } catch(e) {
                                console.error("强制初始化失败:", e);
                            }
                        }
                    }, 15000);
                }, 200);
                
                return;
            } catch (e) {
                console.error("刷新iframe失败:", e);
            }
        }
        
        // 如果上面的方法失败，就刷新整个页面
        console.log("无法刷新iframe，刷新整个页面");
        location.reload();
    }
    
    // 分阶段检测和初始化面板
    function checkAndInitializePanel(iframe, remainingAttempts) {
        if (remainingAttempts <= 0) {
            console.log("达到最大尝试次数，无法初始化面板");
            showMessage("无法初始化面板，请手动刷新页面", "error", document);
            return;
        }
        
        if (window.yes24SeatAssistantActive) {
            console.log("检测到面板已经初始化，跳过");
            return;
        }
        
        console.log(`尝试初始化面板 (剩余尝试: ${remainingAttempts})`);
        
        try {
            const doc = iframe.contentDocument;
            if (!doc) {
                console.log("无法访问iframe文档，可能是跨域限制");
                setTimeout(() => checkAndInitializePanel(iframe, remainingAttempts - 1), 1000);
                return;
            }
            
            const seatArea = doc.querySelector(config.seatSelectors.container);
            if (!seatArea) {
                console.log("未找到座位区域，稍后重试...");
                setTimeout(() => checkAndInitializePanel(iframe, remainingAttempts - 1), 1000);
                return;
            }
            
            console.log("找到座位区域，初始化面板");
            activeSeatDocument = doc;
            activeIframe = iframe;
            addControlPanel(document); // 将面板添加到主文档
            startSeatMonitoring(doc, seatArea);
            
            // 重要：确保在面板初始化后，如果需要，启动自动刷新
            if (config.autoRefresh && !isPaused) {
                console.log("面板初始化完成，重新启动自动刷新");
                startAutoRefresh();
            }
            
            // 检查面板是否真的创建了
            setTimeout(() => {
                if (!document.getElementById('ticketAssistantPanel')) {
                    console.log("面板未能成功创建，再次尝试");
                    window.yes24SeatAssistantActive = false; // 重置状态
                    addControlPanel(document); // 重新添加到主文档
                }
            }, 500);
            
        } catch (e) {
            console.error("初始化面板时出错:", e);
            setTimeout(() => checkAndInitializePanel(iframe, remainingAttempts - 1), 1000);
        }
    }

    // 添加控制面板
    function addControlPanel(targetDocument) {
        // 确保面板唯一性 - 在主文档中查找
        const existingPanel = document.getElementById('ticketAssistantPanel');
        if (existingPanel) {
            console.log("已存在控制面板，无需重复添加");
            return;
        }
        
        console.log("开始创建控制面板...");
        
        // 添加自定义样式到主文档
        const styleElement = document.createElement('style');
        styleElement.textContent = `#ticketAssistantPanel{position:fixed;top:10px;right:10px;background-color:rgba(33,37,41,0.95);color:#e9ecef;padding:0;border-radius:8px;z-index:99999;font-size:14px;width:280px;box-shadow:0 5px 15px rgba(0,0,0,0.3);font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;backdrop-filter:blur(5px);border:1px solid rgba(255,255,255,0.1);overflow:hidden;transition:all 0.3s ease}.panel-header{background:linear-gradient(135deg,#4568dc,#3a6073);padding:12px 15px;color:white;font-weight:bold;border-bottom:1px solid rgba(255,255,255,0.1);display:flex;justify-content:space-between;align-items:center;cursor:move;user-select:none}.panel-title{margin:0;font-size:16px;display:flex;align-items:center}.panel-title-icon{margin-right:8px;font-size:18px}.panel-controls{display:flex;align-items:center}.panel-pin{margin-left:8px;cursor:pointer;font-size:16px;opacity:0.7;transition:opacity 0.2s}.panel-pin:hover{opacity:1}.panel-pin.pinned{color:#fcc419}.panel-body{padding:15px}.status-group{background:rgba(0,0,0,0.2);border-radius:6px;padding:10px;margin-bottom:15px}.status-item{display:flex;justify-content:space-between;margin-bottom:5px}.status-label{color:#adb5bd}.status-value{font-weight:bold}.status-value.highlight{color:#20c997}.seat-types{display:flex;justify-content:space-between;background:rgba(0,0,0,0.15);border-radius:4px;padding:8px;margin-bottom:15px}.seat-type{text-align:center;flex:1}.seat-type-label{font-size:12px;color:#adb5bd}.seat-type-value{font-weight:bold;font-size:16px}.vip-seat{color:#20c997}.r-seat{color:#339af0}.s-seat{color:#fcc419}.control-group{margin-bottom:15px}.btn-group{display:flex;gap:5px;margin-bottom:15px}.btn{background-color:#495057;color:white;border:none;padding:8px 12px;border-radius:4px;cursor:pointer;flex:1;font-size:13px;transition:all 0.2s;display:inline-flex;align-items:center;justify-content:center}.btn:hover{background-color:#6c757d}.btn-icon{margin-right:5px}.btn-primary{background-color:#228be6}.btn-primary:hover{background-color:#1c7ed6}.btn-danger{background-color:#fa5252}.btn-danger:hover{background-color:#e03131}.option-group{margin-bottom:10px}.option-row{display:flex;align-items:center;margin-bottom:8px}.option-label{flex:1;font-size:13px}.custom-checkbox{width:18px;height:18px;margin-right:8px}.custom-select{background-color:#343a40;color:white;border:1px solid #495057;padding:5px 8px;border-radius:4px;font-size:13px;min-width:100px}.debug-section{margin-top:15px;padding-top:10px;border-top:1px solid rgba(255,255,255,0.1)}.small-note{color:#868e96;font-size:11px;margin-left:5px}@keyframes pulse{0%{opacity:0.6}50%{opacity:1}100%{opacity:0.6}}.analyzing{animation:pulse 1.5s infinite}`;
        document.head.appendChild(styleElement);
        
        // 创建面板 - 添加到主文档
        const panel = document.createElement('div');
        panel.id = 'ticketAssistantPanel';
        
        // 尝试恢复面板位置
        try {
            const savedPosition = GM_getValue('panelPosition');
            if (savedPosition) {
                panel.style.top = savedPosition.top;
                panel.style.left = savedPosition.left;
                panel.style.right = 'auto'; // 如果有保存的位置，清除默认的right值
            }
        } catch (e) {
            console.log("无法恢复面板位置:", e);
        }
        
        const panelHtml = `
            <div class="panel-header" id="panelDragHandle">
                <h3 class="panel-title">
                    <span class="panel-title-icon">🎫</span>
                    Yes24座位助手
                </h3>
                <div class="panel-controls">
                    <span class="panel-pin" id="panelPin" title="固定面板位置">📌</span>
                </div>
            </div>
            <div class="panel-body">
                <div class="status-group">
                    <div class="status-item">
                        <span class="status-label">状态:</span>
                        <span id="seatStatus" class="status-value">等待分析...</span>
                    </div>
                    <div class="status-item">
                        <span class="status-label">可选座位:</span>
                        <span id="availableSeatCount" class="status-value highlight">0</span>
                    </div>
                    <div class="status-item">
                        <span class="status-label">已选座位:</span>
                        <span id="selectedSeatCount" class="status-value">0</span>
                    </div>
                </div>
                
                <div class="seat-types">
                    <div class="seat-type">
                        <div class="seat-type-label">VIP座</div>
                        <div id="vipCount" class="seat-type-value vip-seat">0</div>
                    </div>
                    <div class="seat-type">
                        <div class="seat-type-label">R座</div>
                        <div id="rCount" class="seat-type-value r-seat">0</div>
                    </div>
                    <div class="seat-type">
                        <div class="seat-type-label">S座</div>
                        <div id="sCount" class="seat-type-value s-seat">0</div>
                    </div>
                </div>
                
                <div class="btn-group">
                    <button id="pauseAssistant" class="btn">
                        <span class="btn-icon">⏯️</span>暂停
                    </button>
                    <button id="refreshPage" class="btn btn-primary">
                        <span class="btn-icon">🔄</span>刷新
                    </button>
                    <button id="resetSelection" class="btn btn-danger">
                        <span class="btn-icon">🗑️</span>重置
                    </button>
                </div>
                
                <div class="option-group">
                    <div class="option-row">
                        <input type="checkbox" id="autoSelectSeat" class="custom-checkbox" ${config.autoSelectSeat ? 'checked' : ''}>
                        <label for="autoSelectSeat" class="option-label">自动选择座位</label>
                    </div>
                    
                    <div class="option-row">
                        <span class="option-label">优先等级:</span>
                        <select id="preferredGrade" class="custom-select">
                            <option value="">不限</option>
                            <option value="VIP" ${config.preferredGrade === 'VIP' ? 'selected' : ''}>VIP席</option>
                            <option value="R" ${config.preferredGrade === 'R' ? 'selected' : ''}>R席</option>
                            <option value="S" ${config.preferredGrade === 'S' ? 'selected' : ''}>S席</option>
                        </select>
                    </div>
                    
                    <div class="option-row">
                        <span class="option-label">选择座位数:</span>
                        <select id="seatCount" class="custom-select">
                            <option value="1" ${config.seatCount === 1 ? 'selected' : ''}>1个</option>
                            <option value="2" ${config.seatCount === 2 ? 'selected' : ''}>2个</option>
                            <option value="4" ${config.seatCount === 4 ? 'selected' : ''}>4个</option>
                            <option value="6" ${config.seatCount === 6 ? 'selected' : ''}>6个</option>
                        </select>
                        <span class="small-note">(最多10个)</span>
                    </div>
                    
                    <!-- 添加自动刷新选项 -->
                    <div class="option-row">
                        <input type="checkbox" id="autoRefresh" class="custom-checkbox" ${config.autoRefresh ? 'checked' : ''}>
                        <label for="autoRefresh" class="option-label">自动刷新并提交下一步</label>
                    </div>
                    
                    <div class="option-row">
                        <span class="option-label">刷新间隔:</span>
                        <select id="refreshInterval" class="custom-select" ${!config.autoRefresh ? 'disabled' : ''}>
                            <option value="5" ${config.refreshInterval === 5 ? 'selected' : ''}>5秒</option>
                            <option value="10" ${config.refreshInterval === 10 ? 'selected' : ''}>10秒</option>
                            <option value="15" ${config.refreshInterval === 15 ? 'selected' : ''}>15秒</option>
                            <option value="20" ${config.refreshInterval === 20 ? 'selected' : ''}>20秒</option>
                            <option value="30" ${config.refreshInterval === 30 ? 'selected' : ''}>30秒</option>
                        </select>
                    </div>
                </div>
                
                ${debug ? `
                <div class="debug-section">
                    <div class="btn-group">
                        <button id="analyzeSeatBtn" class="btn">
                            <span class="btn-icon">🔍</span>分析座位
                        </button>
                        <button id="highlightSeats" class="btn">
                            <span class="btn-icon">🔆</span>高亮座位
                        </button>
                    </div>
                </div>
                ` : ''}
            </div>
        `;
        
        panel.innerHTML = panelHtml;
        document.body.appendChild(panel);
        console.log("控制面板已添加到主文档");

        // 添加拖动功能
        makePanelDraggable(panel, document);

        // 添加事件监听 - 这些事件现在在主文档中
        document.getElementById('pauseAssistant').addEventListener('click', toggleAssistant);
        document.getElementById('refreshPage').addEventListener('click', refreshSeatArea);
        document.getElementById('resetSelection').addEventListener('click', resetSeatSelection);
        document.getElementById('panelPin').addEventListener('click', function() {
            this.classList.toggle('pinned');
            const isPinned = this.classList.contains('pinned');
            if (isPinned) {
                // 保存面板当前位置
                saveCurrentPanelPosition(panel);
                showMessage("面板位置已固定", "info", document);
            } else {
                // 清除保存的位置
                try {
                    GM_setValue('panelPosition', null);
                    showMessage("面板位置已取消固定", "info", document);
                } catch (e) {
                    console.log("无法清除面板位置:", e);
                }
            }
        });

        // 其他事件监听...现在都在主文档中
        document.getElementById('autoSelectSeat').addEventListener('change', function() {
            config.autoSelectSeat = this.checked;
            console.log("自动选择座位状态已更改为:", config.autoSelectSeat);
            
            // 如果启用了自动选择，立即尝试选择座位
            if (config.autoSelectSeat) {
                console.log("正在立即触发座位选择...");
                const seatAnalysis = analyzeSeatStatus();
                if (seatAnalysis && seatAnalysis.available.length > 0) {
                    console.log(`发现${seatAnalysis.available.length}个可用座位，尝试选择...`);
                    trySelectSeats(seatAnalysis);
                } else {
                    console.log("没有可用的座位可以选择");
                    showMessage("没有找到可用座位", "info", document);
                }
            }
        });
        document.getElementById('preferredGrade').addEventListener('change', function() {
            config.preferredGrade = this.value;
            console.log("已设置优先座位等级:", config.preferredGrade);
            
            // 如果已开启自动选择，则重新触发座位选择
            if (config.autoSelectSeat) {
                setTimeout(() => {
                    console.log("检测到优先级变化，重新选择座位...");
                    const seatAnalysis = analyzeSeatStatus();
                    trySelectSeats(seatAnalysis);
                }, 100);
            }
        });
        document.getElementById('seatCount').addEventListener('change', function() {
            config.seatCount = parseInt(this.value);
        });
        
        // 调试按钮事件
        if (debug) {
            document.getElementById('analyzeSeatBtn').addEventListener('click', analyzeSeatStatus);
            document.getElementById('highlightSeats').addEventListener('click', highlightAllSeats);
        }
        
        // 添加自动刷新相关事件监听
        document.getElementById('autoRefresh').addEventListener('change', function() {
            config.autoRefresh = this.checked;
            const intervalSelect = document.getElementById('refreshInterval');
            intervalSelect.disabled = !this.checked;
            
            if (this.checked) {
                console.log(`启用自动刷新，间隔${config.refreshInterval}秒`);
                showMessage(`已启用自动刷新，间隔${config.refreshInterval}秒`, "info", document);
                startAutoRefresh();
            } else {
                console.log('停用自动刷新');
                showMessage('已停用自动刷新', "info", document);
                stopAutoRefresh();
            }
        });
        
        document.getElementById('refreshInterval').addEventListener('change', function() {
            config.refreshInterval = parseInt(this.value);
            console.log(`设置刷新间隔为${config.refreshInterval}秒`);
            
            if (config.autoRefresh) {
                // 重新启动计时器使用新的间隔
                stopAutoRefresh();
                startAutoRefresh();
                showMessage(`刷新间隔已更新为${config.refreshInterval}秒`, "info", document);
            }
        });

        // 标记为已激活
        window.yes24SeatAssistantActive = true;
        console.log("助手已标记为激活状态");
        
        showMessage("yes24座位分析助手已激活", "info", document);

        // 检查是否有保存的位置，如果有则标记为已固定
        try {
            const savedPosition = GM_getValue('panelPosition');
            if (savedPosition) {
                const pinBtn = document.getElementById('panelPin');
                if (pinBtn) pinBtn.classList.add('pinned');
            }
        } catch (e) {
            console.log("无法检查面板固定状态:", e);
        }
    }

    // 使面板可拖动
    function makePanelDraggable(panel, doc) {
        const handle = doc.getElementById('panelDragHandle');
        let isDragging = false;
        let offsetX, offsetY;

        handle.addEventListener('mousedown', function(e) {
            // 如果点击了pin按钮，则不触发拖动
            if (e.target.id === 'panelPin') return;
            
            isDragging = true;
            offsetX = e.clientX - panel.getBoundingClientRect().left;
            offsetY = e.clientY - panel.getBoundingClientRect().top;
            
            // 添加临时样式提示正在拖动
            panel.style.opacity = '0.8';
            panel.style.transition = 'none';
            
            // 阻止默认行为和冒泡
            e.preventDefault();
            e.stopPropagation();
        });

        doc.addEventListener('mousemove', function(e) {
            if (!isDragging) return;
            
            let newX = e.clientX - offsetX;
            let newY = e.clientY - offsetY;
            
            // 确保面板不会完全移出视窗
            const panelWidth = panel.offsetWidth;
            const panelHeight = panel.offsetHeight;
            const windowWidth = window.innerWidth;
            const windowHeight = window.innerHeight;
            
            // 至少保留80px在视窗内
            newX = Math.min(Math.max(newX, -panelWidth + 80), windowWidth - 80);
            newY = Math.min(Math.max(newY, 0), windowHeight - 40);
            
            panel.style.left = newX + 'px';
            panel.style.top = newY + 'px';
            panel.style.right = 'auto'; // 清除可能的right值
            
            e.preventDefault();
        });

        doc.addEventListener('mouseup', function() {
            if (isDragging) {
                isDragging = false;
                panel.style.opacity = '1';
                panel.style.transition = 'opacity 0.3s ease';
                
                // 如果面板是固定状态，则保存当前位置
                const pinBtn = doc.getElementById('panelPin');
                if (pinBtn && pinBtn.classList.contains('pinned')) {
                    saveCurrentPanelPosition(panel);
                }
            }
        });
        
        // 确保在鼠标离开文档时也能结束拖动
        doc.addEventListener('mouseleave', function() {
            if (isDragging) {
                isDragging = false;
                panel.style.opacity = '1';
                panel.style.transition = 'opacity 0.3s ease';
            }
        });
    }
    
    // 保存面板当前位置
    function saveCurrentPanelPosition(panel) {
        try {
            const position = {
                top: panel.style.top,
                left: panel.style.left
            };
            GM_setValue('panelPosition', position);
            console.log("面板位置已保存:", position);
        } catch (e) {
            console.error("保存面板位置失败:", e);
        }
    }

    // 重置座位选择
    function resetSeatSelection() {
        selectedSeatCount = 0;
        seatSelectionState.inProgress = false;
        seatSelectionState.selectedSeatIds.clear();
        
        const activeDoc = activeSeatDocument;
        if (activeDoc && activeDoc.getElementById('selectedSeatCount')) {
            activeDoc.getElementById('selectedSeatCount').textContent = '0';
        }
        
        // 调用网站原生的重置函数
        try {
            if (activeDoc && activeDoc.defaultView && typeof activeDoc.defaultView.ChoiceReset === 'function') {
                activeDoc.defaultView.ChoiceReset();
            } else {
                console.log("未找到网站原生的ChoiceReset函数");
            }
        } catch (e) {
            console.error("重置座位选择出错:", e);
        }
        
        showMessage("已重置座位选择状态", "info", activeDoc);
    }

    // 切换助手状态
    function toggleAssistant() {
        isPaused = !isPaused;
        const btn = document.getElementById('pauseAssistant');
        const status = document.getElementById('seatStatus');
        
        if (isPaused) {
            btn.innerHTML = '<span class="btn-icon">▶️</span>继续';
            status.textContent = "已暂停";
            status.style.color = "#ffc107"; // 黄色
            status.classList.remove('analyzing');
            
            if (seatAreaObserver) seatAreaObserver.disconnect();
            
            // 暂停时也暂停自动刷新
            if (config.autoRefresh) {
                stopAutoRefresh();
            }
        } else {
            btn.innerHTML = '<span class="btn-icon">⏯️</span>暂停';
            status.textContent = "分析中...";
            status.style.color = "#20c997"; // 绿色
            status.classList.add('analyzing');
            
            if (activeSeatDocument) {
                const seatArea = activeSeatDocument.querySelector(config.seatSelectors.container);
                if (seatArea) startSeatMonitoring(activeSeatDocument, seatArea);
            }
            
            // 解除暂停时，如果启用了自动刷新，重新开始刷新
            if (config.autoRefresh) {
                startAutoRefresh();
            }
        }
    }

    // 启动座位监控
    function startSeatMonitoring(doc, seatArea) {
        if (isPaused) return;
        
        if (seatAreaObserver) seatAreaObserver.disconnect();
        
        // 检测座位变化
        seatAreaObserver = new MutationObserver((mutations) => {
            if (isPaused) return;
            
            // 判断是否有重要变化需要更新
            const needsUpdate = mutations.some(mutation => {
                // 如果是属性变化，可能是座位状态变化
                if (mutation.type === 'attributes') {
                    return ['class', 'style', 'selected', 'aria-selected'].includes(mutation.attributeName);
                }
                // 如果是子节点变化，可能是座位添加/移除
                return mutation.type === 'childList';
            });
            
            if (needsUpdate) {
                console.log("检测到DOM变化，更新座位状态");
                updateActualSelectedSeats();
                const seatAnalysis = analyzeSeatStatus();
                
                if (selectedSeatCount >= 10 && config.autoSelectSeat) {
                    disableAutoSelect();
                } else if (config.autoSelectSeat && seatAnalysis && seatAnalysis.available.length > 0) {
                    trySelectSeats(seatAnalysis);
                }
            }
        });
        
        // 观察选项 - 增强属性监听
        seatAreaObserver.observe(seatArea, {
            childList: true,
            attributes: true,
            subtree: true,
            characterData: true,
            attributeFilter: ['class', 'style', 'title', 'selected', 'aria-selected', 'onclick']
        });
        
        // 增强监听已选座位列表
        const selectedListContainers = doc.querySelectorAll('.liSelSeat, .seatList, .select-seat-area, .selectSeatInfo');
        selectedListContainers.forEach(container => {
            if (container) {
                new MutationObserver((mutations) => {
                    if (!isPaused) {
                        console.log("检测到选座列表变化，更新已选座位计数");
                        updateActualSelectedSeats();
                    }
                }).observe(container, {
                    childList: true,
                    subtree: true,
                    characterData: true,
                    attributes: true
                });
            }
        });
        
        // 监听文档可视状态变化，在文档重新变为可见时进行更新
        doc.addEventListener('visibilitychange', () => {
            if (!isPaused && document.visibilityState === 'visible') {
                console.log("页面重新可见，更新座位状态");
                updateActualSelectedSeats();
                analyzeSeatStatus();
            }
        });
        
        // 为文档添加交互事件监听
        ['click', 'touchend'].forEach(eventType => {
            doc.addEventListener(eventType, (e) => {
                // 只有在事件源与座位相关才触发更新
                const target = e.target;
                if (target && (
                    target.classList && target.classList.contains('s13') ||
                    target.getAttribute && target.getAttribute('name') === 'tk' ||
                    target.parentElement && target.parentElement.classList && 
                    target.parentElement.classList.contains('seatarea')
                )) {
                    // 延迟检查，确保座位选择状态已更新
                    setTimeout(() => {
                        if (!isPaused) {
                            console.log(`检测到${eventType}事件在座位元素，检查状态变化`);
                            updateActualSelectedSeats();
                        }
                    }, 300);
                }
            }, { passive: true }); // 使用passive标记提高性能
        });
        
        // 批量更新的指令队列，避免频繁更新
        let updateQueue = [];
        let updateScheduled = false;
        
        // 新增：批量处理更新的函数
        function processUpdates() {
            if (updateQueue.length > 0 && !isPaused) {
                console.log(`执行批量更新，队列长度: ${updateQueue.length}`);
                updateActualSelectedSeats();
                analyzeSeatStatus();
                updateQueue = [];
            }
            updateScheduled = false;
        }
        
        // 新增：节流函数，使用requestAnimationFrame替代setInterval
        function scheduleUpdate() {
            updateQueue.push(Date.now());
            
            if (!updateScheduled && !isPaused) {
                updateScheduled = true;
                requestAnimationFrame(processUpdates);
            }
        }
        
        // 建立与iframe父窗口的通信，以便在iframe切换时重新检测
        if (window.top !== window) {
            window.top.addEventListener('message', (event) => {
                if (event.data === 'checkSeatStatus' && !isPaused) {
                    scheduleUpdate();
                }
            });
        }
        
        // 初次分析 - 添加错误处理
        console.log("初始化座位监控，执行初次分析");
        try {
            analyzeSeatStatus();
            updateActualSelectedSeats();
        } catch (e) {
            console.error("初始化分析出错:", e);
            showMessage(`初始化分析出错: ${e.message}`, "error", document);
        }
    }

    // 尝试选择座位
    function trySelectSeats(analysis) {
        console.log("开始尝试选择座位...");
        if (seatSelectionState.inProgress) {
            console.log("座位选择正在进行中，本次请求被跳过");
            return;
        }
        
        updateActualSelectedSeats();
        
        if (selectedSeatCount >= 10) {
            console.log("已达到最大选择数量(10)，禁用自动选择");
            disableAutoSelect();
            return;
        }
        
        const remainingSlots = 10 - selectedSeatCount;
        if (remainingSlots <= 0) {
            console.log("没有剩余的座位槽位，禁用自动选择");
            disableAutoSelect();
            return;
        }
        
        if (!analysis) {
            console.log("没有收到座位分析数据，尝试重新分析");
            analysis = analyzeSeatStatus();
        }
        
        if (!analysis || analysis.available.length === 0) {
            console.log("没有可用座位可选");
            return;
        }
        
        // 根据优先等级筛选座位
        let seatsToSelect = [];
        
        if (config.preferredGrade) {
            console.log(`应用座位等级筛选: ${config.preferredGrade}`);
            
            // 根据选择的等级获取对应的座位
            switch (config.preferredGrade) {
                case 'VIP':
                    seatsToSelect = analysis.vip.slice();
                    console.log(`找到VIP座位: ${analysis.vip.length}个`);
                    break;
                case 'R':
                    seatsToSelect = analysis.r.slice();
                    console.log(`找到R座位: ${analysis.r.length}个`);
                    break;
                case 'S':
                    seatsToSelect = analysis.s.slice();
                    console.log(`找到S座位: ${analysis.s.length}个`);
                    break;
                default:
                    seatsToSelect = analysis.available.slice();
                    console.log(`使用所有可用座位: ${analysis.available.length}个`);
            }
            
            // 如果选择的等级没有座位，则提示用户
            if (seatsToSelect.length === 0) {
                console.log(`没有找到${config.preferredGrade}等级的座位，使用所有可用座位`);
                showMessage(`没有找到${config.preferredGrade}等级的座位`, "info");
                seatsToSelect = analysis.available.slice();
            }
        } else {
            seatsToSelect = analysis.available.slice();
            console.log(`没有指定优先等级，使用所有可用座位: ${seatsToSelect.length}个`);
        }
        
        // 过滤掉已选座位
        seatsToSelect = seatsToSelect.filter(seat => {
            if (!seat.id || seatSelectionState.selectedSeatIds.has(seat.id)) {
                return false;
            }
            
            const style = window.getComputedStyle(seat);
            if (seat.classList.contains('selected') || 
                seat.getAttribute('aria-selected') === 'true' || 
                style.backgroundColor.includes('rgb(255') || 
                style.border.includes('rgb(255')) {
                seatSelectionState.selectedSeatIds.add(seat.id);
                return false;
            }
            return true;
        });
        
        console.log(`过滤后有${seatsToSelect.length}个座位可供选择`);
        
        if (seatsToSelect.length === 0) {
            console.log("过滤后没有可选座位");
            return;
        }
        
        const numToSelect = Math.min(config.seatCount, seatsToSelect.length, remainingSlots);
        console.log(`将尝试选择${numToSelect}个座位`);
        
        if (numToSelect <= 0) {
            console.log("没有座位需要选择，禁用自动选择");
            disableAutoSelect();
            return;
        }
        
        seatSelectionState.inProgress = true;
        showMessage(`正在自动选择${numToSelect}个${config.preferredGrade || ""}座位...`, "info");
        
        for (let i = 0; i < numToSelect; i++) {
            setTimeout(() => {
                if (i < seatsToSelect.length) {
                    console.log(`点击第${i+1}个座位:`, seatsToSelect[i].id);
                    clickSeat(seatsToSelect[i]);
                }
                
                if (i === numToSelect - 1) {
                    setTimeout(() => {
                        console.log("座位选择完成，重置选择状态");
                        seatSelectionState.inProgress = false;
                        updateActualSelectedSeats();
                    }, 1000);
                }
            }, i * 200);
        }
    }

    // 禁用自动选择
    function disableAutoSelect() {
        if (config.autoSelectSeat) {
            config.autoSelectSeat = false;
            const checkbox = document.getElementById('autoSelectSeat');
            if (checkbox) checkbox.checked = false;
            showMessage("已达到最大选择数量，自动选择已关闭", "info", document);
        }
    }

    // 更新已选座位数量 - 使用#liSelSeat中的p元素计数
    function updateActualSelectedSeats() {
        if (!activeSeatDocument) return 0;
        
        const doc = activeSeatDocument;
        
        // 直接从#liSelSeat中计算p元素数量
        const liSelSeat = doc.querySelector('#liSelSeat');
        let count = 0;
        
        if (liSelSeat) {
            const pElements = liSelSeat.querySelectorAll('p');
            count = pElements.length;
            console.log(`从#liSelSeat中找到${count}个p元素，表示已选座位`);
        } else {
            console.log("未找到#liSelSeat元素，无法计算已选座位");
        }
        
        // 只在计数变化时更新UI
        if (count !== selectedSeatCount) {
            console.log(`更新已选座位计数: ${selectedSeatCount} -> ${count}`);
            selectedSeatCount = count;
            const countEl = document.getElementById('selectedSeatCount');
            if (countEl) countEl.textContent = count;
            
            // 如果手动选择座位达到最大值，禁用自动选择
            if (count >= 10 && config.autoSelectSeat) {
                disableAutoSelect();
            }
        }
        
        return count;
    }

    // 点击座位
    function clickSeat(seat) {
        if (!seat || !seat.id) {
            console.log("无效座位对象，跳过点击");
            return;
        }
        
        console.log(`正在点击座位: ${seat.id}`);
        seatSelectionState.selectedSeatIds.add(seat.id);
        selectedSeatCount++;
        
        const countEl = document.getElementById('selectedSeatCount');
        if (countEl) countEl.textContent = selectedSeatCount;
        
        try {
            seat.click();
            console.log(`座位${seat.id}点击成功`);
        } catch (e) {
            console.error("点击座位时出错:", e);
        }
        
        if (selectedSeatCount >= 10) {
            console.log("达到最大选择数量，禁用自动选择");
            disableAutoSelect();
        }
    }
    
    // 高亮座位
    function highlightAllSeats() {
        const analysis = analyzeSeatStatus();
        if (!analysis) return;
        
        analysis.vip.forEach(seat => highlightSeat(seat, 'lime', 'VIP席'));
        analysis.r.forEach(seat => highlightSeat(seat, 'blue', 'R席'));
        analysis.s.forEach(seat => highlightSeat(seat, 'cyan', 'S席'));
        
        const otherSeats = analysis.available.filter(seat => 
            !analysis.vip.includes(seat) && 
            !analysis.r.includes(seat) && 
            !analysis.s.includes(seat)
        );
        
        otherSeats.forEach(seat => highlightSeat(seat, 'yellow', '普通座位'));
        
        GM_notification({
            title: '座位高亮完成',
            text: `已高亮: VIP:${analysis.vip.length}, R:${analysis.r.length}, S:${analysis.s.length}, 其他:${otherSeats.length}`,
            timeout: 3000
        });
    }
    
    // 高亮单个座位
    function highlightSeat(seat, color, label) {
        // 保存原始样式参考，但不修改
        const seatRect = seat.getBoundingClientRect();
        const doc = seat.ownerDocument;
        
        // 创建叠加高亮层
        const overlay = doc.createElement('div');
        overlay.className = 'seat-highlight-overlay';
        overlay.style.cssText = `position:absolute;left:${seatRect.left}px;top:${seatRect.top}px;width:${seatRect.width}px;height:${seatRect.height}px;border:2px solid ${color};background-color:rgba(${colorToRgb(color)},0.3);pointer-events:none;z-index:999;`;
        doc.body.appendChild(overlay);
        
        // 创建标签
        const labelEl = doc.createElement('span');
        labelEl.style.cssText = `position:absolute;left:${seatRect.left}px;top:${seatRect.top-18}px;background-color:${color};color:black;font-size:10px;padding:1px 3px;border-radius:2px;white-space:nowrap;pointer-events:none;z-index:1000;`;
        labelEl.textContent = label;
        labelEl.className = 'seat-highlight-label';
        doc.body.appendChild(labelEl);
        
        // 定时清除高亮效果
        setTimeout(() => {
            overlay.remove();
            labelEl.remove();
        }, 5000);
    }
    
    // 颜色名称转RGB
    function colorToRgb(color) {
        const colors = {
            'lime': '0,255,0',
            'blue': '0,0,255',
            'cyan': '0,255,255',
            'yellow': '255,255,0',
            'red': '255,0,0'
        };
        return colors[color] || '0,0,0';
    }

    // 显示消息
    function showMessage(message, type = 'info', targetDoc = document) {
        let container = targetDoc.getElementById('seatAssistantMessages');
        if (!container) {
            container = targetDoc.createElement('div');
            container.id = 'seatAssistantMessages';
            container.style.cssText = `position:fixed;bottom:20px;right:20px;z-index:10000;max-width:300px;`;
            targetDoc.body.appendChild(container);
        }
        
        const msgEl = targetDoc.createElement('div');
        msgEl.style.cssText = `margin-top:10px;padding:12px 15px;border-radius:8px;color:white;background-color:${type === 'error' ? 'rgba(250,82,82,0.95)' : 'rgba(32,201,151,0.9)'};box-shadow:0 4px 10px rgba(0,0,0,0.2);transition:all 0.3s ease;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif;font-size:14px;display:flex;align-items:center;backdrop-filter:blur(5px);border-left:4px solid ${type === 'error' ? '#e03131' : '#12b886'};`;
        
        const icon = type === 'error' ? '❌' : '✅';
        msgEl.innerHTML = `<span style="margin-right:8px;font-size:16px;">${icon}</span>${message}`;
        
        container.appendChild(msgEl);
        
        // 使用动画效果
        setTimeout(() => {
            msgEl.style.opacity = '0';
            msgEl.style.transform = 'translateX(30px)';
            setTimeout(() => msgEl.remove(), 300);
        }, 3000);
    }

    // 先定义分析座位状态函数，确保它在被调用前已存在
    // 分析座位状态
    function analyzeSeatStatus() {
        if (!activeSeatDocument) {
            console.log("没有活动座位文档，无法分析座位状态");
            return null;
        }
        
        const doc = activeSeatDocument;
        const statusEl = document.getElementById('seatStatus');
        const availableCountEl = document.getElementById('availableSeatCount');
        const selectedCountEl = document.getElementById('selectedSeatCount');
        const vipCountEl = document.getElementById('vipCount');
        const rCountEl = document.getElementById('rCount');
        const sCountEl = document.getElementById('sCount');
        
        if (!statusEl) {
            console.log("未找到状态元素，可能面板未正确加载");
            return null;
        }
        
        if (selectedCountEl) selectedCountEl.textContent = selectedSeatCount;
        
        try {
            console.log("开始分析座位状态...");
            // 检查文档和选择器是否有效
            if (!doc.querySelector || typeof doc.querySelector !== 'function') {
                console.error("无效的文档对象，querySelector不可用");
                return null;
            }
            
            const allSeats = doc.querySelectorAll(config.seatSelectors.seats.all);
            console.log(`找到${allSeats.length}个座位元素`);
            
            const availableSeats = [];
            const vipSeats = [];
            const rSeats = [];
            const sSeats = [];
            
            allSeats.forEach(seat => {
                const title = seat.getAttribute('title');
                const className = seat.className;
                
                if (className.includes('s9')) {
                    vipSeats.push(seat);
                    availableSeats.push(seat);
                } 
                else if (className.includes('s6')) {
                    rSeats.push(seat);
                    availableSeats.push(seat);
                }
                else if (className.includes('s8')) {
                    sSeats.push(seat);
                    availableSeats.push(seat);
                }
                else if (className.includes('s13') && title) {
                    availableSeats.push(seat);
                }
            });
            
            console.log(`分析结果: 可选座位${availableSeats.length}个, VIP席${vipSeats.length}个, R席${rSeats.length}个, S席${sSeats.length}个`);
            
            // 更新主文档中的面板显示
            if (availableCountEl) availableCountEl.textContent = availableSeats.length;
            if (vipCountEl) vipCountEl.textContent = vipSeats.length;
            if (rCountEl) rCountEl.textContent = rSeats.length;
            if (sCountEl) sCountEl.textContent = sSeats.length;
            
            if (availableSeats.length > 0) {
                statusEl.textContent = "发现可选座位!";
                statusEl.style.color = "#20c997"; // 绿色
                statusEl.classList.remove('analyzing');
                
                if (config.enableNotification && (!window._lastNotifiedSeatCount || window._lastNotifiedSeatCount !== availableSeats.length)) {
                    try {
                        GM_notification({
                            title: 'yes24座位分析助手',
                            text: `发现${availableSeats.length}个可用座位! VIP:${vipSeats.length}, R:${rSeats.length}, S:${sSeats.length}`,
                            timeout: 3000,
                            onclick: () => window.focus()
                        });
                        window._lastNotifiedSeatCount = availableSeats.length;
                    } catch (notifyError) {
                        console.error("显示通知失败:", notifyError);
                    }
                }
            } else {
                statusEl.textContent = "暂无可选座位";
                statusEl.style.color = "#ffc107"; // 黄色
                statusEl.classList.add('analyzing');
                window._lastNotifiedSeatCount = 0;
            }
            
            return { all: allSeats, available: availableSeats, vip: vipSeats, r: rSeats, s: sSeats };
        } catch (e) {
            console.error("分析座位状态出错:", e);
            console.error("错误详情:", e.message);
            console.error("错误堆栈:", e.stack);
            if (statusEl) {
                statusEl.textContent = "分析出错";
                statusEl.style.color = "#fa5252"; // 红色
                statusEl.classList.remove('analyzing');
            }
            return null;
        }
    }

    // 停止自动刷新
    function stopAutoRefresh() {
        if (refreshTimer) {
            console.log(`停止自动刷新，清除定时器: ${refreshTimer}`);
            clearInterval(refreshTimer);
            refreshTimer = null;
        }
    }

    // 开始自动刷新
    function startAutoRefresh() {
        // 先停止可能存在的计时器
        stopAutoRefresh();
        
        if (config.autoRefresh && !isPaused) {
            console.log(`启动自动刷新，间隔: ${config.refreshInterval}秒`);
            refreshTimer = setInterval(() => {
                if (!isPaused) {
                    // 检查是否已选座位，如有则停止刷新并点击提交按钮
                    if (checkAndSubmitIfSeatsSelected()) {
                        console.log("检测到已选座位，停止自动刷新");
                        return;
                    }
                    
                    console.log(`执行定时刷新 (间隔: ${config.refreshInterval}秒)`);
                    refreshSeatArea();
                }
            }, config.refreshInterval * 1000);
            
            // 添加调试日志确认定时器已启动
            console.log(`自动刷新定时器已设置，定时器ID: ${refreshTimer}`);
        }
    }

    // 检查是否已选座位并提交
    function checkAndSubmitIfSeatsSelected() {
        const currentSelectedCount = getSelectedSeatsCount();
        if (currentSelectedCount > 0) {
            // 如果有座位被选中，停止自动刷新并点击提交按钮
            stopAutoRefresh();
            submitSeatSelection();
            return true;
        }
        return false;
    }

    // 提交座位选择 - 只查找并点击预定按钮
    function submitSeatSelection() {
        try {
            if (!activeSeatDocument) {
                console.log("无法提交座位选择：文档未加载");
                return false;
            }
            
            const selectedCount = getSelectedSeatsCount();
            if (selectedCount === 0) {
                console.log("没有已选座位，不执行提交");
                return false;
            }
            
            console.log(`检测到${selectedCount}个已选座位，尝试提交...`);
            
            // 直接查找预定按钮 - 使用常见id或class
            const bookingButton = activeSeatDocument.querySelector('#choicend, .booking, [class*="booking"], a.choice_end');
            
            if (bookingButton) {
                showMessage(`已选择${selectedCount}个座位，自动提交中...`, "info", document);
                console.log(`找到预定按钮，执行点击`);
                
                // 点击预定按钮
                bookingButton.click();
                
                // 更新状态
                if (document.getElementById('seatStatus')) {
                    document.getElementById('seatStatus').textContent = "已提交座位选择";
                    document.getElementById('seatStatus').style.color = "#20c997";
                }
                
                return true;
            } else {
                console.log("未找到预定按钮");
                showMessage("已选择座位，但未找到预定按钮", "error", document);
                return false;
            }
        } catch (e) {
            console.error("提交座位时出错:", e);
            return false;
        }
    }

    // 获取已选座位数量 - 从多个可能的来源获取
    function getSelectedSeatsCount() {
        if (!activeSeatDocument) return 0;
        
        const doc = activeSeatDocument;
        let count = 0;
        
        // 方法1: 从#liSelSeat中查找
        const liSelSeat = doc.querySelector('#liSelSeat');
        if (liSelSeat) {
            count = liSelSeat.querySelectorAll('p').length;
            console.log(`从#liSelSeat中找到${count}个已选座位`);
            if (count > 0) return count;
        }
        
        // 方法2: 从.seat-selected中查找
        const selectedSeatsElements = doc.querySelectorAll('.seat-selected, .sel-seat, .selected');
        if (selectedSeatsElements && selectedSeatsElements.length > 0) {
            count = selectedSeatsElements.length;
            console.log(`从.seat-selected中找到${count}个已选座位`);
            if (count > 0) return count;
        }
        
        // 方法3: 使用已保存的selectedSeatCount
        return selectedSeatCount;
    }
})();
