const path = require('path');
const WebpackUserscript = require('webpack-userscript');

// 定义脚本配置
const scripts = {
  yes24: {
    entry: './src/yes24/main.js',
    name: 'yes24座位分析助手',
    description: '分析yes24网站上的座位可选状态',
    match: ['*://ticket.yes24.com/*']
  },
  ocr: {
    entry: './src/ocr/main.js',
    name: 'OCR助手',
    description: '图片文字识别工具',
    match: ['*://*/*']
  },
  melon: {
    entry: './src/melon/main.js',
    name: 'Melon音乐助手',
    description: 'Melon音乐网站增强工具',
    match: ['*://www.melon.com/*']
  }
};

// 创建多入口配置
module.exports = (env, argv) => {
  // 根据打包参数选择要构建的脚本
  const scriptName = env.script;
  const targetScripts = scriptName ? { [scriptName]: scripts[scriptName] } : scripts;
  
  // 生成多个配置
  return Object.entries(targetScripts).map(([key, script]) => {
    return {
      entry: script.entry,
      output: {
        path: path.resolve(__dirname, 'dist'),
        filename: `${key}.user.js`
      },
      module: {
        rules: [
          {
            test: /\.js$/,
            exclude: /node_modules/,
            use: {
              loader: 'babel-loader',
              options: {
                presets: ['@babel/preset-env']
              }
            }
          }
        ]
      },
      plugins: [
        new WebpackUserscript({
          headers: {
            name: script.name,
            namespace: 'http://tampermonkey.net/',
            version: '1.2',
            description: script.description,
            author: 'Yoki',
            match: script.match,
            grant: [
              'GM_setValue',
              'GM_getValue',
              'GM_notification'
            ]
          }
        })
      ]
    };
  });
};