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
        seatCount: 2
    };

    // 全局状态变量
    const debug = true;
    let activeSeatDocument = null;
    let activeIframe = null;
    let selectedSeatCount = 0;
    let seatAreaObserver = null;
    let isPaused = false;
    
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
                    
                    // 初始化助手
                    addControlPanel(doc);
                    startSeatMonitoring(doc, seatArea);
                    
                    // 清除定时器
                    clearInterval(checkInterval);
                }
            } catch (e) {
                console.error("访问ifrmSeatFrame内容时出错:", e);
            }
        }
    }
    
    // 刷新页面或iframe
    function refreshSeatArea() {
        resetSeatSelection();
        
        // 备份配置，便于刷新后恢复
        const savedConfig = {
            autoSelectSeat: config.autoSelectSeat,
            preferredGrade: config.preferredGrade,
            seatCount: config.seatCount
        };
        
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
                                        addControlPanel(doc);
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
            addControlPanel(doc);
            startSeatMonitoring(doc, seatArea);
            
            // 检查面板是否真的创建了
            setTimeout(() => {
                if (!doc.getElementById('ticketAssistantPanel')) {
                    console.log("面板未能成功创建，再次尝试");
                    window.yes24SeatAssistantActive = false; // 重置状态
                    addControlPanel(doc);
                }
            }, 500);
            
        } catch (e) {
            console.error("初始化面板时出错:", e);
            setTimeout(() => checkAndInitializePanel(iframe, remainingAttempts - 1), 1000);
        }
    }

    // 添加控制面板
    function addControlPanel(targetDocument) {
        // 确保面板唯一性
        const existingPanel = targetDocument.getElementById('ticketAssistantPanel');
        if (existingPanel) {
            console.log("已存在控制面板，无需重复添加");
            return;
        }
        
        console.log("开始创建控制面板...");
        const panel = targetDocument.createElement('div');
        panel.id = 'ticketAssistantPanel';
        panel.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background-color: rgba(0, 0, 0, 0.7);
            color: white;
            padding: 10px;
            border-radius: 5px;
            z-index: 9999;
            font-size: 14px;
            max-width: 300px;
        `;
        
        let panelHtml = `
            <h3 style="margin: 0 0 10px 0; color: #fff;">yes24座位分析助手</h3>
            <p>座位状态: <span id="seatStatus">等待分析...</span></p>
            <p>可选座位: <span id="availableSeatCount">0</span> 个</p>
            <p>已选座位: <span id="selectedSeatCount">0</span> 个</p>
            <div style="margin-top: 5px; font-size: 12px;">
                <span>VIP座: <span id="vipCount">0</span></span> | 
                <span>R座: <span id="rCount">0</span></span> | 
                <span>S座: <span id="sCount">0</span></span>
            </div>
            <div style="margin-top: 10px;">
                <button id="pauseAssistant" style="margin-right: 5px;">暂停</button>
                <button id="refreshPage">刷新页面</button>
                <button id="resetSelection" style="margin-left: 5px; background-color: #dc3545; color: white;">重置选择</button>
            </div>
            <div style="margin-top: 10px;">
                <input type="checkbox" id="autoSelectSeat" ${config.autoSelectSeat ? 'checked' : ''}>
                <label for="autoSelectSeat">自动选择座位</label>
            </div>
            <div style="margin-top: 5px;">
                <label for="preferredGrade">优先等级:</label>
                <select id="preferredGrade" style="margin-left: 5px;">
                    <option value="">不限</option>
                    <option value="VIP" ${config.preferredGrade === 'VIP' ? 'selected' : ''}>VIP席</option>
                    <option value="R" ${config.preferredGrade === 'R' ? 'selected' : ''}>R席</option>
                    <option value="S" ${config.preferredGrade === 'S' ? 'selected' : ''}>S席</option>
                </select>
            </div>
            <div style="margin-top: 5px;">
                <label for="seatCount">选择座位数:</label>
                <select id="seatCount" style="margin-left: 5px;">
                    <option value="1" ${config.seatCount === 1 ? 'selected' : ''}>1个</option>
                    <option value="2" ${config.seatCount === 2 ? 'selected' : ''}>2个</option>
                    <option value="4" ${config.seatCount === 4 ? 'selected' : ''}>4个</option>
                    <option value="6" ${config.seatCount === 6 ? 'selected' : ''}>6个</option>
                </select>
                <span style="font-size: 11px; color: #ff9;">(最多10个)</span>
            </div>
        `;
        
        // 调试按钮
        if (debug) {
            panelHtml += `
                <div style="margin-top: 10px; border-top: 1px solid #555; padding-top: 10px;">
                    <button id="analyzeSeatBtn" style="margin-right: 5px;">分析座位</button>
                    <button id="highlightSeats">高亮座位</button>
                </div>
            `;
        }
        
        panel.innerHTML = panelHtml;
        targetDocument.body.appendChild(panel);
        console.log("控制面板已添加到DOM");

        // 添加事件监听
        targetDocument.getElementById('pauseAssistant').addEventListener('click', toggleAssistant);
        targetDocument.getElementById('refreshPage').addEventListener('click', refreshSeatArea);
        targetDocument.getElementById('resetSelection').addEventListener('click', resetSeatSelection);
        targetDocument.getElementById('autoSelectSeat').addEventListener('change', function() {
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
                    showMessage("没有找到可用座位", "info");
                }
            }
        });
        targetDocument.getElementById('preferredGrade').addEventListener('change', function() {
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
        targetDocument.getElementById('seatCount').addEventListener('change', function() {
            config.seatCount = parseInt(this.value);
        });
        
        // 调试按钮事件
        if (debug) {
            targetDocument.getElementById('analyzeSeatBtn').addEventListener('click', analyzeSeatStatus);
            targetDocument.getElementById('highlightSeats').addEventListener('click', highlightAllSeats);
        }
        
        // 标记为已激活
        window.yes24SeatAssistantActive = true;
        console.log("助手已标记为激活状态");
        
        showMessage("yes24座位分析助手已激活", "info", targetDocument);
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
        const activeDoc = activeSeatDocument;
        const btn = activeDoc.getElementById('pauseAssistant');
        const status = activeDoc.getElementById('seatStatus');
        
        if (isPaused) {
            btn.textContent = "继续";
            status.textContent = "已暂停";
            status.style.color = "yellow";
            
            if (seatAreaObserver) seatAreaObserver.disconnect();
        } else {
            btn.textContent = "暂停";
            status.textContent = "分析中...";
            status.style.color = "white";
            
            const seatArea = activeDoc.querySelector(config.seatSelectors.container);
            if (seatArea) startSeatMonitoring(activeDoc, seatArea);
        }
    }

    // 启动座位监控
    function startSeatMonitoring(doc, seatArea) {
        if (isPaused) return;
        
        if (seatAreaObserver) seatAreaObserver.disconnect();
        
        seatAreaObserver = new MutationObserver(() => {
            if (isPaused) return;
            
            updateActualSelectedSeats();
            const seatAnalysis = analyzeSeatStatus();
            
            if (selectedSeatCount >= 10 && config.autoSelectSeat) {
                disableAutoSelect();
            } else if (config.autoSelectSeat && seatAnalysis && seatAnalysis.available.length > 0) {
                trySelectSeats(seatAnalysis);
            }
        });
        
        // 观察选项
        seatAreaObserver.observe(seatArea, {
            childList: true,
            attributes: true,
            subtree: true,
            attributeFilter: ['class', 'style', 'title']
        });
        
        // 监听已选座位列表
        const selectedListContainer = doc.querySelector('.liSelSeat');
        if (selectedListContainer) {
            new MutationObserver(() => {
                if (!isPaused) updateActualSelectedSeats();
            }).observe(selectedListContainer, {
                childList: true,
                subtree: true
            });
        }
        
        // 立即分析一次
        analyzeSeatStatus();
    }
    
    // 分析座位状态
    function analyzeSeatStatus() {
        if (!activeSeatDocument) {
            console.log("没有活动座位文档，无法分析座位状态");
            return null;
        }
        
        const doc = activeSeatDocument;
        const statusEl = doc.getElementById('seatStatus');
        const availableCountEl = doc.getElementById('availableSeatCount');
        const selectedCountEl = doc.getElementById('selectedSeatCount');
        const vipCountEl = doc.getElementById('vipCount');
        const rCountEl = doc.getElementById('rCount');
        const sCountEl = doc.getElementById('sCount');
        
        if (!statusEl) {
            console.log("未找到状态元素，可能面板未正确加载");
            return null;
        }
        
        if (selectedCountEl) selectedCountEl.textContent = selectedSeatCount;
        
        try {
            console.log("开始分析座位状态...");
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
            
            // 更新面板显示
            if (availableCountEl) availableCountEl.textContent = availableSeats.length;
            if (vipCountEl) vipCountEl.textContent = vipSeats.length;
            if (rCountEl) rCountEl.textContent = rSeats.length;
            if (sCountEl) sCountEl.textContent = sSeats.length;
            
            if (availableSeats.length > 0) {
                statusEl.textContent = "发现可选座位!";
                statusEl.style.color = "lime";
                
                if (config.enableNotification && (!window._lastNotifiedSeatCount || window._lastNotifiedSeatCount !== availableSeats.length)) {
                    GM_notification({
                        title: 'yes24座位分析助手',
                        text: `发现${availableSeats.length}个可用座位! VIP:${vipSeats.length}, R:${rSeats.length}, S:${sSeats.length}`,
                        timeout: 3000,
                        onclick: () => window.focus()
                    });
                    window._lastNotifiedSeatCount = availableSeats.length;
                }
            } else {
                statusEl.textContent = "暂无可选座位";
                statusEl.style.color = "orange";
                window._lastNotifiedSeatCount = 0;
            }
            
            return { all: allSeats, available: availableSeats, vip: vipSeats, r: rSeats, s: sSeats };
        } catch (e) {
            console.error("分析座位状态出错:", e);
            if (statusEl) {
                statusEl.textContent = "分析出错";
                statusEl.style.color = "red";
            }
            return null;
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
            const checkbox = activeSeatDocument.getElementById('autoSelectSeat');
            if (checkbox) checkbox.checked = false;
            showMessage("已达到最大选择数量，自动选择已关闭", "info");
        }
    }

    // 更新已选座位数量
    function updateActualSelectedSeats() {
        if (!activeSeatDocument) return 0;
        
        const doc = activeSeatDocument;
        const selectedElements = doc.querySelectorAll('.selected, [aria-selected="true"], .s13[style*="background"], .s13[style*="border"]');
        
        // 检查网站上显示的座位数量
        const countText = doc.querySelector('#selectedSeatInfo, .seat-counter, .seat-count');
        let textCount = 0;
        
        if (countText) {
            const match = countText.textContent.match(/\d+/);
            if (match) textCount = parseInt(match[0]);
        }
        
        const count = Math.max(selectedElements.length, textCount, selectedSeatCount);
        
        if (count !== selectedSeatCount) {
            selectedSeatCount = count;
            const countEl = doc.getElementById('selectedSeatCount');
            if (countEl) countEl.textContent = count;
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
        
        const countEl = activeSeatDocument.getElementById('selectedSeatCount');
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
        overlay.style.cssText = `
            position: absolute;
            left: ${seatRect.left}px;
            top: ${seatRect.top}px;
            width: ${seatRect.width}px;
            height: ${seatRect.height}px;
            border: 2px solid ${color};
            background-color: rgba(${colorToRgb(color)}, 0.3);
            pointer-events: none;
            z-index: 999;
        `;
        doc.body.appendChild(overlay);
        
        // 创建标签
        const labelEl = doc.createElement('span');
        labelEl.style.cssText = `
            position: absolute;
            left: ${seatRect.left}px;
            top: ${seatRect.top - 18}px;
            background-color: ${color};
            color: black;
            font-size: 10px;
            padding: 1px 3px;
            border-radius: 2px;
            white-space: nowrap;
            pointer-events: none;
            z-index: 1000;
        `;
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
            container.style.cssText = `
                position: fixed;
                bottom: 20px;
                right: 20px;
                z-index: 10000;
                max-width: 300px;
            `;
            targetDoc.body.appendChild(container);
        }
        
        const msgEl = targetDoc.createElement('div');
        msgEl.style.cssText = `
            margin-top: 10px;
            padding: 10px;
            border-radius: 5px;
            color: white;
            background-color: ${type === 'error' ? 'rgba(220, 53, 69, 0.9)' : 'rgba(23, 162, 184, 0.9)'};
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
            transition: opacity 0.5s;
        `;
        msgEl.textContent = message;
        
        container.appendChild(msgEl);
        
        setTimeout(() => {
            msgEl.style.opacity = '0';
            setTimeout(() => msgEl.remove(), 500);
        }, 3000);
    }
})();
