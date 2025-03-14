import { defineConfig } from 'vite';


export default defineConfig({
  server: {
    port: 3000
  },
  optimizeDeps: {
    include: ['natural', 'compromise', 'd3-cloud']
  },
  base: '/Wiki-Category-WordCloud/',
  build: {
    commonjsOptions: {
      include: [/natural/, /compromise/, /d3-cloud/]
    },
    outDir: 'dist'
  }
});
