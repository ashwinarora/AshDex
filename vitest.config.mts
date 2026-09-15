import { defineConfig } from 'vitest/config'
import { fileURLToPath } from 'node:url'

const svgStub = fileURLToPath(new URL('./test/stubs/svg.ts', import.meta.url))

export default defineConfig({
  resolve: {
    // Use Vite's native tsconfig paths resolution (Vite 6+ / Vitest 5+),
    // no plugin needed.
    tsconfigPaths: true
  },
  plugins: [
    {
      // Stub SVG imports so pure-logic modules that transitively import asset
      // URLs (e.g. src/utils/constants.ts) can be evaluated by Vitest.
      // Runs at `resolveId` so it intercepts before tsconfig-paths tries to
      // resolve to a real .svg file on disk.
      name: 'stub-svg-imports',
      enforce: 'pre',
      resolveId(id) {
        if (id.endsWith('.svg')) return svgStub
        return null
      }
    }
  ],
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts']
  }
})
