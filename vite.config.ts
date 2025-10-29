import path from "path"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(), 
    tailwindcss(),
    // Bundle analyzer (only in build mode)
    ...(process.env.ANALYZE ? [visualizer({
      filename: 'dist/stats.html',
      open: true,
      gzipSize: true,
      brotliSize: true,
    })] : []),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'Event Networking App',
        short_name: 'EventApp',
        description: 'Professional networking platform for events and conferences',
        theme_color: '#FF6B35',
        background_color: '#FFFFFF',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,webp,avif}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.(?:png|jpg|jpeg|svg|gif|webp|avif)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              }
            }
          },
          {
            urlPattern: /^.*\/api\/.*/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              networkTimeoutSeconds: 3,
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 5 // 5 minutes
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      },
      devOptions: {
        enabled: true
      }
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    // CRITICAL: Dedupe React to prevent multiple instances
    dedupe: ['react', 'react-dom', 'react/jsx-runtime'],
  },
  build: {
    // Enable source maps for better debugging in production
    sourcemap: false,
    // Optimize chunk size
    chunkSizeWarningLimit: 1000,
    // Enable minification
    minify: 'esbuild',
    // Target modern browsers for better optimization
    target: 'esnext',
    // Ensure React is properly handled in production
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true,
    },
    rollupOptions: {
      output: {
        // Advanced code splitting strategy
        manualChunks: (id) => {
          // Vendor chunks
          if (id.includes('node_modules')) {
            // CRITICAL: Keep React and React-DOM in the main vendor chunk
            // to prevent multiple React instances
            if (id.includes('react') || id.includes('react-dom') || id.includes('scheduler')) {
              return 'vendor';
            }
            // Routing
            if (id.includes('react-router')) {
              return 'router-vendor';
            }
            // TanStack Query
            if (id.includes('@tanstack/react-query')) {
              return 'query-vendor';
            }
            // UI components
            if (id.includes('@radix-ui') || id.includes('lucide-react')) {
              return 'ui-vendor';
            }
            // Charts and visualization
            if (id.includes('recharts') || id.includes('d3')) {
              return 'charts-vendor';
            }
            // Virtual scrolling
            if (id.includes('@tanstack/react-virtual')) {
              return 'virtual-vendor';
            }
            // Other vendors
            return 'vendor';
          }
          
          // App chunks based on routes
          if (id.includes('/pages/')) {
            if (id.includes('Admin')) {
              return 'admin-pages';
            }
            if (id.includes('Dashboard')) {
              return 'dashboard-page';
            }
            if (id.includes('Schedule')) {
              return 'schedule-page';
            }
            if (id.includes('Networking')) {
              return 'networking-page';
            }
            if (id.includes('Polls')) {
              return 'polls-page';
            }
            if (id.includes('Login') || id.includes('Register')) {
              return 'auth-pages';
            }
          }
          
          // Component chunks
          if (id.includes('/components/')) {
            if (id.includes('networking/')) {
              return 'networking-components';
            }
            if (id.includes('ui/')) {
              return 'ui-components';
            }
            if (id.includes('layout/')) {
              return 'layout-components';
            }
          }
        },
        // Optimize chunk naming
        chunkFileNames: () => {
          return `js/[name]-[hash].js`;
        },
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          if (!assetInfo.name) return `assets/[name]-[hash][extname]`;
          
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          if (/\.(png|jpe?g|svg|gif|tiff|bmp|ico|webp|avif)$/i.test(assetInfo.name)) {
            return `images/[name]-[hash].${ext}`;
          }
          if (/\.(woff2?|eot|ttf|otf)$/i.test(assetInfo.name)) {
            return `fonts/[name]-[hash].${ext}`;
          }
          return `assets/[name]-[hash].${ext}`;
        },
      },
      // Tree shaking optimizations
      treeshake: {
        moduleSideEffects: false,
        propertyReadSideEffects: false,
        unknownGlobalSideEffects: false,
      },
      // Ensure React is not externalized
      external: [],
    },
    // CSS code splitting
    cssCodeSplit: true,
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
      '@tanstack/react-virtual',
      'zustand',
      'lucide-react',
    ],
    exclude: ['@vite/client', '@vite/env'],
  },
  define: {
    // Ensure React is available globally for dependencies that expect it
    global: 'globalThis',
  },
  server: {
    port: 3000,
    open: true,
  },
  // Performance optimizations
  esbuild: {
    // Remove console logs in production
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
    // Keep function names for React hooks
    keepNames: true,
  },
})
