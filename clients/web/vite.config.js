import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite' // Doit être présent

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // Doit être présent
  ],
})

