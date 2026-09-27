import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // ── React + Ant Design MUST stay together ──────────────────────────
          // Ant Design calls React.useLayoutEffect directly. If React is in a
          // separate chunk it may not be initialized when antd loads, causing:
          // "Cannot read properties of undefined (reading 'useLayoutEffect')"
          if (
            id.includes('node_modules/react/') ||
            id.includes('node_modules/react-dom/') ||
            id.includes('node_modules/scheduler/') ||
            id.includes('node_modules/antd/') ||
            id.includes('node_modules/@ant-design/') ||
            id.includes('node_modules/rc-')
          ) {
            return 'vendor-react-antd';
          }

          // ── TanStack Query ─────────────────────────────────────────────────
          if (id.includes('@tanstack/react-query')) {
            return 'vendor-query';
          }

          // ── React Router ───────────────────────────────────────────────────
          if (id.includes('node_modules/react-router')) {
            return 'vendor-router';
          }

          // ── Lucide icons ───────────────────────────────────────────────────
          if (id.includes('node_modules/lucide-react')) {
            return 'vendor-lucide';
          }

          // ── QR / camera (only loaded on /admin/scan) ───────────────────────
          if (
            id.includes('node_modules/@zxing') ||
            id.includes('node_modules/html5-qrcode') ||
            id.includes('node_modules/jsqr')
          ) {
            return 'vendor-qr';
          }

          // ── Date utilities ─────────────────────────────────────────────────
          if (id.includes('node_modules/dayjs')) {
            return 'vendor-dayjs';
          }

          // ── Google OAuth ───────────────────────────────────────────────────
          if (id.includes('@react-oauth/google')) {
            return 'vendor-google';
          }

          // Everything else → auto-split by Vite (route chunks from React.lazy)
        },
      },
    },
  },
})
