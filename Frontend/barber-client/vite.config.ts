import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
    restoreMocks: true,
    clearMocks: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: [
        'src/schemas/**/*.ts',
        'src/components/booking/**/*.tsx',
        'src/routes/**/*.tsx',
        'src/services/axioClient.ts',
        'src/utils/businessTime.ts',
      ],
      exclude: ['**/__tests__/**'],
    },
  },
})
