import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

const securityHeaders = {
  'Permissions-Policy': 'camera=(), geolocation=(), microphone=()',
  'Referrer-Policy': 'same-origin',
  'X-Content-Type-Options': 'nosniff',
}

export default defineConfig(({ mode }) => {
  const environment = loadEnv(mode, process.cwd(), '')
  const backendTarget = environment.VITE_DEV_API_TARGET ?? 'http://localhost:8080'

  return {
    plugins: [react(), tailwindcss()],
    server: {
      headers: securityHeaders,
      proxy: {
        '/api': backendTarget,
        '/login': backendTarget,
        '/logout': backendTarget,
        '/saml2': backendTarget,
      },
    },
    preview: {
      headers: securityHeaders,
    },
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: './src/test/setup.ts',
      css: true,
    },
  }
})
