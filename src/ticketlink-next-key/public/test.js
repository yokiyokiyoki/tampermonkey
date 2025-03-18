// 在页面加载前运行
(function() {
    // 保存原始console方法
    const originalConsole = {
      log: console.log,
      clear: ()=>{},
      debug: console.debug,
      info: console.info,
      warn: console.warn,
      error: console.error
    };
    
    // 保存原始alert方法
    const originalAlert = window.alert;
    
    // 防止控制台检测
    Object.defineProperty(window, 'console', {
      get: function() {
        return originalConsole;
      },
      set: function() {
        return originalConsole;
      },
      configurable: false
    });
    
    // 覆盖alert以防止弹出韩文错误信息
    window.alert = function(msg) {
      if(msg) {
        console.log("防调试警告已拦截",msg);
        return;
      }
      return originalAlert.apply(this, arguments);
    };
    
    
    // 禁用各种事件监听器
    const originalAddEventListener = EventTarget.prototype.addEventListener;
    EventTarget.prototype.addEventListener = function(type, listener, options) {
      if(type === "devtoolschange" || type === "resize" || type === "error") {
        console.log("拦截了事件监听:", type);
        return;
      }
      return originalAddEventListener.call(this, type, listener, options);
    };
  })();



  