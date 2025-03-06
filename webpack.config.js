const path = require('path');
const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  mode: 'production',
  entry: {
    'yes24_seat_helper': './src/yes24/main.js'
  },
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
    new webpack.BannerPlugin({
      banner: `// ==UserScript==
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

`,
      raw: true,
      entryOnly: true
    })
  ]
};