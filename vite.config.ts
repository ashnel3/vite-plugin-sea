import { defineConfig } from 'vite'
import type { SeaDefines } from './src/env'

// plugins
import dts from 'vite-plugin-dts'

export const defines = (): SeaDefines => {
  const { npm_package_version: VERSION = '0.0.0' } = process.env
  return {
    VERSION: JSON.stringify(VERSION),
  }
}

export default defineConfig({
  build: {
    lib: {
      entry: { index: './src/index.ts' },
      formats: ['cjs', 'es'],
    },
    rollupOptions: {
      output: { exports: 'named' },
    },
    ssr: true,
  },
  define: defines(),
  plugins: [dts({ tsconfigPath: './tsconfig.app.json' })],
  test: {
    include: ['./test/*.test.ts'],
  },
})
