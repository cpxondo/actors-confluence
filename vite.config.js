/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
    plugins: [
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
            manifest: {
                name: "Actors confluence",
                short_name: 'Confluence',
                description: 'Check where actors have worked together.',
                theme_color: '#1f2937',
                background_color: '#111827',
                display: 'standalone',
                icons: [
                    { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
                    { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' }
                ]
            }
        })
    ],
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: './src/setupTests.js',
    }
})
