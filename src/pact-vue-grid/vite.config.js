import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import dts from 'vite-plugin-dts'

const path = require("path");

export default defineConfig({
    build: {
        sourcemap: true,
        lib: {
            entry: path.resolve(__dirname, 'src/main.ts'),
            name: '@assureddt/pact-vue-grid',
            fileName: (format) => `pact-vue-grid.${format}.js`
        },
        rollupOptions: {
            // essential: externalize deps that shouldn't be bundled in the library
            external: ['vue'],
            output: {
                // Provide global variables to use in the UMD build for externalized deps
                globals: {
                    vue: 'Vue'
                }
            }
        }
    },
    plugins: [vue(), dts()],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src")
        }
    }
});
