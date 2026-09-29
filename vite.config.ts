import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import basicSsl from '@vitejs/plugin-basic-ssl'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    basicSsl()
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) {
            return;
          }

          if (id.includes("agora-rtc-sdk-ng") || id.includes("agora-rtm-sdk")) {
            return "agora-vendor";
          }

          if (id.includes("react-pdf") || id.includes("pdfjs-dist")) {
            return "pdf-vendor";
          }

          if (id.includes("socket.io-client")) {
            return "socket-vendor";
          }

          if (id.includes("recharts")) {
            return "charts-vendor";
          }

          if (id.includes("react-router-dom")) {
            return "router-vendor";
          }

          if (id.includes("react-dom") || id.includes("/react/")) {
            return "react-vendor";
          }
        },
      },
    },
  },
  server: {
    https: {},
    host: true, // Allow access from network (useful for testing on other devices)
  }
})
