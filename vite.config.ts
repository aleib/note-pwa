import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    // Note: we keep PWA setup minimal and predictable. We'll expand behavior later as needed.
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icons/icon.svg"],
      // Intent: offline-first app shell for a client-routed SPA.
      workbox: {
        navigateFallback: "/index.html"
      },
      manifest: {
        name: "note-pwa",
        short_name: "note",
        theme_color: "#0b1220",
        background_color: "#0b1220",
        display: "standalone",
        start_url: "/",
        icons: [
          {
            src: "icons/icon.svg",
            sizes: "512x512",
            type: "image/svg+xml"
          }
        ]
      }
    })
  ]
});


