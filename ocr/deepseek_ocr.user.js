// ==UserScript==
// @name         DeepSeek OCR 网页图片文字识别
// @namespace    http://tampermonkey.net/
// @version      0.3
// @description  使用DeepSeek V3 API识别网页中图片的文字并复制到剪贴板
// @author       You
// @match        *://**/*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_setClipboard
// @grant        GM_xmlhttpRequest
// @grant        GM_registerMenuCommand
// @connect      api.deepseek.com
// ==/UserScript==

(function() {
    'use strict';

    // 配置
    const CONFIG = {
        API_URL: 'https://api.deepseek.com/v1/chat/completions',
        MODEL: 'deepseek-v3'
    };

    // 状态变量
    let isActive = false;
    let highlightedImages = [];

    // 获取API Token
    function getToken() {
        return GM_getValue('deepseek_api_token', '');
    }

    // 设置API Token
    function setToken(token) {
        GM_setValue('deepseek_api_token', token);
    }

    // 请求用户输入API Token
    function promptForToken() {
        const token = prompt('请输入DeepSeek API Token', getToken());
        if (token !== null) {
            setToken(token);
            return token;
        }
        return null;
    }

    // 图片URL转Base64
    async function imageUrlToBase64(url) {
        return new Promise((resolve, reject) => {
            // 处理跨域问题
            const img = new Image();
            img.crossOrigin = 'anonymous';
            
            img.onload = function() {
                try {
                    const canvas = document.createElement('canvas');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0);
                    
                    const dataURL = canvas.toDataURL('image/jpeg');
                    resolve(dataURL);
                } catch (e) {
                    reject(new Error('转换图片失败: ' + e.message));
                }
            };
            
            img.onerror = function() {
                reject(new Error('加载图片失败'));
            };
            
            img.src = url;
            
            // 如果图片已缓存，可能不会触发onload
            if (img.complete || img.complete === undefined) {
                img.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
                img.src = url;
            }
        });
    }

    // 处理网页中点击的图片
    async function handleImageClick(event) {
        if (!isActive) return;
        
        event.preventDefault();
        event.stopPropagation();
        
        // 获取点击的图片
        const img = event.target;
        
        try {
            // 显示加载状态
            showStatus('处理中...', 'info');
            
            // 获取图片URL
            const imgUrl = img.src;
            
            // 转换为Base64
            const imageBase64 = await imageUrlToBase64(imgUrl);
            
            // 关闭选择模式
            deactivateSelectionMode();
            
            // 处理OCR
            processImageOcr(imageBase64);
        } catch (error) {
            console.error('处理图片出错:', error);
            showStatus(`错误: ${error.message}`, 'error');
            deactivateSelectionMode();
        }
    }

    // 统一的图片OCR处理流程
    async function processImageOcr(imageBase64) {
        try {
            // 获取Token
            let token = getToken();
            if (!token) {
                token = promptForToken();
                if (!token) {
                    showStatus('需要API Token才能继续', 'error');
                    return;
                }
            }

            // 显示处理状态
            showStatus('正在识别图片文字...', 'info');
            
            // 调用API进行OCR
            const result = await performOCR(imageBase64, token);

            // 复制结果到剪贴板
            GM_setClipboard(result);
            showStatus('文本已复制到剪贴板！', 'success');
        } catch (error) {
            console.error('OCR识别失败:', error);
            showStatus(`错误: ${error.message}`, 'error');
            
            // 如果是token问题，提示用户重新设置
            if (error.message.includes('auth') || error.message.includes('API key') || error.message.includes('token') || error.message.includes('认证')) {
                setTimeout(() => {
                    if (confirm('API Token可能无效或已过期，是否重新设置？')) {
                        promptForToken();
                    }
                }, 1000);
            }
        }
    }

    // 执行OCR
    async function performOCR(imageBase64, token) {
        console.log('发送OCR请求...');
        
        // 确保imageBase64包含正确的前缀
        if (!imageBase64.startsWith('data:')) {
            imageBase64 = `data:image/jpeg;base64,${imageBase64}`;
        }
        
        // 构建请求内容 - 使用更简洁的消息格式
        const data = {
            model: CONFIG.MODEL,
            messages: [
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": "识别图片中的文字，直接返回内容，不要有额外解释"},
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": imageBase64
                            }
                        }
                    ]
                }
            ],
            temperature: 0.1  // 降低随机性，增加输出的确定性
        };

        return new Promise((resolve, reject) => {
            GM_xmlhttpRequest({
                method: 'POST',
                url: CONFIG.API_URL,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                data: JSON.stringify(data),
                onload: function(response) {
                    console.log('API响应状态:', response.status);
                    try {
                        // 检查响应状态码
                        if (response.status !== 200) {
                            console.error('API响应状态码异常:', response.status);
                            console.error('响应内容:', response.responseText);
                            reject(new Error(`API返回异常状态: ${response.status}`));
                            return;
                        }
                        
                        // 检查响应内容是否为空
                        if (!response.responseText) {
                            reject(new Error('API返回空响应'));
                            return;
                        }
                        
                        // 尝试解析为JSON
                        let result;
                        try {
                            result = JSON.parse(response.responseText);
                        } catch (jsonError) {
                            console.error('JSON解析错误:', jsonError);
                            console.error('原始响应:', response.responseText.substring(0, 500)); // 只记录前500个字符以防过长
                            
                            // 如果响应以Failed to开头，可能是API直接返回的错误信息
                            if (response.responseText.startsWith('Failed to')) {
                                reject(new Error(`API错误: ${response.responseText.substring(0, 100)}...`));
                            } else {
                                reject(new Error('API返回的不是有效的JSON格式'));
                            }
                            return;
                        }
                        
                        // 处理API错误
                        if (result.error) {
                            if (result.error.code === 'invalid_api_key') {
                                setToken(''); // 清除无效token
                            }
                            reject(new Error(result.error.message || 'API报告错误'));
                            return;
                        }
                        
                        // 检查返回结构
                        if (!result.choices || !result.choices[0] || !result.choices[0].message) {
                            reject(new Error('API返回数据结构异常'));
                            return;
                        }
                        
                        // 提取返回的文本
                        const text = result.choices[0].message.content;
                        resolve(text);
                    } catch (e) {
                        reject(new Error(`处理API响应失败: ${e.message}`));
                    }
                },
                onerror: function(error) {
                    console.error('请求错误:', error);
                    reject(new Error('网络请求失败: ' + (error.statusText || '连接错误')));
                },
                ontimeout: function() {
                    reject(new Error('请求超时'));
                }
            });
        });
    }

    // 显示状态消息
    function showStatus(message, type = 'info') {
        // 检查是否已存在状态元素
        let statusEl = document.getElementById('deepseek-ocr-status');
        
        if (!statusEl) {
            statusEl = document.createElement('div');
            statusEl.id = 'deepseek-ocr-status';
            statusEl.style.cssText = `
                position: fixed;
                bottom: 20px;
                right: 20px;
                padding: 10px 15px;
                border-radius: 4px;
                z-index: 9999;
                font-size: 14px;
                transition: opacity 0.3s;
                box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            `;
            document.body.appendChild(statusEl);
        }

        // 设置样式和消息
        switch(type) {
            case 'error':
                statusEl.style.backgroundColor = '#f44336';
                statusEl.style.color = 'white';
                break;
            case 'success':
                statusEl.style.backgroundColor = '#4caf50';
                statusEl.style.color = 'white';
                break;
            default:
                statusEl.style.backgroundColor = '#2196f3';
                statusEl.style.color = 'white';
        }

        statusEl.textContent = message;
        
        // 显示消息
        statusEl.style.opacity = '1';
        
        // 自动隐藏
        setTimeout(() => {
            statusEl.style.opacity = '0';
            setTimeout(() => {
                if (statusEl.parentNode) {
                    statusEl.parentNode.removeChild(statusEl);
                }
            }, 300);
        }, 3000);
    }

    // 添加浮动按钮
    function addFloatingButton() {
        const button = document.createElement('button');
        button.id = 'deepseek-ocr-button';
        button.textContent = '📷 OCR';
        button.style.cssText = `
            position: fixed;
            right: 20px;
            bottom: 70px;
            padding: 10px 15px;
            background-color: #4285f4;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            z-index: 9999;
            box-shadow: 0 2px 5px rgba(0,0,0,0.3);
            font-size: 14px;
            display: flex;
            align-items: center;
            transition: 0.3s;
        `;
        
        button.onmouseover = function() {
            this.style.backgroundColor = '#3367d6';
        };
        
        button.onmouseout = function() {
            if (!isActive) {
                this.style.backgroundColor = '#4285f4';
            }
        };
        
        button.onclick = function() {
            if (isActive) {
                deactivateSelectionMode();
            } else {
                activateSelectionMode();
            }
        };
        
        document.body.appendChild(button);
    }
    
    // 激活选择模式
    function activateSelectionMode() {
        if (isActive) return;
        
        isActive = true;
        
        // 更改按钮状态
        const button = document.getElementById('deepseek-ocr-button');
        if (button) {
            button.style.backgroundColor = '#ff5722';
            button.textContent = '❌ 取消';
        }
        
        showStatus('请点击要识别的图片', 'info');
        
        // 高亮网页上的所有图片
        const images = document.querySelectorAll('img');
        highlightedImages = [];
        
        images.forEach(img => {
            // 只处理有效的图片（宽高至少大于50像素）
            if (img.naturalWidth > 50 && img.naturalHeight > 50) {
                // 保存原始样式
                const originalStyles = {
                    outline: img.style.outline,
                    cursor: img.style.cursor,
                    filter: img.style.filter
                };
                
                // 添加高亮效果
                img.style.outline = '3px solid #ff5722';
                img.style.cursor = 'pointer';
                img.style.filter = 'brightness(1.1)';
                
                // 添加点击事件
                img.addEventListener('click', handleImageClick);
                
                // 保存图片引用和原始样式以便后续恢复
                highlightedImages.push({
                    element: img,
                    originalStyles: originalStyles
                });
            }
        });
        
        // 如果没有找到合适的图片
        if (highlightedImages.length === 0) {
            showStatus('未找到可识别的图片', 'error');
            deactivateSelectionMode();
        }
    }
    
    // 关闭选择模式
    function deactivateSelectionMode() {
        if (!isActive) return;
        
        isActive = false;
        
        // 恢复按钮状态
        const button = document.getElementById('deepseek-ocr-button');
        if (button) {
            button.style.backgroundColor = '#4285f4';
            button.textContent = '📷 OCR';
        }
        
        // 移除所有图片的高亮效果
        highlightedImages.forEach(item => {
            const img = item.element;
            const styles = item.originalStyles;
            
            // 恢复原始样式
            img.style.outline = styles.outline;
            img.style.cursor = styles.cursor;
            img.style.filter = styles.filter;
            
            // 移除事件监听
            img.removeEventListener('click', handleImageClick);
        });
        
        // 清空高亮图片列表
        highlightedImages = [];
    }
    
    // 注册菜单命令
    function registerMenuCommands() {
        GM_registerMenuCommand('设置API Token', promptForToken);
        GM_registerMenuCommand('选择网页图片识别', activateSelectionMode);
    }

    // 初始化脚本
    function init() {
        addFloatingButton();
        registerMenuCommands();
    }
    
    // 启动脚本
    init();
})();
