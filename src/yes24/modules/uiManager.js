/**
 * UI管理模块 - 管理座位助手面板界面
 */

/**
 * 创建控制面板
 * @param {Object} seatInfo - 座位信息对象
 */
export function createControlPanel(seatInfo) {
    // 确保不重复创建面板
    if (document.getElementById('yes24SeatAssistant')) {
        console.log('面板已存在，更新数据');
        updatePanelData(seatInfo);
        return;
    }
    
    console.log('创建座位助手面板');
    
    // 创建样式
    addStyles();
    
    // 创建面板
    const panel = document.createElement('div');
    panel.id = 'yes24SeatAssistant';
    panel.innerHTML = `
        <div class="seat-assistant-header">
            <div class="seat-assistant-title">
                <span class="seat-assistant-icon">🎟️</span>
                Yes24座位助手
            </div>
            <div class="seat-assistant-controls">
                <div class="seat-assistant-close" title="关闭">×</div>
            </div>
        </div>
        <div class="seat-assistant-body">
            <div class="seat-assistant-section">
                <div class="seat-assistant-section-title">座位概况</div>
                <div class="seat-count-grid">
                    <div class="seat-count-item">
                        <div class="seat-count-label">全部座位</div>
                        <div class="seat-count-value" id="totalSeatsCount">${seatInfo.total}</div>
                    </div>
                    <div class="seat-count-item">
                        <div class="seat-count-label">可选座位</div>
                        <div class="seat-count-value available-seat" id="availableSeatsCount">${seatInfo.available}</div>
                    </div>
                    <div class="seat-count-item">
                        <div class="seat-count-label">已选座位</div>
                        <div class="seat-count-value selected-seat" id="selectedSeatsCount">${seatInfo.selected}</div>
                    </div>
                </div>
            </div>
            
            <div class="seat-assistant-section">
                <div class="seat-assistant-section-title">可选座位类型</div>
                <div class="seat-count-grid">
                    <div class="seat-count-item">
                        <div class="seat-count-label">VIP席</div>
                        <div class="seat-count-value vip-seat" id="vipSeatsCount">${seatInfo.vip}</div>
                    </div>
                    <div class="seat-count-item">
                        <div class="seat-count-label">R席</div>
                        <div class="seat-count-value r-seat" id="rSeatsCount">${seatInfo.r}</div>
                    </div>
                    <div class="seat-count-item">
                        <div class="seat-count-label">S席</div>
                        <div class="seat-count-value s-seat" id="sSeatsCount">${seatInfo.s}</div>
                    </div>
                </div>
            </div>
            
            <div class="seat-assistant-section">
                <div class="seat-assistant-section-title">自动选座设置</div>
                <div class="auto-seat-controls">
                    <div class="auto-seat-item">
                        <label for="seatCount">座位数量:</label>
                        <input type="number" id="seatCount" min="0" max="9" value="1" class="seat-input">
                        <span class="seat-hint">(0-9，0表示不自动选座)</span>
                    </div>
                    <div class="auto-seat-item">
                        <label for="seatType">座位类型:</label>
                        <select id="seatType" class="seat-select">
                            <option value="any">任意可用座位</option>
                            <option value="vip">VIP席优先</option>
                            <option value="r">R席优先</option>
                            <option value="s">S席优先</option>
                        </select>
                    </div>
                    <div class="auto-seat-item checkbox-container">
                        <input type="checkbox" id="autoLock" class="seat-checkbox">
                        <label for="autoLock">自动点击锁票按钮</label>
                    </div>
                    <div class="auto-seat-item">
                        <label for="refreshInterval">自动刷新间隔(秒):</label>
                        <input type="number" id="refreshInterval" min="0" max="180" value="5" class="seat-input" style="width: 60px;">
                        <span class="seat-hint">(0表示不刷新，1-180秒)</span>
                    </div>
                    <div class="auto-seat-item">
                        <button id="startAutoSeat" class="seat-button">开始自动选座</button>
                        <div class="status-indicator" id="autoRefreshStatus"></div>
                    </div>
                </div>
            </div>
            
            <div class="seat-assistant-section">
                <div class="seat-assistant-section-title">已选座位</div>
                <div class="selected-seats-list" id="selectedSeatsList">
                    ${seatInfo.selectedSeatsInfo.length > 0 
                        ? seatInfo.selectedSeatsInfo.map(seat => 
                            `<div class="selected-seat-item">${seat.text}</div>`
                          ).join('')
                        : '<div class="selected-seat-item empty">暂无已选座位</div>'
                    }
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(panel);
    
    // 添加事件监听
    document.querySelector('#yes24SeatAssistant .seat-assistant-close')
        .addEventListener('click', () => {
            panel.remove();
        });
    
    // 添加自动选座按钮监听
    document.getElementById('startAutoSeat').addEventListener('click', () => {
        const count = parseInt(document.getElementById('seatCount').value) || 0;
        const type = document.getElementById('seatType').value;
        const autoLock = document.getElementById('autoLock').checked;
        const refreshInterval = parseInt(document.getElementById('refreshInterval').value) || 0;
        
        // 触发自定义事件，让seatAssistant模块处理自动选座
        const event = new CustomEvent('autoSeatRequest', {
            detail: { count, type, autoLock, refreshInterval }
        });
        document.dispatchEvent(event);
    });
    
    console.log('面板创建完成');
}

/**
 * 更新面板数据
 * @param {Object} seatInfo - 座位信息对象
 */
export function updatePanelData(seatInfo) {
    const panel = document.getElementById('yes24SeatAssistant');
    if (!panel) return;
    
    // 更新座位统计数据
    document.getElementById('totalSeatsCount').textContent = seatInfo.total;
    document.getElementById('availableSeatsCount').textContent = seatInfo.available;
    document.getElementById('selectedSeatsCount').textContent = seatInfo.selected;
    document.getElementById('vipSeatsCount').textContent = seatInfo.vip;
    document.getElementById('rSeatsCount').textContent = seatInfo.r;
    document.getElementById('sSeatsCount').textContent = seatInfo.s;
    
    // 更新已选座位列表
    const selectedSeatsList = document.getElementById('selectedSeatsList');
    if (seatInfo.selectedSeatsInfo.length > 0) {
        selectedSeatsList.innerHTML = seatInfo.selectedSeatsInfo.map(seat => 
            `<div class="selected-seat-item">${seat.text}</div>`
        ).join('');
    } else {
        selectedSeatsList.innerHTML = '<div class="selected-seat-item empty">暂无已选座位</div>';
    }
}

/**
 * 更新自动刷新状态显示
 * @param {boolean} isActive - 是否正在自动刷新
 * @param {number} nextRefresh - 下次刷新倒计时(秒)
 */
export function updateRefreshStatus(isActive, nextRefresh = null) {
    const statusElement = document.getElementById('autoRefreshStatus');
    if (!statusElement) return;
    
    if (isActive) {
        statusElement.classList.add('active');
        statusElement.innerHTML = nextRefresh !== null 
            ? `自动刷新中: <span class="refresh-countdown">${nextRefresh}</span>秒后刷新` 
            : '自动刷新中...';
    } else {
        statusElement.classList.remove('active');
        statusElement.innerHTML = '';
    }
}

/**
 * 添加样式
 */
function addStyles() {
    const styleElement = document.createElement('style');
    styleElement.textContent = `#yes24SeatAssistant{position:fixed;top:20px;right:20px;width:280px;background-color:rgba(33,37,41,.95);color:#fff;border-radius:8px;box-shadow:0 4px 15px rgba(0,0,0,.3);z-index:10000;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif;backdrop-filter:blur(5px);border:1px solid rgba(255,255,255,.1);overflow:hidden;transition:all .3s ease}.seat-assistant-header{display:flex;justify-content:space-between;align-items:center;padding:12px 15px;background:linear-gradient(135deg,#4568dc,#3a6073);border-bottom:1px solid rgba(255,255,255,.1)}.seat-assistant-title{font-size:16px;font-weight:700;display:flex;align-items:center}.seat-assistant-icon{margin-right:8px;font-size:18px}.seat-assistant-close{cursor:pointer;font-size:18px;opacity:.8;transition:opacity .2s;width:24px;height:24px;display:flex;align-items:center;justify-content:center;border-radius:50%}.seat-assistant-close:hover{opacity:1;background-color:rgba(255,255,255,.1)}.seat-assistant-body{padding:15px}.seat-assistant-section{margin-bottom:15px;background:rgba(0,0,0,.2);border-radius:6px;padding:12px}.seat-assistant-section-title{margin-bottom:10px;font-size:14px;font-weight:500;color:#adb5bd;border-bottom:1px solid rgba(255,255,255,.1);padding-bottom:5px}.seat-count-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.seat-count-item{text-align:center;background:rgba(0,0,0,.2);border-radius:4px;padding:8px 4px}.seat-count-label{font-size:12px;color:#adb5bd;margin-bottom:4px}.seat-count-value{font-size:18px;font-weight:700}.vip-seat{color:#20c997}.r-seat{color:#339af0}.s-seat{color:#fcc419}.available-seat{color:#51cf66}.selected-seat{color:#ff6b6b}.selected-seats-list{max-height:120px;overflow-y:auto;background:rgba(0,0,0,.15);border-radius:4px;margin-top:8px}.selected-seat-item{padding:6px 10px;border-bottom:1px solid rgba(255,255,255,.05);font-size:13px}.selected-seat-item.empty{color:#868e96;text-align:center;padding:15px}

/* 自动选座设置样式 */
.auto-seat-controls {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 5px 0;
}
.auto-seat-item {
    display: flex;
    align-items: center;
    gap: 8px;
}
.seat-input {
    width: 50px;
    padding: 4px 8px;
    background: rgba(255,255,255,0.1);
    border: 1px solid rgba(255,255,255,0.2);
    border-radius: 4px;
    color: #fff;
    text-align: center;
}
.seat-select {
    padding: 4px 8px;
    background: rgba(255,255,255,0.1);
    border: 1px solid rgba(255,255,255,0.2);
    border-radius: 4px;
    color: #fff;
    min-width: 120px;
}
.seat-checkbox {
    width: 16px;
    height: 16px;
    accent-color: #4568dc;
    cursor: pointer;
}
.checkbox-container {
    margin: 5px 0;
}
.seat-button {
    background: linear-gradient(135deg, #4568dc, #3a6073);
    border: none;
    border-radius: 4px;
    padding: 8px 12px;
    color: #fff;
    cursor: pointer;
    transition: all 0.2s;
    width: 100%;
    margin-top: 5px;
}
.seat-button:hover {
    background: linear-gradient(135deg, #5478ec, #4a7083);
}
.seat-hint {
    font-size: 11px;
    color: #adb5bd;
}
.status-indicator {
    font-size: 12px;
    margin-top: 8px;
    height: 16px;
    color: #adb5bd;
    text-align: center;
}
.status-indicator.active {
    color: #51cf66;
}
.refresh-countdown {
    font-weight: bold;
}`;
    document.head.appendChild(styleElement);
}
