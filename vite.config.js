import { defineConfig } from "vite";

// On GitHub Pages this deploys to https://<user>.github.io/android-resume/,
// so built asset URLs must be prefixed with the repo name. The Pages workflow
// sets BASE_PATH; the dev server keeps serving from the root.
export default defineConfig(({ command }) => ({
  base: command === "build" ? process.env.BASE_PATH || "/android-resume/" : "/",
  server: {
    host: "0.0.0.0",
    port: 8080,
    strictPort: true,
    allowedHosts: [process.env.RAILWAY_PUBLIC_DOMAIN].filter(Boolean),
    hmr: process.env.RAILWAY_PUBLIC_DOMAIN
      ? { protocol: "wss", host: process.env.RAILWAY_PUBLIC_DOMAIN, clientPort: 443 }
      : undefined,
  },
}));
