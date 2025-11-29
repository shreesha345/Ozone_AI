import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      // Proxy /api/news/* to NewsAPI to avoid CORS and keep API key out of browser in dev
      '/api/news': {
        target: 'https://newsapi.org',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api\/news/, '/v2'),
        configure: (proxy) => {
          // Attach API key from environment to outgoing proxied requests
          proxy.on('proxyReq', (proxyReq, req, res) => {
            const key = process.env.VITE_NEWS_API_KEY || process.env.NEWS_API_KEY;
            if (key) {
              proxyReq.setHeader('X-Api-Key', key);
              try {
                // Also append apiKey as a query param to be compatible with NewsAPI
                const sep = proxyReq.path && proxyReq.path.includes('?') ? '&' : '?';
                proxyReq.path = `${proxyReq.path || ''}${sep}apiKey=${encodeURIComponent(key)}`;
              } catch (e) {
                // ignore if we cannot modify path
              }
            }
          });
        },
      },
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
