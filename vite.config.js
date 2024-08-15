import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    mainFields: ['main', 'browser'],
    alias: {
      global: 'node-polyfills/browser-global',
      process: 'node-polyfills/browser-process',
    },
  },
  optimizeDeps: {
    include: [
      '@xmpp/client',
    ],
  },
  plugins: [react()],
  define: {
    global: {},
    'global.WebSocket': 'window.WebSocket', // Ensure WebSocket is available globally
    'global.btoa': 'window.btoa.bind(window)', // Ensure btoa is available globally
  }
})
