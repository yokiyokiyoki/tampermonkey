const path = require('path');
const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');
const fs = require('fs');
const glob = require('glob');

// 获取脚本元数据
function getScriptMeta(scriptName) {
  const metaData = {
    'yes24-seat': {
      name: 'yes24座位分析助手',
      version: '1.3',
      description: '分析yes24网站上的座位可选状态，支持自动抢票、自动锁票和自动刷新功能',
      author: 'yoki',
      match: [
        '*://ticket.yes24.com/*',
        '*://*.ticket.yes24.com/*'
      ],
      grants: [
        'GM_setValue',
        'GM_getValue',
        'GM_notification',
        'window.focus'
      ]
    },
    'ticketlink-next-key': {
      name: 'Ticketlink MNJKL翻页并拦截弹窗',
      version: '1.0',
      description: '按下MNJKL键点击下一页按钮并拦截alert',
      author: 'yoki',
      match: [
        'https://www.ticketlink.co.kr/global/zh/*'
      ],
      grants: ['unsafeWindow']
    },
    'yes24-booking': {
      name: 'YES24自动刷新预订',
      version: '1.0',
      description: '在指定时间自动刷新页面并点击预订按钮',
      author: 'yoki',
      match: [
        '*://ticket.yes24.com/Pages/English/Perf/*',
      ],
      grants: ['unsafeWindow']
    },
    'ticketlink-booking': {
      name: 'TicketLink自动刷新预订',
      version: '1.0',
      description: '在指定时间自动刷新页面并点击预订按钮',
      author: 'yoki',
      match: [
        '*://www.ticketlink.co.kr/global/zh/product/*',
      ],
      grants: ['unsafeWindow']
    },
    'ocr': {
      name: 'OCR脚本',
      version: '1.0',
      description: '使用指定ai识别图片',
      author: 'yoki',
      match: [
        '*://**/*',
      ],
      grants: [
        'unsafeWindow',
        'GM_getValue',
        'GM_setValue',
        'GM_setClipboard',
        'GM_xmlhttpRequest',
        'GM_registerMenuCommand'
      ]
    },
    'cicc-cloud-analysis-notice': {
      name: 'CICC 云分析告警通知',
      version: '1.0',
      description: '每隔一个小时将监控数据发送到飞书机器人',
      author: 'yoki',
      match: [
        'https://console.cloud.tencent.com/monitor/rum/analysis*'
      ],
      grants: [
        'GM_xmlhttpRequest',
        'GM_notification'
      ],
      connect: ['open.feishu.cn']
    }
    // 可以在这里添加更多脚本的元数据
  };
  const name = scriptName
  console.log('name', name)
  return metaData[name] || {
    name: name,
    version: '1.0',
    description: '油猴脚本',
    author: 'You',
    match: ['*://*/*']
  };
}

// 自动扫描入口文件
function getEntries() {
  const entries = {};
  const srcDir = path.resolve(__dirname, 'src');

  // 查找所有一级目录下的main.js文件作为入口
  const mainFiles = glob.sync(path.join(srcDir, '*/main.js'));

  mainFiles.forEach(file => {
    const dirName = path.basename(path.dirname(file));
    const entryName = `${dirName}`;
    entries[entryName] = file;
  });

  return entries;
}

// 根据入口名生成UserScript头信息
function generateBanner(entryName) {
  const meta = getScriptMeta(entryName);

  let banner = `// ==UserScript==\n`;
  banner += `// @name         ${meta.name}\n`;
  banner += `// @namespace    http://tampermonkey.net/\n`;
  banner += `// @version      ${meta.version}\n`;
  banner += `// @description  ${meta.description}\n`;
  banner += `// @author       ${meta.author}\n`;

  // 添加所有匹配规则
  meta.match.forEach(match => {
    banner += `// @match        ${match}\n`;
  });

  // 添加所有授权
  if (meta.grants && meta.grants.length) {
    meta.grants.forEach(grant => {
      banner += `// @grant        ${grant}\n`;
    });
  }

  // 添加跨域连接配置
  if (meta.connect && meta.connect.length) {
    meta.connect.forEach(domain => {
      banner += `// @connect      ${domain}\n`;
    });
  }

  banner += `// @run-at       document-end\n`;
  banner += `// ==/UserScript==\n\n`;
  return banner;
}

// 生成多入口的banner插件配置
function generateBannerPlugins(entries) {
  return Object.keys(entries).map(entryName => {
    return new webpack.BannerPlugin({
      banner: generateBanner(entryName),
      raw: true,
      entryOnly: true,
      test: new RegExp(`${entryName}\.user\.js$`)
    });
  });
}

const entries = getEntries();

module.exports = {
  mode: 'production',
  entry: entries,
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].user.js'
  },
  resolve: {
    extensions: ['.js']
  },
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        extractComments: false,
        terserOptions: {
          format: {
            comments: /^\s*(==\/?UserScript==|@(name|namespace|version|description|author|match|grant|run-at)\b)/,
          },
        }
      }),
    ],
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-env', {
                targets: {
                  browsers: ['last 2 versions', 'ie >= 11']
                },
                modules: false
              }]
            ],
            plugins: [
              '@babel/plugin-transform-runtime'
            ]
          }
        }
      }
    ]
  },
  plugins: [
    // 为每个入口添加对应的banner
    ...generateBannerPlugins(entries)
  ]
};