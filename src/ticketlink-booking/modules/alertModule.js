/**
 * 美化的Alert模块
 * 自定义浮动提示窗，无需点击确认
 */
export default function createAlertModule() {
    // 创建美化的alert容器
    const createAlertContainer = () => {
        const container = document.createElement('div');
        container.style.position = 'fixed';
        container.style.top = '20px';
        container.style.right = '20px';
        container.style.zIndex = '9999';
        container.style.width = '300px';
        document.body.appendChild(container);
        return container;
    };
    
    // 创建一个美化的alert消息
    const createAlertMessage = (message, container) => {
        const alertDiv = document.createElement('div');
        alertDiv.style.backgroundColor = 'rgba(52, 73, 94, 0.95)';  // 更柔和的深蓝灰色背景
        alertDiv.style.color = '#ecf0f1';  // 更柔和的白色文字
        alertDiv.style.padding = '12px 18px';  // 稍微增加内边距
        alertDiv.style.borderRadius = '8px';  // 增大圆角
        alertDiv.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';  // 更精致的阴影
        alertDiv.style.marginBottom = '12px';
        alertDiv.style.opacity = '0';  // 初始透明度为0，实现淡入效果
        alertDiv.style.transition = 'opacity 0.3s ease';  // 平滑过渡效果
        alertDiv.style.fontSize = '14px';
        alertDiv.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';  // 现代系统字体
        alertDiv.style.lineHeight = '1.4';  // 提高行高增加可读性
        alertDiv.textContent = message;
        
        container.appendChild(alertDiv);
        
        // 淡入效果
        setTimeout(() => {
            alertDiv.style.opacity = '1';
        }, 10);
        
        // 10秒后自动淡出
        setTimeout(() => {
            alertDiv.style.opacity = '0';
            setTimeout(() => {
                if (alertDiv.parentNode === container) {
                    container.removeChild(alertDiv);
                }
            }, 300); // 缩短淡出动画时间
        }, 10000);
        
        return alertDiv;
    };
    
    // 创建容器
    const alertContainer = createAlertContainer();
    
    // 覆盖原生的alert
    const originalAlert = unsafeWindow.alert;
    unsafeWindow.alert = function(message) {
        createAlertMessage(message, alertContainer);
    };

    return {
        showMessage: (message) => {
            createAlertMessage(message, alertContainer);
        }
    };
}
