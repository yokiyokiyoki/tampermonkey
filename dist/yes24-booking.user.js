// ==UserScript==
// @name         YES24自动刷新预订
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  在指定时间自动刷新页面并点击预订按钮
// @author       yoki
// @match        *://ticket.yes24.com/Pages/English/Perf/*
// @grant        unsafeWindow
// @run-at       document-end
// ==/UserScript==
(()=>{"use strict";function t(t,n){(null==n||n>t.length)&&(n=t.length);for(var e=0,r=Array(n);e<n;e++)r[e]=t[e];return r}function n(n,e){return function(t){if(Array.isArray(t))return t}(n)||function(t,n){var e=null==t?null:"undefined"!=typeof Symbol&&t[Symbol.iterator]||t["@@iterator"];if(null!=e){var r,o,a,i,c=[],l=!0,d=!1;try{if(a=(e=e.call(t)).next,0===n){if(Object(e)!==e)return;l=!1}else for(;!(l=(r=a.call(e)).done)&&(c.push(r.value),c.length!==n);l=!0);}catch(t){d=!0,o=t}finally{try{if(!l&&null!=e.return&&(i=e.return(),Object(i)!==i))return}finally{if(d)throw o}}return c}}(n,e)||function(n,e){if(n){if("string"==typeof n)return t(n,e);var r={}.toString.call(n).slice(8,-1);return"Object"===r&&n.constructor&&(r=n.constructor.name),"Map"===r||"Set"===r?Array.from(n):"Arguments"===r||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r)?t(n,e):void 0}}(n,e)||function(){throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}var e="\n    position: fixed;\n    top: 20px;\n    right: 20px;\n    background-color: #fff;\n    border: 2px solid #ff6600;\n    border-radius: 5px;\n    padding: 15px;\n    z-index: 9999;\n    box-shadow: 0 0 10px rgba(0,0,0,0.2);\n    width: 250px;\n    font-family: Arial, sans-serif;\n  ",r="\n    margin-top: 0; \n    color: #ff6600; \n    text-align: center;\n    font-size: 16px;\n    font-weight: bold;\n  ",o="\n    margin-bottom: 10px;\n  ",a="\n    display: block;\n    margin-bottom: 5px;\n    font-size: 14px;\n  ",i="\n    width: 100%; \n    padding: 5px; \n    margin-top: 5px; \n    box-sizing: border-box;\n    border: 1px solid #ccc;\n    border-radius: 3px;\n  ",c="\n    display: flex; \n    justify-content: space-between; \n    margin-top: 10px;\n  ",l="\n    background: #ff6600; \n    color: white; \n    border: none; \n    padding: 8px 15px; \n    cursor: pointer; \n    flex: 1; \n    margin-right: 5px;\n    border-radius: 3px;\n  ",d="\n    background: #ccc; \n    border: none; \n    padding: 8px 15px; \n    cursor: pointer; \n    flex: 1; \n    margin-left: 5px;\n    border-radius: 3px;\n  ",u="\n    margin-top: 10px; \n    font-size: 12px; \n    color: #666; \n    text-align: center;\n  ",s="\n    margin-top: 5px; \n    font-weight: bold; \n    text-align: center; \n    color: #ff6600;\n  ",f="\n    display: flex;\n    justify-content: space-between;\n    gap: 5px;\n  ";!function(){var t=!1;function p(){var n=document.querySelector(".ticketinfo"),p=document.querySelector(".poster"),g=document.querySelector("a#hlkPurchase");n&&p&&!g?function(){if(document.getElementById("yes24-auto-refresh-panel"))return;var t=document.createElement("div");t.id="yes24-auto-refresh-panel",t.style.cssText=e,t.innerHTML='\n      <h3 style="'.concat(r,'">YES24 自动预订</h3>\n      ').concat((n=new Date,p=n.getFullYear(),m=String(n.getMonth()+1).padStart(2,"0"),g=String(n.getDate()).padStart(2,"0"),y=String(n.getHours()).padStart(2,"0"),b=String(n.getMinutes()).padStart(2,"0"),'\n      <div style="'.concat(o,'">\n        <label style="').concat(a,'">设置刷新时间:</label>\n        <div style="').concat(f,'">\n          <input type="date" id="refresh-date" value="').concat(p,"-").concat(m,"-").concat(g,'" style="').concat(i,'">\n          <input type="time" id="refresh-time" value="').concat(y,":").concat(b,'" style="').concat(i,'">\n        </div>\n      </div>\n    ')),'\n      <div style="').concat(c,'">\n        <button id="start-refresh" style="').concat(l,'">\n          开始\n        </button>\n        <button id="cancel-refresh" style="').concat(d,'">\n          取消\n        </button>\n      </div>\n      <div id="status-message" style="').concat(u,'"></div>\n      <div id="countdown" style="').concat(s,'"></div>\n    '),document.body.appendChild(t),document.getElementById("start-refresh").addEventListener("click",x),document.getElementById("cancel-refresh").addEventListener("click",v);var n,p,m,g,y,b}():g&&!t&&(console.log("找到预订按钮，准备点击一次..."),t=!0,setTimeout((function(){return g.click()}),500),m&&m.disconnect())}var m,g=null,y=null;function x(){var t=document.getElementById("refresh-date").value,e=document.getElementById("refresh-time").value,r=document.getElementById("status-message"),o=document.getElementById("countdown");if(!t||!e)return r.textContent="请设置有效的刷新时间",void(r.style.color="red");var a=n(e.split(":").map(Number),2),i=a[0],c=a[1],l=n(t.split("-").map(Number),3),d=l[0],u=l[1],s=l[2],f=new Date(d,u-1,s,i,c,0),p=new Date;if(f<=p||isNaN(f.getTime()))return r.textContent="请设置一个将来的有效时间",void(r.style.color="red");var m=f.getTime()-p.getTime();r.textContent="将在 ".concat(f.toLocaleString()," 刷新页面"),r.style.color="#008800",g&&clearTimeout(g),y&&clearInterval(y),g=setTimeout((function(){location.reload()}),m),y=setInterval((function(){var t=new Date,n=f.getTime()-t.getTime();if(n<=0)return o.textContent="刷新中...",void clearInterval(y);var e=Math.floor(n/36e5),r=Math.floor(n%36e5/6e4),a=Math.floor(n%6e4/1e3);o.textContent="倒计时: ".concat(e,"时 ").concat(r,"分 ").concat(a,"秒")}),1e3)}function v(){g&&(clearTimeout(g),g=null),y&&(clearInterval(y),y=null);var t=document.getElementById("status-message"),n=document.getElementById("countdown");t.textContent="自动刷新已取消",t.style.color="#666",n.textContent=""}window.addEventListener("load",p),(m=new MutationObserver(p)).observe(document.body,{childList:!0,subtree:!0})}()})();