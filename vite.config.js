import { defineConfig } from 'vite';

export default defineConfig({
  resolve: {
    alias: {
      '@': '/src' // O la ruta correspondiente en tu proyecto
    }
  }
});
