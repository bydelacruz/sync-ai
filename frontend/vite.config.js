import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // 1. Load environment variables
  const env = loadEnv(mode, process.cwd(), '')
  
  // 2. Determine the backend URL
  // In Docker, this will be "http://backend:8000"
  // Locally, this will fall back to "http://127.0.0.1:8000"
  const target = env.VITE_API_URL || 'http://127.0.0.1:8000';

  console.log(`🚀 Proxying API requests to: ${target}`);

  return {
    plugins: [react()],
    server: {
      host: true, // Needed for Docker port mapping
      proxy: {
        '/users': {
          target: target,
          changeOrigin: true,
          secure: false,
        },
        '/tasks': {
          target: target,
          changeOrigin: true,
          secure: false,
        },
        '/search': {
          target: target,
          changeOrigin: true,
          secure: false,
        },
      }
    }
  }
})
