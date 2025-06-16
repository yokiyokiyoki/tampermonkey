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

  // 检测章节列表
  function checkChapterList() {
    console.log("🔍 开始检测章节列表...");

    const chapterListBox = document.querySelectorAll(
      ".chapter-list .tabs-cont-item .section-arrow .chapter-list-box"
    );
    if (!chapterListBox) {
      console.log("❌ 未找到 chapter-list-box 元素");
      return;
    }

    let hasClicked = false; // 添加标志位，确保只点击一次

    chapterListBox.forEach((cb, chapterIndex) => {
      if (hasClicked) return; // 如果已经点击过，直接跳过

      const sectionItems = cb.querySelectorAll(".chapter-right .section-item");
      console.log(`  📦 找到 ${sectionItems.length} 个 section-item`);
      if (sectionItems.length === 0) {
        console.log(`  ❌ chapter-right ${chapterIndex + 1} 没有 section-item`);
        return; // 如果没有 section-item，直接跳过
      }
      const firstSectionItem = sectionItems[0];
      console.log(
        `    📄 检查第一个 section-item (总共${sectionItems.length}个)`
      );

      const items = firstSectionItem.querySelectorAll(".item");
      console.log(`      📦 找到 ${items.length} 个 item`);

      const lastItem = items[items.length - 1];
      const span = lastItem.querySelector("span");

      if (span) {
        const text = span.textContent.trim();
        console.log(
          `      ✅ chapter-right ${
            chapterIndex + 1
          } 第一个 section-item 的最后一个 item 的 span 文字: "${text}"`
        );

        // 检查是否为需要点击的状态
        if (text === "学习中" || text === "未开始") {
          console.log(`      🖱️ 发现可点击状态: "${text}"，准备点击...`);
          hasClicked = true; // 设置标志位
          setTimeout(() => {
            lastItem.click();
            console.log(
              `      ✅ 已点击 chapter-right ${
                chapterIndex + 1
              } 第一个 section-item 的最后一个 item`
            );
            setTimeout(() => {
              checkVideoStatus();
            }, 5 * 1000);
          }, 5 * 1000);
          return; // 点击后退出，避免重复点击
        }
      } else {
        console.log(
          `      ⚠️ chapter-right ${
            chapterIndex + 1
          } 第一个 section-item 的最后一个 item 没有 span 元素`
        );
        location.reload(); // 刷新页面
        return;
      }
    });

    // 检查是否所有章节都已完成学习
    let allCompleted = true;

    chapterListBox.forEach((cb) => {
      const chapterRights = cb.querySelector(".chapter-right");
      const sectionItems = chapterRights.querySelectorAll(".section-item");

      if (sectionItems.length > 0) {
        const firstSectionItem = sectionItems[0];
        const items = firstSectionItem.querySelectorAll(".item");

        const lastItem = items[items.length - 1];
        const span = lastItem.querySelector("span");

        if (span) {
          const text = span.textContent.trim();
          if (text === "学习中" || text === "未开始") {
            allCompleted = false;
          }
        }
      }
    });

    if (allCompleted && chapterListBox.length > 0) {
      console.log("🎉 全部学习完成！");
      // 找到sessionStorage中的课程详情页链接
      const courseDetailPage = sessionStorage.getItem("courseDetailPage");
      if (courseDetailPage) {
        console.log("🔗 跳转到课程详情页:", courseDetailPage);
        // 跳转到课程详情页
        setTimeout(() => {
          window.location.href = courseDetailPage;
        }, 1000);
      } else {
        console.log("❌ 未找到课程详情页链接");
      }
    }
  }

  // 检查视频状态
  function checkVideoStatus() {
    console.log("🔍 检查视频状态...");

    const videoElement = document.querySelector("video");
    if (!videoElement) {
      console.log("❌ 未找到 video 元素");
      return;
    }
    console.log(videoElement, "视频元素已找到");
    console.log(`🎥 视频状态: ${videoElement.readyState}`);
    // 设置为静音模式后播放
    videoElement.muted = true;
    console.log("🔇 视频已设置为静音");

    // 视频两倍速
    videoElement.playbackRate = 2.0;
    videoElement.play();
    console.log("🎥 视频已设置为两倍速播放");
    // 监听视频播放结束事件
    videoElement.addEventListener("ended", () => {
      console.log("🎥 视频播放结束");
      // 刷新页面以加载下一个视频
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
