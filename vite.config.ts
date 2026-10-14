import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // Served from https://nguillet23.github.io/huckit/
  base: '/huckit/',
  plugins: [react()],
})
