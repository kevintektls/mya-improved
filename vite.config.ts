import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // GitHub Pages hosts this project under /mya-improved/ instead of the domain root.
  base: process.env.GITHUB_ACTIONS === 'true' ? '/mya-improved/' : '/',
  plugins: [react()],
});
