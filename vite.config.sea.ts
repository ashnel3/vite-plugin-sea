import { defineConfig } from 'vite'
// plugins
import sea from './dist/index'

export default defineConfig({
  build: {
    outDir: './dist/sea',
  },
  plugins: [sea({ entry: './src/testing.ts', output: './dist/sea/testing.exe' })],
})
