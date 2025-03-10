// ==UserScript==
// @name         Ticketlink M键翻页
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  按下M键点击下一页按钮
// @author       Your Name
// @match        https://www.ticketlink.co.kr/global/zh/*
// @run-at       document-end
// ==/UserScript==
!function(){"use strict";document.addEventListener("keydown",(function(e){if("m"===e.key.toLowerCase()){var o=document.querySelector('[ng-click="right.next()"]');o&&(o.click(),console.log("M键触发下一页点击"));var c=document.querySelector('[ng-click="fn.common.goToNextStep()"]');c&&(c.click(),console.log("M键触发下一页点击"))}}))}();