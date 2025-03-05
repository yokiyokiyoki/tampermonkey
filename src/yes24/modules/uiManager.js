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
                <div class="seat-assistant-section-title">座位类型</div>
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
    
    // 添加可拖动功能
    makePanelDraggable(panel);
    
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
 * 添加样式
 */
function addStyles() {
    const styleElement = document.createElement('style');
    styleElement.textContent = `
        #yes24SeatAssistant {
            position: fixed;
            top: 20px;
            right: 20px;
            width: 280px;
            background-color: rgba(33, 37, 41, 0.95);
            color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
            z-index: 10000;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
            backdrop-filter: blur(5px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            overflow: hidden;
            transition: all 0.3s ease;
        }
        
        .seat-assistant-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 15px;
            background: linear-gradient(135deg, #4568dc, #3a6073);
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            cursor: move;
        }
        
        .seat-assistant-title {
            font-size: 16px;
            font-weight: bold;
            display: flex;
            align-items: center;
        }
        
        .seat-assistant-icon {
            margin-right: 8px;
            font-size: 18px;
        }
        
        .seat-assistant-close {
            cursor: pointer;
            font-size: 18px;
            opacity: 0.8;
            transition: opacity 0.2s;
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
        }
        
        .seat-assistant-close:hover {
            opacity: 1;
            background-color: rgba(255, 255, 255, 0.1);
        }
        
        .seat-assistant-body {
            padding: 15px;
        }
        
        .seat-assistant-section {
            margin-bottom: 15px;
            background: rgba(0, 0, 0, 0.2);
            border-radius: 6px;
            padding: 12px;
        }
        
        .seat-assistant-section-title {
            margin-bottom: 10px;
            font-size: 14px;
            font-weight: 500;
            color: #adb5bd;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            padding-bottom: 5px;
        }
        
        .seat-count-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 8px;
        }
        
        .seat-count-item {
            text-align: center;
            background: rgba(0, 0, 0, 0.2);
            border-radius: 4px;
            padding: 8px 4px;
        }
        
        .seat-count-label {
            font-size: 12px;
            color: #adb5bd;
            margin-bottom: 4px;
        }
        
        .seat-count-value {
            font-size: 18px;
            font-weight: bold;
        }
        
        .vip-seat { color: #20c997; }
        .r-seat { color: #339af0; }
        .s-seat { color: #fcc419; }
        .available-seat { color: #51cf66; }
        .selected-seat { color: #ff6b6b; }
        
        .selected-seats-list {
            max-height: 120px;
            overflow-y: auto;
            background: rgba(0, 0, 0, 0.15);
            border-radius: 4px;
            margin-top: 8px;
        }
        
        .selected-seat-item {
            padding: 6px 10px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
            font-size: 13px;
        }
        
        .selected-seat-item.empty {
            color: #868e96;
            text-align: center;
            padding: 15px;
        }
    `;
    document.head.appendChild(styleElement);
}

/**
 * 使面板可拖动
 * @param {HTMLElement} panel - 面板元素
 */
function makePanelDraggable(panel) {
    const header = panel.querySelector('.seat-assistant-header');
    let isDragging = false;
    let offsetX, offsetY;
    
    header.addEventListener('mousedown', e => {
        // 如果点击了关闭按钮，不触发拖动
        if (e.target.classList.contains('seat-assistant-close')) return;
        
        isDragging = true;
        offsetX = e.clientX - panel.getBoundingClientRect().left;
        offsetY = e.clientY - panel.getBoundingClientRect().top;
        
        // 添加临时样式提示正在拖动
        panel.style.opacity = '0.8';
        panel.style.transition = 'none';
        
        e.preventDefault();
    });
    
    document.addEventListener('mousemove', e => {
        if (!isDragging) return;
        
        const newX = e.clientX - offsetX;
        const newY = e.clientY - offsetY;
        
        // 确保面板不会完全移出可视区域
        const panelWidth = panel.offsetWidth;
        const panelHeight = panel.offsetHeight;
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        
        // 至少保留80px在视窗内
        const limitedX = Math.min(Math.max(newX, -panelWidth + 80), windowWidth - 80);
        const limitedY = Math.min(Math.max(newY, 0), windowHeight - 40);
        
        panel.style.left = limitedX + 'px';
        panel.style.top = limitedY + 'px';
        panel.style.right = 'auto'; // 清除可能的right值
        
        e.preventDefault();
    });
    
    document.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            panel.style.opacity = '1';
            panel.style.transition = 'opacity 0.3s ease';
        }
    });
}
