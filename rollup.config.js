import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import babel from '@rollup/plugin-babel';
import metablock from 'rollup-plugin-userscript-metablock';
import path from 'path';
import { fileURLToPath } from 'url';

// ES模块中获取当前文件路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 定义脚本配置
const scripts = {
  yes24: {
    input: 'src/yes24/main.js',
    output: 'yes24.user.js',
    name: 'yes24座位分析助手',
    description: '分析yes24网站上的座位可选状态',
    match: ['*://ticket.yes24.com/*']
  },
  // 其他脚本配置保持不变...
};

// 生成配置数组
export default (args) => {
  // 决定要构建哪些脚本
  const scriptKey = args.script;
  const targetScripts = scriptKey ? { [scriptKey]: scripts[scriptKey] } : scripts;
  
  // 为每个脚本生成配置
  return Object.entries(targetScripts).map(([key, script]) => {
    return {
      input: script.input,
      output: {
        file: path.resolve(__dirname, 'dist', script.output),
        format: 'iife',
        sourcemap: false
      },
      // 插件配置保持不变...
    };
  });
};