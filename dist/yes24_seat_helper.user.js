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
(()=>{"use strict";function e(e,t){var r="undefined"!=typeof Symbol&&e[Symbol.iterator]||e["@@iterator"];if(!r){if(Array.isArray(e)||(r=function(e,t){if(e){if("string"==typeof e)return n(e,t);var r={}.toString.call(e).slice(8,-1);return"Object"===r&&e.constructor&&(r=e.constructor.name),"Map"===r||"Set"===r?Array.from(e):"Arguments"===r||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r)?n(e,t):void 0}}(e))||t&&e&&"number"==typeof e.length){r&&(e=r);var o=0,i=function(){};return{s:i,n:function(){return o>=e.length?{done:!0}:{done:!1,value:e[o++]}},e:function(e){throw e},f:i}}throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}var a,c=!0,u=!1;return{s:function(){r=r.call(e)},n:function(){var e=r.next();return c=e.done,e},e:function(e){u=!0,a=e},f:function(){try{c||null==r.return||r.return()}finally{if(u)throw a}}}}function n(e,n){(null==n||n>e.length)&&(n=e.length);for(var t=0,r=Array(n);t<n;t++)r[t]=e[t];return r}function t(){console.log("初始化iframe检测模块"),function(){var n=document.querySelector('iframe[name="ifrmSeatFrame"]');if(n)return void r(n);!function(){console.log("未找到座位iframe，开始监控DOM变化");var n=new MutationObserver((function(t){var o,i=e(t);try{for(i.s();!(o=i.n()).done;){var a=o.value;if("childList"===a.type&&a.addedNodes.length){var c=document.querySelector('iframe[name="ifrmSeatFrame"]');if(c){console.log("通过DOM变化监控发现座位iframe!"),n.disconnect(),r(c);break}}}}catch(e){i.e(e)}finally{i.f()}}));n.observe(document.body,{childList:!0,subtree:!0}),setTimeout((function(){n.disconnect(),console.log("停止DOM监控 (30秒超时)")}),3e4)}()}()}function r(e){alert("已发现座位选择框架，座位助手已准备就绪！"),console.log("座位iframe信息:",e),e.addEventListener("load",(function(){console.log("座位iframe内容已加载")}))}!function(){function e(){t()}console.log("Yes24购票助手已加载"),"complete"===document.readyState||"interactive"===document.readyState?e():document.addEventListener("DOMContentLoaded",e)}()})();