import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import dts from 'vite-plugin-dts'

const path = require("path");

export default defineConfig({
    build: {
        lib: {
            entry: path.resolve(__dirname, 'src/main.ts'),
            name: '@assureddt/pact-vue-grid',
            fileName: (format) => `pact-vue-grid.${format}.js`
        }
    },
    plugins: [vue(), dts()],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src")
        }
    },
    rollupOptions: {
        // make sure to externalize deps that shouldn't be bundled
        // into your library
        external: ['vue'],
        output: {
            // Provide global variables to use in the UMD build
            // for externalized deps
            globals: {
                vue: 'Vue'
            }
        }
    }
});
