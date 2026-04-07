import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // When the admin build is served by the Nest backend, it is mounted at /dashboard
  // so assets must be emitted with that base path.
  base: process.env.VITE_BASE ?? '/',
  plugins: [react()],
})
