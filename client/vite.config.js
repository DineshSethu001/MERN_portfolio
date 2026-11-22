import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// In development, Vite proxies API and upload requests to Express,
// so the auth cookie stays same-origin.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:5000',
      '/uploads': 'http://localhost:5000',
    },
  },
});
