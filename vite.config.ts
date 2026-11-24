import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  // На GitHub Pages сайт живе в підпапці /MagicalFox/, на власному домені в корені.
  base: process.env.BASE_PATH || '/',
  plugins: [react(), tailwindcss()],
})
