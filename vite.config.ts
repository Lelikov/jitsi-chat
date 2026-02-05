import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      react(),
      {
        name: 'html-transform',
        transformIndexHtml(html) {
          return html.replace(
            /\/env-config\.js(?:\?chatKey=[^"]*)?/,
            `/env-config.js?chatKey=${env.VITE_STREAM_CHAT_API_KEY || ''}`
          )
        },
      },
    ],
  }
})
