import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// In dev we proxy API + image requests to the Express server on :4000,
// so the browser sees one same-origin app (cookies + no CORS headaches).
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:4000',
      '/uploads': 'http://localhost:4000',
    },
  },
});
