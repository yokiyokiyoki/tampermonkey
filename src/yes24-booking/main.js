// YES24 自动预订脚本
// 当页面包含票务信息但没有预订按钮时，添加时间设置面板
// 在指定时间自动刷新页面并点击预订按钮

// 导入样式
import { styles } from './modules/styles';

(function() {
  'use strict';
  
  // 添加一个标记，确保按钮只点击一次
  let hasClickedBooking = false;
  
  // 检查页面元素
  function checkElements() {
    const ticketInfo = document.querySelector('.ticketinfo');
    const poster = document.querySelector('.poster');
    const bookingBtn = document.querySelector('a#hlkPurchase');
    
    // 如果存在票务信息和海报，但没有预订按钮
    if (ticketInfo && poster && !bookingBtn) {
      createControlPanel();
    } else if (bookingBtn && !hasClickedBooking) {
      // 如果存在预订按钮，并且还未点击过，则点击一次
      console.log('找到预订按钮，准备点击一次...');
      
      // 设置标记为已点击
      hasClickedBooking = true;
      
      setTimeout(() => bookingBtn.click(), 500);
      
      // 点击后移除观察器，避免重复观察
      if (observer) {
        observer.disconnect();
      }
    }
  }
  
  // 创建时间选择器组件
  function createDateTimePicker() {
    // 获取当前时间
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    
    // 创建日期时间选择器HTML
    return `
      <div style="${styles.formGroup}">
        <label style="${styles.label}">设置刷新时间:</label>
        <div style="${styles.dateTimeContainer}">
          <input type="date" id="refresh-date" value="${year}-${month}-${day}" style="${styles.input}">
          <input type="time" id="refresh-time" value="${hours}:${minutes}" style="${styles.input}">
        </div>
      </div>
    `;
  }
  
  // 创建控制面板
  function createControlPanel() {
    // 检查是否已经创建过面板
    if (document.getElementById('yes24-auto-refresh-panel')) {
      return;
    }
    
    // 创建面板容器
    const panel = document.createElement('div');
    panel.id = 'yes24-auto-refresh-panel';
    panel.style.cssText = styles.panel;
    
    // 创建面板内容
    panel.innerHTML = `
      <h3 style="${styles.heading}">YES24 自动预订</h3>
      ${createDateTimePicker()}
      <div style="${styles.buttonContainer}">
        <button id="start-refresh" style="${styles.primaryButton}">
          开始
        </button>
        <button id="cancel-refresh" style="${styles.secondaryButton}">
          取消
        </button>
      </div>
      <div id="status-message" style="${styles.statusMessage}"></div>
      <div id="countdown" style="${styles.countdown}"></div>
    `;
    
    // 添加面板到页面
    document.body.appendChild(panel);
    
    // 添加事件监听
    document.getElementById('start-refresh').addEventListener('click', startAutoRefresh);
    document.getElementById('cancel-refresh').addEventListener('click', cancelAutoRefresh);
  }
  
  let refreshTimer = null;
  let countdownInterval = null;
  
  // 开始自动刷新
  function startAutoRefresh() {
    const dateInput = document.getElementById('refresh-date').value;
    const timeInput = document.getElementById('refresh-time').value;
    const statusMessage = document.getElementById('status-message');
    const countdownElement = document.getElementById('countdown');
    
    // 验证输入
    if (!dateInput || !timeInput) {
      statusMessage.textContent = '请设置有效的刷新时间';
      statusMessage.style.color = 'red';
      return;
    }
    
    // 解析时间
    const [hours, minutes] = timeInput.split(':').map(Number);
    const [year, month, day] = dateInput.split('-').map(Number);
    
    // 创建目标时间对象，注意月份从0开始
    const targetTime = new Date(year, month - 1, day, hours, minutes, 0);
    const now = new Date();
    
    // 检查时间有效性
    if (targetTime <= now || isNaN(targetTime.getTime())) {
      statusMessage.textContent = '请设置一个将来的有效时间';
      statusMessage.style.color = 'red';
      return;
    }
    
    // 计算时间差（毫秒）
    const timeDifference = targetTime.getTime() - now.getTime();
    
    // 设置状态
    statusMessage.textContent = `将在 ${targetTime.toLocaleString()} 刷新页面`;
    statusMessage.style.color = '#008800';
    
    // 清除之前的计时器
    if (refreshTimer) clearTimeout(refreshTimer);
    if (countdownInterval) clearInterval(countdownInterval);
    
    // 设置新的刷新计时器
    refreshTimer = setTimeout(() => {
      location.reload();
    }, timeDifference);
    
    // 设置倒计时显示
    countdownInterval = setInterval(() => {
      const currentTime = new Date();
      const remainingTime = targetTime.getTime() - currentTime.getTime();
      
      if (remainingTime <= 0) {
        countdownElement.textContent = '刷新中...';
        clearInterval(countdownInterval);
        return;
      }
      
      // 计算剩余时间
      const hours = Math.floor(remainingTime / (1000 * 60 * 60));
      const minutes = Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((remainingTime % (1000 * 60)) / 1000);
      
      countdownElement.textContent = `倒计时: ${hours}时 ${minutes}分 ${seconds}秒`;
    }, 1000);
  }
  
  // 取消自动刷新
  function cancelAutoRefresh() {
    if (refreshTimer) {
      clearTimeout(refreshTimer);
      refreshTimer = null;
    }
    
    if (countdownInterval) {
      clearInterval(countdownInterval);
      countdownInterval = null;
    }
    
    const statusMessage = document.getElementById('status-message');
    const countdownElement = document.getElementById('countdown');
    
    statusMessage.textContent = '自动刷新已取消';
    statusMessage.style.color = '#666';
    countdownElement.textContent = '';
  }
  
  let observer;
  
  // 页面加载完成后检查元素
  window.addEventListener('load', checkElements);
  
  // 定期检查元素（以防页面动态加载内容）
  observer = new MutationObserver(checkElements);
  observer.observe(document.body, { childList: true, subtree: true });
})();


