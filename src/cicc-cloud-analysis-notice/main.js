// ==UserScript==
// @name         CICC 云分析告警通知
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  每隔一个小时将监控数据发送到飞书机器人
// @author       You
// @match        https://console.cloud.tencent.com/monitor/rum/analysis*
// @grant        GM_xmlhttpRequest
// @grant        GM_notification
// @connect      open.feishu.cn
// ==/UserScript==

(function () {
    'use strict';

    // 飞书机器人 Webhook 地址
    const FEISHU_WEBHOOK_URL = 'https://open.feishu.cn/open-apis/bot/v2/hook/f38e034a-78d0-4925-9079-7c44a3a9800b';

    // 发送间隔：1 小时 (毫秒)
    const INTERVAL_MS = 60 * 60 * 1000;

    /**
     * 从页面提取监控数据
     * @returns {Object} key-value 形式的监控数据
     */
    function extractMonitorData() {
        const data = {};

        // 选择所有监控卡片项
        const infoItems = document.querySelectorAll('.info-header.card .info-item');

        infoItems.forEach((item) => {
            // 获取标题
            const titleEl = item.querySelector('.title');
            const dataEl = item.querySelector('.data');
            const compareEl = item.querySelector('.compare-span');

            if (titleEl && dataEl) {
                // 提取标题文本（移除图标等）
                const title = titleEl.textContent.trim();
                // 提取数值
                const value = dataEl.textContent.trim();
                // 提取同比数据
                const compare = compareEl ? compareEl.textContent.trim() : '';

                // 组合成 key-value
                data[title] = {
                    value: value,
                    compare: compare
                };
            }
        });

        return data;
    }

    /**
     * 格式化数据为飞书消息内容
     * @param {Object} data - 监控数据
     * @returns {string} 格式化后的消息
     */
    function formatMessage(data) {
        const timestamp = new Date().toLocaleString('zh-CN', {
            timeZone: 'Asia/Shanghai',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });

        let lines = [`📊 **CICC 云分析监控报告**`, `⏰ 时间: ${timestamp}`, ``, `---`];

        for (const [key, info] of Object.entries(data)) {
            lines.push(`**${key}**: ${info.value}`);
            if (info.compare) {
                lines.push(`   └ ${info.compare}`);
            }
        }

        lines.push(``, `---`, `_数据每小时自动采集_`);

        return lines.join('\n');
    }

    /**
     * 发送数据到飞书机器人
     * @param {Object} data - 监控数据
     */
    function sendToFeishu(data) {
        const message = formatMessage(data);

        // 构建飞书消息体
        const payload = {
            msg_type: 'interactive',
            card: {
                config: {
                    wide_screen_mode: true
                },
                header: {
                    title: {
                        tag: 'plain_text',
                        content: '📊 CICC 云分析监控报告'
                    },
                    template: 'blue'
                },
                elements: [
                    {
                        tag: 'div',
                        text: {
                            tag: 'lark_md',
                            content: buildCardContent(data)
                        }
                    },
                    {
                        tag: 'hr'
                    },
                    {
                        tag: 'note',
                        elements: [
                            {
                                tag: 'plain_text',
                                content: `数据采集时间: ${new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}`
                            }
                        ]
                    }
                ]
            }
        };

        GM_xmlhttpRequest({
            method: 'POST',
            url: FEISHU_WEBHOOK_URL,
            headers: {
                'Content-Type': 'application/json'
            },
            data: JSON.stringify(payload),
            onload: function (response) {
                console.log('[CICC Monitor] 飞书通知发送成功:', response.responseText);
                showNotification('发送成功', '监控数据已发送到飞书');
            },
            onerror: function (error) {
                console.error('[CICC Monitor] 飞书通知发送失败:', error);
                showNotification('发送失败', '监控数据发送到飞书失败');
            }
        });
    }

    /**
     * 构建飞书卡片内容
     * @param {Object} data - 监控数据
     * @returns {string} Markdown 格式内容
     */
    function buildCardContent(data) {
        let content = [];

        for (const [key, info] of Object.entries(data)) {
            // 根据数值判断状态图标
            const valueNum = parseInt(info.value) || 0;
            const icon = valueNum > 0 ? '🔴' : '🟢';

            content.push(`${icon} **${key}**: ${info.value}`);

            if (info.compare) {
                // 解析同比变化
                let compareIcon = '➖';
                if (info.compare.includes('↑') || info.compare.includes('up')) {
                    compareIcon = '📈';
                } else if (info.compare.includes('↓') || info.compare.includes('down')) {
                    compareIcon = '📉';
                }
                content.push(`    ${compareIcon} ${info.compare}`);
            }
        }

        return content.join('\n');
    }

    /**
     * 显示桌面通知
     * @param {string} title - 通知标题
     * @param {string} text - 通知内容
     */
    function showNotification(title, text) {
        GM_notification({
            title: `[CICC Monitor] ${title}`,
            text: text,
            timeout: 3000
        });
    }

    /**
     * 执行数据采集并发送
     */
    function collectAndSend() {
        console.log('[CICC Monitor] 开始采集监控数据...');

        const data = extractMonitorData();

        if (Object.keys(data).length === 0) {
            console.warn('[CICC Monitor] 未找到监控数据，可能页面结构已变化');
            return;
        }

        console.log('[CICC Monitor] 采集到的数据:', data);
        sendToFeishu(data);
    }

    /**
     * 初始化定时任务
     */
    function init() {
        console.log('[CICC Monitor] 脚本已加载，将每隔 1 小时发送监控数据到飞书');

        // 页面加载后等待 5 秒，确保动态内容加载完成
        setTimeout(() => {
            // 首次执行
            collectAndSend();

            // 设置定时任务
            setInterval(collectAndSend, INTERVAL_MS);

            console.log('[CICC Monitor] 定时任务已启动，间隔: 1 小时');
        }, 5000);
    }

    // 等待页面加载完成后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
