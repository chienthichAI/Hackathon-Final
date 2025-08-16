import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  plugins: [
    react({
      // Configure React Refresh to prevent DOM manipulation errors
      fastRefresh: true,
      // Disable React Refresh in certain conditions to prevent errors
      refresh: {
        // Prevent refresh on certain file changes
        exclude: [/node_modules/, /\.(test|spec)\.(js|jsx|ts|tsx)$/],
        // Add error overlay configuration
        overlay: {
          // Disable error overlay for certain errors
          exclude: [/Failed to execute 'removeChild'/, /Failed to execute 'insertBefore'/]
        }
      }
    }),
    // Temporarily disabled PWA until package is installed
    // VitePWA({
    //   registerType: 'autoUpdate',
    //   workbox: {
    //     globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}']
    //   },
    //   includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
    //   manifest: {
    //     name: 'AI Learning Platform',
    //     short_name: 'AI Learn',
    //     description: 'Comprehensive AI-powered learning platform for students',
    //     theme_color: '#3b82f6',
    //     background_color: '#ffffff',
    //     display: 'standalone',
    //     orientation: 'portrait',
    //     scope: '/',
    //     start_url: '/',
    //     icons: [
    //       {
    //         src: 'pwa-192x192.png',
    //         sizes: '192x192',
    //         type: 'image/png'
    //       },
    //       {
    //         src: 'pwa-512x512.png',
    //         sizes: '512x512',
    //         type: 'image/png'
    //       }
    //     ]
    //   }
    // })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/pages': path.resolve(__dirname, './src/pages'),
      '@/hooks': path.resolve(__dirname, './src/hooks'),
      '@/utils': path.resolve(__dirname, './src/utils'),
      '@/contexts': path.resolve(__dirname, './src/contexts'),
      '@/types': path.resolve(__dirname, './src/types'),
      '@/assets': path.resolve(__dirname, './src/assets')
    }
  },
  server: {
    port: 3000,
    // Add HMR configuration to prevent DOM errors
    hmr: {
      overlay: {
        // Disable error overlay for certain errors
        exclude: [/Failed to execute 'removeChild'/, /Failed to execute 'insertBefore'/]
      }
    }
  },
  // Add build optimization to prevent issues
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['@chakra-ui/react']
        }
      }
    }
  }
})
