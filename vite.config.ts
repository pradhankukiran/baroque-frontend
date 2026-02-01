import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { quasar, transformAssetUrls } from '@quasar/vite-plugin';
import path from 'path';

export default defineConfig({
  plugins: [
    vue({
      template: { transformAssetUrls },
    }),
    quasar({
      sassVariables: 'src/css/quasar.variables.scss',
    }),
  ],
  resolve: {
    alias: {
      src: path.resolve(__dirname, './src'),
      components: path.resolve(__dirname, './src/components'),
      pages: path.resolve(__dirname, './src/pages'),
      layouts: path.resolve(__dirname, './src/layouts'),
      stores: path.resolve(__dirname, './src/stores'),
      boot: path.resolve(__dirname, './src/boot'),
    },
  },
  server: {
    port: 9000,
    open: true,
  },
});
