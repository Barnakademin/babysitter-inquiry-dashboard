import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
    proxy: {
      "/client/api": {
        target: "https://solidumsverige.by",
        changeOrigin: true,
        secure: false,
      },
      "/json": {
        target: "https://solidumsverige.by",
        changeOrigin: true,
        secure: false,
      },
      "/action": {
        target: "https://solidumsverige.by",
        changeOrigin: true,
        secure: false,
      },
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "dist",
    assetsDir: ".",
    minify: 'esbuild',
    rollupOptions: {
      output: {
        entryFileNames: `index.js`,
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.endsWith(".css")) {
            return "index.css";
          }
          return assetInfo.name || "asset-[hash]";
        },
        chunkFileNames: `chunk-[name].js`,
      },
    },
    target: 'esnext',
    modulePreload: false,
  },
}));
