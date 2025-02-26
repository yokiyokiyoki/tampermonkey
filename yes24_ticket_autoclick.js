// ==UserScript==
// @name         yes24座位分析助手
// @namespace    http://tampermonkey.net/
// @version      0.9
// @description  分析yes24网站上的座位可选状态，支持限制座位选择数量
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

    // 配置参数 - 已根据yes24实际座位结构优化
    const config = {
        // 检测间隔时间(毫秒)
        checkInterval: 500,
        // DOM 变化检测间隔
        domCheckInterval: 1000,
        // 是否启用通知
        enableNotification: true,
        // 最大可选座位数量
        maxSelectableSeats: 2,
        // 座位选择器 - 已根据html示例优化
        seatSelectors: {
            // 主容器
            container: '.seatarea',
            // 座位区域
            seatMap: '#divSeatArray',
            // 座位类型选择器
            seats: {
                // 根据演示的HTML，座位使用div元素，有s类前缀
                all: '#divSeatArray div[class^="s"]',
                // s13类是标准座位，未指定其他特殊类表示可选座位
                available: '#divSeatArray div.s13',
                // s9类根据示例应该是VIP座位
                vip: '#divSeatArray div.s9',
                // s6类根据示例应该是R等级座位
                r: '#divSeatArray div.s6',
                // s8类根据示例应该是S等级座位
                s: '#divSeatArray div.s8',
                // 任何带有title属性的座位视为可选的
                withInfo: '#divSeatArray div[title]',
            }
        },
        // 是否自动选择座位
        autoSelectSeat: false,
        // 优先选择的座位区域
        preferredArea: '',
        // 优先选择的座位等级 (VIP, R, S)
        preferredGrade: '',
        // 自动选择座位数量 (1-10)
        seatCount: 2
    };

    // 调试模式
    const debug = true;
    
    // 记录包含座位区域的文档或iframe
    let activeSeatDocument = null;
    let activeIframe = null;
    
    // 添加已选择座位的计数器
    let selectedSeatCount = 0;
    
    // 座位选择状态
    let seatSelectionState = {
        inProgress: false,
        lastSelectionTime: 0,
        selectedSeatIds: new Set()
    };
    
    // 初始化 - 不再立即添加面板
    console.log("yes24座位分析助手已启动");
    
    // 监视DOM变化，当座位区域出现时才初始化面板和监控
    startDOMObserver();

    // 监视DOM变化
    function startDOMObserver() {
        // 首先立即检查一次
        checkForSeatArea();
        
        // 然后定期检查
        setInterval(checkForSeatArea, config.domCheckInterval);
    }
    
    // 面板是否已添加
    let panelAdded = false;
    let monitoringStarted = false;
    
    // 检查页面中是否存在座位区域
    function checkForSeatArea() {
        // 检查当前文档
        if (checkDocumentForSeatArea(document)) {
            activeSeatDocument = document;
            activeIframe = null;
            return true;
        }
        
        // 检查所有iframe
        const iframes = document.querySelectorAll('iframe');
        for (let i = 0; i < iframes.length; i++) {
            try {
                const iframe = iframes[i];
                // 确保iframe已加载并且可以访问其内容
                if (iframe.contentDocument) {
                    if (checkDocumentForSeatArea(iframe.contentDocument)) {
                        activeSeatDocument = iframe.contentDocument;
                        activeIframe = iframe;
                        return true;
                    }
                }
            } catch (e) {
                // 跨域iframe会抛出错误，忽略
                if (debug) console.log("无法访问iframe内容:", e);
            }
        }
        
        return false;
    }
    
    // 在指定文档中检查座位区域
    function checkDocumentForSeatArea(doc) {
        const seatArea = doc.querySelector(config.seatSelectors.container);
        if (seatArea) {
            console.log("找到座位区域:", seatArea);
            
            // 如果面板尚未添加，则添加面板
            if (!panelAdded) {
                addControlPanel(doc);
                panelAdded = true;
            }
            
            // 如果监控尚未启动，则启动监控
            if (!monitoringStarted) {
                startSeatMonitoring();
                monitoringStarted = true;
            }
            
            return true;
        }
        
        return false;
    }

    // 添加控制面板
    function addControlPanel(targetDocument) {
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
            <h3 style="margin: 0 0 10px 0; color: #fff;">yes24座位分析助手已激活</h3>
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
                <label for="preferredArea" style="display: block; margin-bottom: 3px;">优先区域:</label>
                <input type="text" id="preferredArea" value="${config.preferredArea}" style="width: 90%;" placeholder="例如: Floor, Area, Row">
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
                    <option value="3" ${config.seatCount === 3 ? 'selected' : ''}>3个</option>
                    <option value="4" ${config.seatCount === 4 ? 'selected' : ''}>4个</option>
                    <option value="6" ${config.seatCount === 6 ? 'selected' : ''}>6个</option>
                    <option value="8" ${config.seatCount === 8 ? 'selected' : ''}>8个</option>
                    <option value="10" ${config.seatCount === 10 ? 'selected' : ''}>10个</option>
                </select>
                <span style="font-size: 11px; color: #ff9;">(最多10个)</span>
            </div>
        `;
        
        // 如果是调试模式，添加调试按钮
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

        // 添加事件监听
        targetDocument.getElementById('pauseAssistant').addEventListener('click', toggleAssistant);
        targetDocument.getElementById('refreshPage').addEventListener('click', refreshSeatArea);
        targetDocument.getElementById('autoSelectSeat').addEventListener('change', function() {
            config.autoSelectSeat = this.checked;
        });
        targetDocument.getElementById('preferredArea').addEventListener('change', function() {
            config.preferredArea = this.value.trim();
        });
        targetDocument.getElementById('preferredGrade').addEventListener('change', function() {
            config.preferredGrade = this.value;
        });
        targetDocument.getElementById('seatCount').addEventListener('change', function() {
            config.seatCount = parseInt(this.value);
        });
        
        // 添加重置选择的事件监听
        targetDocument.getElementById('resetSelection').addEventListener('click', resetSeatSelection);
        
        // 调试按钮事件监听
        if (debug) {
            targetDocument.getElementById('analyzeSeatBtn').addEventListener('click', () => {
                const result = analyzeSeatStatus();
                console.log("座位分析结果:", result);
                
                if (result && result.available.length > 0) {
                    console.log("第一个可选座位:", result.available[0]);
                    console.log("座位HTML:", result.available[0].outerHTML);
                }
            });
            
            targetDocument.getElementById('highlightSeats').addEventListener('click', () => {
                highlightAllSeats();
            });
        }
        
        showMessage("yes24座位分析助手已激活", "info", targetDocument);
    }

    // 刷新包含座位区域的iframe或页面
    function refreshSeatArea() {
        // 重置选择状态
        resetSeatSelection();
        
        if (activeIframe) {
            console.log("刷新包含座位区域的iframe");
            
            // 尝试刷新iframe内容
            try {
                // 方法1: 使用iframe的src刷新
                const currentSrc = activeIframe.src;
                activeIframe.src = currentSrc;
                
                // 提示用户
                showMessage("正在刷新座位区域...", "info", document);
                
                // 刷新后可能需要重置一些状态
                panelAdded = false;
                monitoringStarted = false;
                
                return;
            } catch (e) {
                console.error("刷新iframe失败:", e);
            }
        }
        
        // 如果找不到包含座位区域的iframe，或者刷新iframe失败，则刷新整个页面
        console.log("找不到座位区域iframe或刷新失败，刷新整个页面");
        location.reload();
    }
    
    // 重置座位选择状态
    function resetSeatSelection() {
        selectedSeatCount = 0;
        seatSelectionState = {
            inProgress: false,
            lastSelectionTime: 0,
            selectedSeatIds: new Set()
        };
        
        const activeDoc = getActiveDocument();
        if (activeDoc && activeDoc.getElementById('selectedSeatCount')) {
            activeDoc.getElementById('selectedSeatCount').textContent = '0';
        }
        
        console.log("已重置座位选择状态");
        showMessage("已重置座位选择状态", "info", activeDoc);
    }

    // 切换助手状态
    let isPaused = false;
    function toggleAssistant() {
        isPaused = !isPaused;
        const btn = document.getElementById('pauseAssistant');
        const status = document.getElementById('seatStatus');
        if (isPaused) {
            btn.textContent = "继续";
            status.textContent = "已暂停";
            status.style.color = "yellow";
        } else {
            btn.textContent = "暂停";
            status.textContent = "分析中...";
            status.style.color = "white";
        }
    }

    // 启动座位监控
    function startSeatMonitoring() {
        setInterval(() => {
            if (isPaused) return;
            
            if (isSeatSelectionPage()) {
                // 更新实际已选座位数量
                updateActualSelectedSeats();
                
                // 如果已达到10个座位，确保自动选择被禁用
                if (selectedSeatCount >= 10 && config.autoSelectSeat) {
                    disableAutoSelect();
                }
                
                analyzeSeatStatus();
                
                // 如果启用自动选择座位且未达到10个，则尝试选择座位
                if (config.autoSelectSeat && selectedSeatCount < 10) {
                    trySelectSeats();
                }
            }
        }, config.checkInterval);
    }
    
    // 判断是否为座位选择页面
    function isSeatSelectionPage() {
        // 检查URL是否包含座位相关的路径
        const seatRelatedURLs = ['seat', 'booking', 'ticket', 'reserve'];
        if (seatRelatedURLs.some(keyword => window.location.href.includes(keyword))) {
            // 检查是否存在座位区域容器
            if (document.querySelector(config.seatSelectors.container)) {
                return true;
            }
            
            // 检查所有iframe
            const iframes = document.querySelectorAll('iframe');
            for (let i = 0; i < iframes.length; i++) {
                try {
                    const iframe = iframes[i];
                    if (iframe.contentDocument && iframe.contentDocument.querySelector(config.seatSelectors.container)) {
                        return true;
                    }
                } catch (e) {
                    // 忽略跨域错误
                }
            }
        }
        return false;
    }

    // 获取当前活动文档（主文档或包含座位区域的iframe文档）
    function getActiveDocument() {
        return activeSeatDocument || document;
    }
    
    // 分析座位状态
    function analyzeSeatStatus() {
        const activeDoc = getActiveDocument();
        const seatStatus = activeDoc.getElementById('seatStatus');
        const availableSeatCountEl = activeDoc.getElementById('availableSeatCount');
        const selectedSeatCountEl = activeDoc.getElementById('selectedSeatCount');
        const vipCountEl = activeDoc.getElementById('vipCount');
        const rCountEl = activeDoc.getElementById('rCount');
        const sCountEl = activeDoc.getElementById('sCount');
        
        if (!seatStatus) {
            console.log("控制面板元素未找到，可能尚未准备好");
            return null;
        }
        
        // 更新已选择座位数量
        if (selectedSeatCountEl) {
            selectedSeatCountEl.textContent = selectedSeatCount;
        }
        
        try {
            // 查找所有座位元素
            const allSeats = activeDoc.querySelectorAll(config.seatSelectors.seats.all);
            
            // 分类不同类型的座位
            const availableSeats = [];
            const vipSeats = [];
            const rSeats = [];
            const sSeats = [];
            
            allSeats.forEach(seat => {
                const title = seat.getAttribute('title');
                const className = seat.className;
                
                // 按class判断座位类型
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
                // s13类也可能是可选座位
                else if (className.includes('s13') && title) {
                    availableSeats.push(seat);
                }
            });
            
            // 更新面板显示
            availableSeatCountEl.textContent = availableSeats.length;
            vipCountEl.textContent = vipSeats.length;
            rCountEl.textContent = rSeats.length;
            sCountEl.textContent = sSeats.length;
            
            if (availableSeats.length > 0) {
                seatStatus.textContent = "发现可选座位!";
                seatStatus.style.color = "lime";
                
                // 如果启用通知且是首次发现座位
                if (config.enableNotification && !window._lastNotifiedSeatCount) {
                    GM_notification({
                        title: 'yes24座位分析助手',
                        text: `发现${availableSeats.length}个可选座位! VIP:${vipSeats.length}, R:${rSeats.length}, S:${sSeats.length}`,
                        timeout: 3000,
                        onclick: () => window.focus()
                    });
                    window._lastNotifiedSeatCount = availableSeats.length;
                }
                // 如果座位数量发生变化，再次通知
                else if (config.enableNotification && window._lastNotifiedSeatCount !== availableSeats.length) {
                    GM_notification({
                        title: 'yes24座位分析助手',
                        text: `可选座位数量变化: ${window._lastNotifiedSeatCount} → ${availableSeats.length}`,
                        timeout: 3000,
                        onclick: () => window.focus()
                    });
                    window._lastNotifiedSeatCount = availableSeats.length;
                }
                
                // 调试模式下，在控制台输出座位信息
                if (debug && availableSeats.length > 0) {
                    console.log("可选座位示例:", availableSeats[0]);
                    console.log("座位类名:", availableSeats[0].className);
                    console.log("座位HTML:", availableSeats[0].outerHTML);
                }
            } else {
                seatStatus.textContent = "暂无可选座位";
                seatStatus.style.color = "orange";
                window._lastNotifiedSeatCount = 0;
            }
            
            console.log(`座位分析: 可选=${availableSeats.length}, VIP=${vipSeats.length}, R=${rSeats.length}, S=${sSeats.length}`);
            
            // 返回分析结果
            return {
                all: allSeats,
                available: availableSeats,
                vip: vipSeats,
                r: rSeats,
                s: sSeats
            };
        } catch (e) {
            console.error("分析座位状态出错:", e);
            if (seatStatus) {
                seatStatus.textContent = "分析出错";
                seatStatus.style.color = "red";
            }
            return null;
        }
    }
    
    // 尝试选择座位
    function trySelectSeats() {
        // 检查是否正在选择座位
        if (seatSelectionState.inProgress) {
            console.log("座位选择正在进行中，等待完成...");
            return;
        }
        
        // 更新真实的已选座位数量
        updateActualSelectedSeats();
        
        // 检查是否已经达到最大选择数量
        if (selectedSeatCount >= 10) {
            console.log("已达到最大选择数量(10个)，停止选择");
            disableAutoSelect();
            return;
        }
        
        // 计算还可以选择的座位数量
        const remainingSlots = 10 - selectedSeatCount;
        if (remainingSlots <= 0) {
            console.log("无法选择更多座位，已达到限制");
            disableAutoSelect();
            return;
        }
        
        // 分析可选座位
        const analysis = analyzeSeatStatus();
        if (!analysis || analysis.available.length === 0) return;
        
        let seatsToSelect = analysis.available;
        
        // 过滤掉已经选择过的座位和已被选中的座位
        seatsToSelect = seatsToSelect.filter(seat => {
            if (!seat.id || seatSelectionState.selectedSeatIds.has(seat.id)) {
                return false;
            }
            
            // 检查DOM属性判断是否已被选中
            const computedStyle = window.getComputedStyle(seat);
            if (seat.classList.contains('selected') || 
                seat.getAttribute('aria-selected') === 'true' || 
                computedStyle.backgroundColor.includes('rgb(255') || 
                computedStyle.border.includes('rgb(255')) {
                // 已被选中，记录ID
                seatSelectionState.selectedSeatIds.add(seat.id);
                return false;
            }
            return true;
        });
        
        if (seatsToSelect.length === 0) {
            console.log("没有新的可选座位");
            return;
        }
        
        // 按等级和区域筛选座位
        // ...existing code...
        
        // 选择座位
        if (seatsToSelect.length > 0) {
            // 获取要选择的座位数量
            const numSeatsToSelect = Math.min(config.seatCount, seatsToSelect.length, remainingSlots);
            
            if (numSeatsToSelect <= 0) {
                console.log("无法选择更多座位，已达到限制");
                disableAutoSelect();
                return;
            }
            
            console.log(`尝试选择${numSeatsToSelect}个座位（已选择${selectedSeatCount}个，剩余可选${remainingSlots}个）`);
            
            // 标记正在选择座位
            seatSelectionState.inProgress = true;
            seatSelectionState.lastSelectionTime = Date.now();
            
            for (let i = 0; i < numSeatsToSelect; i++) {
                setTimeout(() => {
                    if (i < seatsToSelect.length) {
                        clickSeat(seatsToSelect[i]);
                    }
                    
                    // 最后一个座位选择后，2秒内重新检查座位状态
                    if (i === numSeatsToSelect - 1) {
                        setTimeout(() => {
                            seatSelectionState.inProgress = false;
                            updateActualSelectedSeats();
                            if (selectedSeatCount >= 10) {
                                disableAutoSelect();
                            }
                        }, 2000);
                    }
                }, i * 200); // 增加时间间隔，确保网站有时间处理
            }
        }
    }

    // 添加一个函数来禁用自动选择
    function disableAutoSelect() {
        if (config.autoSelectSeat) {
            config.autoSelectSeat = false;
            const autoSelectCheckbox = getActiveDocument().getElementById('autoSelectSeat');
            if (autoSelectCheckbox) {
                autoSelectCheckbox.checked = false;
            }
            showMessage("已达到最大选择数量(10个)，自动选择已关闭", "info");
            console.log("已自动关闭自动选择功能");
        }
    }

    // 更新实际已选座位数量 - 新增函数
    function updateActualSelectedSeats() {
        const activeDoc = getActiveDocument();
        
        // 尝试从DOM中寻找已选座位的指示器
        // 1. 查找有明确"已选中"标记的座位
        const selectedSeatsElements = activeDoc.querySelectorAll('.selected, [aria-selected="true"], .s13[style*="background"], .s13[style*="border"]');
        
        // 2. 检查网站上显示的已选座位数量文本
        const seatCountText = activeDoc.querySelector('#selectedSeatInfo, .seat-counter, .seat-count');
        let countFromText = 0;
        
        if (seatCountText) {
            const match = seatCountText.textContent.match(/\d+/);
            if (match) {
                countFromText = parseInt(match[0]);
            }
        }
        
        // 3. 确定实际选择的座位数量
        const actualCount = Math.max(selectedSeatsElements.length, countFromText, selectedSeatCount);
        
        if (actualCount !== selectedSeatCount) {
            console.log(`更新已选座位计数: ${selectedSeatCount} → ${actualCount}`);
            selectedSeatCount = actualCount;
            
            const selectedSeatCountEl = activeDoc.getElementById('selectedSeatCount');
            if (selectedSeatCountEl) {
                selectedSeatCountEl.textContent = selectedSeatCount;
            }
        }
        
        return selectedSeatCount;
    }

    // 点击座位函数，统一处理座位点击逻辑
    function clickSeat(seat) {
        if (!seat || !seat.id) return;
        
        // 记录已选座位ID
        seatSelectionState.selectedSeatIds.add(seat.id);
        
        // 增加选择计数
        selectedSeatCount++;
        
        // 更新界面显示
        const activeDoc = getActiveDocument();
        if (activeDoc && activeDoc.getElementById('selectedSeatCount')) {
            activeDoc.getElementById('selectedSeatCount').textContent = selectedSeatCount;
        }
        
        // 点击座位
        seat.click();
        console.log(`已选择座位: ${seat.id}, 总计已选: ${selectedSeatCount}个`);
        
        // 检查是否已达到10个，如果是则自动禁用自动选择
        if (selectedSeatCount >= 10) {
            disableAutoSelect();
        }
    }
    
    // 高亮不同类型的座位
    function highlightAllSeats() {
        const analysis = analyzeSeatStatus();
        if (!analysis) return;
        
        // 高亮VIP座位
        analysis.vip.forEach(seat => {
            highlightSeat(seat, 'lime', 'VIP席');
        });
        
        // 高亮R座位
        analysis.r.forEach(seat => {
            highlightSeat(seat, 'blue', 'R席');
        });
        
        // 高亮S座位
        analysis.s.forEach(seat => {
            highlightSeat(seat, 'cyan', 'S席');
        });
        
        // 高亮其他可选座位
        const otherSeats = analysis.available.filter(seat => 
            !analysis.vip.includes(seat) && 
            !analysis.r.includes(seat) && 
            !analysis.s.includes(seat)
        );
        
        otherSeats.forEach(seat => {
            highlightSeat(seat, 'yellow', '可选座位');
        });
        
        console.log(`已高亮: VIP=${analysis.vip.length}个, R=${analysis.r.length}个, S=${analysis.s.length}个, 其他=${otherSeats.length}个`);
        
        // 显示提示
        GM_notification({
            title: 'yes24座位分析助手 - 高亮座位',
            text: `已高亮: VIP(绿色)=${analysis.vip.length}个, R(蓝色)=${analysis.r.length}个, S(青色)=${analysis.s.length}个, 其他(黄色)=${otherSeats.length}个`,
            timeout: 5000
        });
    }
    
    // 高亮单个座位
    function highlightSeat(seat, color, label) {
        const originalBorder = seat.style.border;
        const originalBackground = seat.style.backgroundColor;
        const originalPosition = seat.style.position;
        const originalZIndex = seat.style.zIndex;
        
        seat.style.border = `2px solid ${color}`;
        seat.style.backgroundColor = `rgba(${colorToRgb(color)}, 0.3)`;
        seat.style.position = 'relative';
        seat.style.zIndex = '100';
        
        // 添加标签
        const labelSpan = document.createElement('span');
        labelSpan.style.cssText = `
            position: absolute;
            top: -15px;
            left: 0;
            background-color: ${color};
            color: black;
            font-size: 10px;
            padding: 1px 3px;
            border-radius: 2px;
            white-space: nowrap;
        `;
        labelSpan.textContent = label;
        labelSpan.className = 'seat-highlight-label';
        seat.appendChild(labelSpan);
        
        // 10秒后恢复
        setTimeout(() => {
            seat.style.border = originalBorder;
            seat.style.backgroundColor = originalBackground;
            seat.style.position = originalPosition;
            seat.style.zIndex = originalZIndex;
            
            const labels = seat.querySelectorAll('.seat-highlight-label');
            labels.forEach(label => label.remove());
        }, 10000);
    }
    
    // 颜色名称转RGB格式
    function colorToRgb(color) {
        const colors = {
            'lime': '0,255,0',
            'blue': '0,0,255',
            'cyan': '0,255,255',
            'yellow': '255,255,0',
            'red': '255,0,0',
            'gray': '128,128,128'
        };
        return colors[color] || '0,0,0';
    }

    // 显示提示信息（针对特定文档）
    function showMessage(message, type = 'info', targetDoc = document) {
        // 创建或获取消息容器
        let msgContainer = targetDoc.getElementById('seatAssistantMessages');
        if (!msgContainer) {
            msgContainer = targetDoc.createElement('div');
            msgContainer.id = 'seatAssistantMessages';
            msgContainer.style.cssText = `
                position: fixed;
                bottom: 20px;
                right: 20px;
                z-index: 10000;
                max-width: 300px;
            `;
            targetDoc.body.appendChild(msgContainer);
        }
        
        // 创建消息元素
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
        
        // 添加到容器
        msgContainer.appendChild(msgEl);
        
        // 5秒后淡出并移除
        setTimeout(() => {
            msgEl.style.opacity = '0';
            setTimeout(() => msgEl.remove(), 500);
        }, 5000);
    }
})();
