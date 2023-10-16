import { defineConfig } from "vite";
//@ts-ignore
import mkcert from "vite-plugin-mkcert";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [mkcert()],
    build: {
        target: "esnext"
    },
    base: "360-video"
});
