import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      // Specify the entry point for your library
      entry: 'src/lib/index.ts',
      // Define the output formats for your library
      formats: ['es', 'cjs'] as const, // Use const assertion for enum-like values
    },
  },
})
