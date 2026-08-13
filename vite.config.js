import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// User site (anishka1511.github.io) is served from the domain root via Actions → dist
export default defineConfig({
  base: '/',
  plugins: [react()],
});
