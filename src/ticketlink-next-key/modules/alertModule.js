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
        alertDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        alertDiv.style.color = '#fff';
        alertDiv.style.padding = '10px 20px';
        alertDiv.style.borderRadius = '5px';
        alertDiv.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.2)';
        alertDiv.style.marginBottom = '10px';
        alertDiv.style.opacity = '1';
        alertDiv.style.transition = 'opacity 0.5s';
        alertDiv.style.fontSize = '14px';
        alertDiv.textContent = message;
        
        container.appendChild(alertDiv);
        
        // 3秒后自动淡出
        setTimeout(() => {
            alertDiv.style.opacity = '0';
            setTimeout(() => {
                if (alertDiv.parentNode === container) {
                    container.removeChild(alertDiv);
                }
            }, 500); // 等待淡出动画完成
        }, 3000);
        
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
