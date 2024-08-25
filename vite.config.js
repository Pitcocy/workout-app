import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react()],
    optimizeDeps: {
      include: ['papaparse']
    },
    base: '/workout-app/',
    define: {
      'import.meta.env': JSON.stringify(env)
    },
    build: {
      outDir: 'dist',
      sourcemap: true
    }
  }
})