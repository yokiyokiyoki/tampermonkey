import { defineConfig } from 'vite'
import monkey from 'vite-plugin-monkey'

// 定义脚本配置
const scripts = {
  yes24: {
    entry: 'src/yes24/main.js',
    name: 'yes24座位分析助手',
    description: '分析yes24网站上的座位可选状态',
    match: ['*://ticket.yes24.com/*']
  },
  ocr: {
    entry: 'src/ocr/main.js',
    name: 'OCR助手',
    description: '图片文字识别工具',
    match: ['*://*/*']
  },
  melon: {
    entry: 'src/melon/main.js',
    name: 'Melon音乐助手',
    description: 'Melon音乐网站增强工具',
    match: ['*://www.melon.com/*']
  }
}

// 生成多入口配置
 // 如果指定了模式，只构建对应的脚本
 export default defineConfig(({ mode }) => {
 const targetScripts = mode ? { [mode]: scripts[mode] } : scripts

 return {
   build: {
     rollupOptions: {
       input: Object.values(targetScripts).reduce((acc, script) => ({
         ...acc,
         [script.entry.split('/').pop().replace('.js', '')]: script.entry
       }), {})
     }
   },
   plugins: Object.entries(targetScripts).map(([key, script]) => 
     monkey({
       entry: script.entry,
       userscript: {
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
   )
 }
})