import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Raise the warning threshold — the vendor chunk will still be large, but
    // it's cached by the browser after the first load (never re-downloaded).
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // ── React core (tiny, downloaded once) ─────────────────────────────
          if (id.includes('node_modules/react/') ||
              id.includes('node_modules/react-dom/') ||
              id.includes('node_modules/react-router') ||
              id.includes('node_modules/scheduler/')) {
            return 'vendor-react';
          }

          // ── TanStack Query (separate, tiny) ─────────────────────────────────
          if (id.includes('@tanstack/react-query')) {
            return 'vendor-query';
          }

          // ── Ant Design (heaviest lib — isolated so everything else stays small)
          if (id.includes('node_modules/antd/') ||
              id.includes('node_modules/@ant-design/') ||
              id.includes('node_modules/rc-')) {
            return 'vendor-antd';
          }

          // ── Ant Design Icons (very large — separate chunk, loaded lazily) ──
          if (id.includes('node_modules/@ant-design/icons')) {
            return 'vendor-antd-icons';
          }

          // ── Lucide icons ────────────────────────────────────────────────────
          if (id.includes('node_modules/lucide-react')) {
            return 'vendor-lucide';
          }

          // ── Google OAuth ─────────────────────────────────────────────────────
          if (id.includes('@react-oauth/google') ||
              id.includes('node_modules/google')) {
            return 'vendor-google';
          }

          // ── QR / camera / zxing (only used in admin QR page) ────────────────
          if (id.includes('node_modules/@zxing') ||
              id.includes('node_modules/html5-qrcode') ||
              id.includes('node_modules/jsqr')) {
            return 'vendor-qr';
          }

          // ── Date / image utilities ───────────────────────────────────────────
          if (id.includes('node_modules/dayjs')) {
            return 'vendor-dayjs';
          }

          // Everything else stays in the default auto-split chunks
        },
      },
    },
  },
})
