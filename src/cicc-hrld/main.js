// ==UserScript==
// @name         CICC HRLD 课程助手
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  CICC HRLD 课程学习助手
// @author       You
// @match        https://hrld.cicc.com.cn/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function () {
  "use strict";

  // 等待页面加载完成
  function waitForPageLoad() {
    return new Promise((resolve) => {
      if (document.readyState === "complete") {
        resolve();
      } else {
        window.addEventListener("load", resolve);
      }
    });
  }

  // 主函数
  async function init() {
    console.log("🎓 CICC HRLD 课程助手已启动");

    // 等待页面加载
    await waitForPageLoad();

    // 监听URL变化（单页应用）
    let currentUrl = location.href;
    const observer = new MutationObserver(() => {
      if (location.href !== currentUrl) {
        currentUrl = location.href;
        onPageChange();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // 页面首次加载
    onPageChange();
  }

  // 页面变化处理
  function onPageChange() {
    const url = location.href;
    console.log("📍 页面变化:", url);

    if (url.includes("/study/subject/detail/")) {
      console.log("📖 进入课程详情页");
      sessionStorage.setItem("courseDetailPage", location.href);
      setupCourseDetailPage();
    }
    if (url.includes("/study/course/detail/")) {
      console.log("📚 进入章节视频页");
      setupVideoPage();
    }
  }

  // 设置章节视频页功能
  function setupVideoPage() {
    console.log("⚙️ 设置章节视频页功能");

    // 检测章节列表信息
    setTimeout(() => {
      checkChapterList();
    }, 10000);
    
  }

  // 获取章节学习状态
  function getChapterStatus(chapterBox) {
    const sectionItems = chapterBox.querySelectorAll(".chapter-right .section-item");
    if (sectionItems.length === 0) return null;

    const firstSection = sectionItems[0];
    const items = firstSection.querySelectorAll(".item");
    if (items.length === 0) return null;

    const lastItem = items[items.length - 1];
    const span = lastItem.querySelector("span");
    
    return span ? {
      status: span.textContent.trim(),
      element: lastItem
    } : null;
  }

  // 检测章节列表
  function checkChapterList() {
    console.log("🔍 开始检测章节列表...");

    const chapterBoxes = document.querySelectorAll(
      ".chapter-list .tabs-cont-item .section-arrow .chapter-list-box"
    );
    
    if (!chapterBoxes.length) {
      console.log("❌ 未找到 chapter-list-box 元素");
      const timeId = setTimeout(() => {
        console.log("🔄 重新尝试检测章节列表...");
        checkChapterList();
        clearTimeout(timeId);
      }, 5 * 1000);
      return;
    }

    // 查找第一个可点击的章节
    for (const [index, box] of chapterBoxes.entries()) {
      const chapterInfo = getChapterStatus(box);
      
      if (!chapterInfo) {
        console.log(`⚠️ 章节 ${index + 1} 状态异常，刷新页面`);
        location.reload();
        return;
      }

      console.log(`📖 章节 ${index + 1} 状态: "${chapterInfo.status}"`);

      // 点击第一个未完成的章节
      if (chapterInfo.status === "学习中" || chapterInfo.status === "未开始") {
        console.log(`🖱️ 点击章节 ${index + 1}...`);
        setTimeout(() => {
          chapterInfo.element.click();
          setTimeout(() => {
            const videoElement = document.querySelector("video");
            // 是否模拟点击
            videoElement.dataset.simulateClick = "true";
            checkVideoStatus();
          }, 5000);
        }, 5000);
        return;
      }
    }

    // 检查是否全部完成
    const allCompleted = Array.from(chapterBoxes).every(box => {
      const info = getChapterStatus(box);
      return info && info.status !== "学习中" && info.status !== "未开始";
    });

    if (allCompleted) {
      console.log("🎉 全部学习完成！");
      const courseDetailPage = sessionStorage.getItem("courseDetailPage");
      if (courseDetailPage) {
        console.log("🔗 跳转到课程详情页:", courseDetailPage);
        setTimeout(() => window.location.href = courseDetailPage, 1000);
      } else {
        console.log("❌ 未找到课程详情页链接");
      }
    }
  }

  // 设置视频播放配置
  function setupVideoPlayback(videoElement, playbackRate = 2.0, muted = true) {
    if (videoElement.readyState !== 4) return false;

    console.log("🎥 视频已准备好播放");
    
    if (videoElement.paused) {
      videoElement.muted = muted;
      videoElement.playbackRate = playbackRate;
      videoElement.play();
      console.log(`🎥 视频已设置为${muted ? '静音' : '有声'}${playbackRate}倍速播放`);
    } else {
      console.log("🎥 视频正在播放");
      if (videoElement.playbackRate !== playbackRate) {
        videoElement.playbackRate = playbackRate;
        console.log(`🎥 视频速率已设置为${playbackRate}倍速`);
      }
    }
    return true;
  }

  // 添加视频结束监听器
  function addVideoEndListener(videoElement, onEnded) {
    // 避免重复添加监听器
    if (videoElement.dataset.listenerAdded) return;
    
    videoElement.addEventListener("ended", () => {
      console.log("🎥 视频播放结束");
      onEnded();
    });
    
    videoElement.dataset.listenerAdded = "true";
  }

  // 获取播放视频时候的状态是否是已完成
  function isVideoCompleted(videoElement) {
    if (!videoElement) return false;
    const activeChapterBox = document.querySelector(
      ".chapter-list .tabs-cont-item .section-arrow .chapter-list-box.focus"
    );
    if (!activeChapterBox) return false;
    const info = getChapterStatus(activeChapterBox);
    if (!info) return false;
    console.log(`当前章节状态: ${info.status}`);
    if(info.status ==='已完成'){
      console.log("当前章节已完成，视频无需再播放");
      return true;
    }
    return videoElement.readyState === 4 && videoElement.currentTime >= videoElement.duration;
  }

  // 检查视频状态
  function checkVideoStatus() {
    console.log("🔍 检查视频状态...");

    const videoElement = document.querySelector("video");
    if (!videoElement) {
      console.log("❌ 未找到 video 元素");
      return;
    }

    console.log(`🎥 视频状态: ${videoElement.readyState}`);
    
    // 设置视频播放配置
    setupVideoPlayback(videoElement);

    // 轮询检测视频状态
    const intervalId = setInterval(() => {
      console.log("🔄 定时检查视频状态...");
      
      const isVideoCompletedStatus = isVideoCompleted(document.querySelector("video"));
      if (isVideoCompletedStatus) {
        clearInterval(intervalId);
        console.log("🎉 视频已完成播放");
        if (videoElement.dataset.simulateClick === "true") {
          console.log(" 已经模拟点击了视频");
          location.reload();
        }
      } else {
        console.log("当前章节未完成，继续播放视频");
        setupVideoPlayback(videoElement);
      }
    }, 5000);
    
    // 添加视频结束监听器
    addVideoEndListener(videoElement, () => {
      setTimeout(() => {
        console.log("🔄 刷新页面以加载下一个视频");
        location.reload();
      }, 1000);
    });
  }

  // 设置课程详情页功能
  function setupCourseDetailPage() {
    console.log("⚙️ 设置课程详情页功能");

    // 检测catalog-state-info下的重新学习项目
    setTimeout(() => {
      checkRestudyItems();
    }, 12 * 1000);
  }

  // 检测开始学习的项目
  function checkRestudyItems() {
    console.log("🔍 开始检测学习项目...");

    // 直接查找所有可操作的项目
    const actionItems = document.querySelectorAll(
      ".catalog-state-info .item .operation i:last-child"
    );
    if (!actionItems.length) {
      console.log("❌ 未找到可操作项目");
      return;
    }

    console.log(`📋 找到 ${actionItems.length} 个可操作项目`);

    let restudyCount = 0;
    let startStudyCount = 0;
    let continueStudyCount = 0;
    let firstContinueStudyItem = null;
    let firstStartStudyItem = null;

    actionItems.forEach((actionElement, index) => {
      const textDiv = actionElement.querySelector("div");
      if (!textDiv) {
        console.log(`⚠️ item ${index + 1} 没有文字div`);
        return;
      }

      const text = textDiv.textContent.trim();
      console.log(`📝 item ${index + 1} 操作文字: "${text}"`);

      switch (text) {
        case "重新学习":
          restudyCount++;
          console.log(`✅ 找到重新学习项目: item ${index + 1}`);
          break;
        case "继续学习":
          continueStudyCount++;
          console.log(`🔄 找到继续学习项目: item ${index + 1}`);
          if (!firstContinueStudyItem) {
            firstContinueStudyItem = {
              element: actionElement,
              index: index + 1,
            };
          }
          break;
        case "开始学习":
          startStudyCount++;
          console.log(`🎯 找到开始学习项目: item ${index + 1}`);
          if (!firstStartStudyItem) {
            firstStartStudyItem = { element: actionElement, index: index + 1 };
          }
          break;
      }
    });

    console.log(
      `📊 统计结果: ${restudyCount} 个"重新学习", ${continueStudyCount} 个"继续学习", ${startStudyCount} 个"开始学习"`
    );

    // 优先级：继续学习 > 开始学习
    if (firstContinueStudyItem) {
      console.log(
        `🖱️ 准备点击第一个继续学习项目: item ${firstContinueStudyItem.index}`
      );
      setTimeout(() => {
        firstContinueStudyItem.element.click();
        console.log(
          `✅ 已点击第一个继续学习项目: item ${firstContinueStudyItem.index}`
        );
      }, 1000);
    } else if (firstStartStudyItem) {
      console.log(
        `🖱️ 准备点击第一个开始学习项目: item ${firstStartStudyItem.index}`
      );
      setTimeout(() => {
        firstStartStudyItem.element.click();
        console.log(
          `✅ 已点击第一个开始学习项目: item ${firstStartStudyItem.index}`
        );
      }, 1000);
    } else if (
      startStudyCount === 0 &&
      restudyCount === 0 &&
      continueStudyCount === 0
    ) {
      console.log("🔍 没有找到任何学习项目");
    } else {
      console.log('💡 只有"重新学习"项目，暂不自动点击');
    }
  }

  // 启动脚本
  init().catch(console.error);
})();
