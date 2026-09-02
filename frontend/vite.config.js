import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // 必须是绝对路径。用 './' 的话，/review/films 这种深层路由下资源会被
  // 解析成 /review/assets/...，文件不存在，再被 nginx 的 SPA 回退当成
  // index.html 返回 —— 浏览器收到 text/html 的 module script 直接白屏
  base: '/',
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    watch: {
      usePolling: true
    }
  }
})
