import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env vars (including non-VITE_ ones for server-side proxy config)
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      proxy: {
        '/api/cmots': {
          target: 'https://deltastockzapis.cmots.com',
          changeOrigin: true,
          rewrite: (p) => p.replace(/^\/api\/cmots/, '/api'),
          secure: true,
          headers: {
            Authorization: `Bearer ${env.CMOTS_API_TOKEN || ''}`,
          },
        },
      },
    },
    build: {
      chunkSizeWarningLimit: 600,
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-react': ['react', 'react-dom', 'react-router-dom'],
            'vendor-ui': ['framer-motion', 'recharts', 'lucide-react'],
            'vendor-utils': ['zustand', 'clsx', 'tailwind-merge', 'class-variance-authority'],
          },
        },
      },
    },
  }
})
