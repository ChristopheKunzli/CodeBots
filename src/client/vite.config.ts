import {defineConfig} from "vite";

export default defineConfig({
    root: "src/client",
    server: {
        proxy: {
            "/api": "http://localhost:8080", // proxy API Hono en dev
        },
    },
    build: {
        rollupOptions: {
            input: {
                landing: "src/client/index.html",
                game: "src/client/game.html",
                doc: "src/client/doc.html",
                login: "src/client/login.html",
            },
        },
        outDir: "../../dist/client",
    },
})
