import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // 必须是绝对路径。用 './' 的话，/review/films 这种深层路由下资源会被
  // 解析成 /review/assets/...，文件不存在，再被 nginx 的 SPA 回退当成
  // index.html 返回 —— 浏览器收到 text/html 的 module script 直接白屏
  base: '/',
  plugins: [react()],
  resolve: {
    alias: {
      // 游戏是 git 子模块（vendor/temu-thea），站点直接编译它的源码。
      // 只暴露 src/game —— 那是游戏文档里说的"可移植边界"，
      // 它的 App.jsx 是开发外壳，不该被站点引用
      '@game': fileURLToPath(new URL('./vendor/temu-thea/src/game', import.meta.url)),
    },
  },
  server: {
    host: '0.0.0.0',
    // 外部工具（预览面板）靠 PORT 指定端口，Vite 默认不读它。加上
    // strictPort 就更要命：端口被占时它不会另找一个，而是直接失败，
    // 或者闷头占着调用方以为空着的那个号
    port: Number(process.env.PORT) || 5173,
    strictPort: true,
    watch: {
      usePolling: true
    }
  }
})
