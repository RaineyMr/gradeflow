import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Expose to network
    port: 5174, // Specify port
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@components": path.resolve(__dirname, "./src/components"),
      "@lib": path.resolve(__dirname, "./src/lib"),
      "@hooks": path.resolve(__dirname, "./src/hooks"),
      "@pages": path.resolve(__dirname, "./src/pages"),
      "@styles": path.resolve(__dirname, "./src/styles"),
      "@layouts": path.resolve(__dirname, "./src/layouts"),
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
    force: true, // Force optimization
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Create separate chunks for node_modules dependencies
          if (id.includes('node_modules')) {
            // Group React ecosystem together to avoid conflicts
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor-react';
            }
            if (id.includes('framer-motion')) {
              return 'vendor-motion';
            }
            if (id.includes('react-router')) {
              return 'vendor-router';
            }
            // Group other major libraries
            if (id.includes('zustand')) {
              return 'vendor-state';
            }
            // Other vendor libraries
            return 'vendor';
          }
          
          // Create chunks for different parts of the application
          if (id.includes('@components/ui')) {
            return 'ui-components';
          }
          if (id.includes('@components/support')) {
            return 'support-components';
          }
          if (id.includes('@components/layout')) {
            return 'layout-components';
          }
          if (id.includes('@pages')) {
            // Further split major pages
            if (id.includes('Dashboard')) {
              return 'page-dashboard';
            }
            if (id.includes('Gradebook')) {
              return 'page-gradebook';
            }
            if (id.includes('LessonPlan')) {
              return 'page-lesson-plan';
            }
            if (id.includes('Login')) {
              return 'page-login';
            }
            return 'pages';
          }
          if (id.includes('@lib')) {
            // Split core lib modules
            if (id.includes('i18n')) {
              return 'lib-i18n';
            }
            if (id.includes('store')) {
              return 'lib-store';
            }
            if (id.includes('demoAccounts')) {
              return 'lib-demo';
            }
            return 'lib';
          }
          if (id.includes('@hooks')) {
            return 'hooks';
          }
          
          // Return null to let Rollup handle it normally
          return null;
        },
      },
    },
    // Ensure clean builds
    minify: 'terser',
    sourcemap: true,
  },
});
