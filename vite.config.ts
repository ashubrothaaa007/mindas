import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

const publicUrl = process.env.MINDA_PUBLIC_URL
const base = publicUrl ? `${publicUrl.replace(/\/$/, '')}/` : '/'
const host = process.env.MINDA_DEV_SERVER_HOST || '0.0.0.0'

export default defineConfig(({ mode }) => {
  const developmentBuild = mode === 'development'

  return {
    base,
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    build: {
      sourcemap: developmentBuild ? 'inline' : false,
      minify: !developmentBuild,
    },
    server: {
      host,
      port: Number.parseInt(process.env.PORT || '8443', 10),
      strictPort: true,
    },
    preview: {
      host,
      port: Number.parseInt(process.env.PORT || '8443', 10),
    },
  }
})
