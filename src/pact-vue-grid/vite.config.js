import {defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

const path = require("path");

export default defineConfig({
    build: {
        lib: {
            entry: path.resolve(__dirname, 'src/index.ts'),
            name: '@assureddt/pact-vue-grid',
            fileName: (format) => `pact-vue-grid.${format}.js`
        }
    },
    plugins: [vue()],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src")
        }
    }
});
