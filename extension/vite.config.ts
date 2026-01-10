import { defineConfig } from 'vite';
import { resolve } from 'path';

// Determine which build to run based on environment variable
const buildTarget = process.env.BUILD_TARGET || 'all';

// Content script config - IIFE format, no imports
const contentConfig = defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: false,
    target: 'es2020',
    lib: {
      entry: resolve(__dirname, 'src/content/index.ts'),
      name: 'PlanScopeContent',
      formats: ['iife'],
      fileName: () => 'content.js',
    },
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      },
    },
    modulePreload: false,
    sourcemap: false,
  },
  publicDir: false,
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
  },
});

// Background script config - IIFE format for service worker compatibility
const backgroundConfig = defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: false,
    target: 'es2020',
    lib: {
      entry: resolve(__dirname, 'src/background/index.ts'),
      name: 'PlanScopeBackground',
      formats: ['iife'],
      fileName: () => 'background.js',
    },
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      },
    },
    modulePreload: false,
    sourcemap: false,
  },
  publicDir: false,
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
  },
});

// Popup config - ES modules
const popupConfig = defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    target: 'es2020',
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'src/popup/index.html'),
      },
      output: {
        entryFileNames: '[name].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
        format: 'es',
      },
    },
    modulePreload: false,
  },
  publicDir: 'public',
});

// Export based on build target
let config;
switch (buildTarget) {
  case 'content':
    config = contentConfig;
    break;
  case 'background':
    config = backgroundConfig;
    break;
  default:
    config = popupConfig;
}

export default config;
