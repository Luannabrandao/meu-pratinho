import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api-openclaw': {
        target: 'http://127.0.0.1:18789',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api-openclaw/, ''),
        // 🔥 ESTA É A MÁGICA: Força o Vite a injetar os cabeçalhos que o navegador quer ver
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('Erro no proxy:', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Enviando requisição para o OpenClaw:', req.url);
          });
          proxy.on('proxyRes', (proxyRes, _req, res) => {
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader(
              'Access-Control-Allow-Methods',
              'GET, POST, PUT, DELETE, OPTIONS',
            );
            res.setHeader(
              'Access-Control-Allow-Headers',
              'Content-Type, Authorization',
            );
          });
        },
      },
    },
  },
});
