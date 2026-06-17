import { defineConfig } from "vite";

const apiTarget = "http://127.0.0.1:3001";

export default defineConfig({
  server: {
    host: "127.0.0.1",
    port: Number(process.env.PORT) || 5173,
    proxy: {
      "/admin": apiTarget,
      "/albums": apiTarget,
      "/auth": apiTarget,
      "/comments": apiTarget,
      "/photos": apiTarget,
      "/posts": apiTarget,
      "/todos": apiTarget
    }
  }
});
