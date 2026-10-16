import { routes, type VercelConfig } from '@vercel/config/v1'

function requiredBackendOrigin(value: string | undefined): string {
  if (value === undefined || value.trim() === '') {
    throw new Error('BACKEND_ORIGIN must be configured in Vercel')
  }

  const origin = new URL(value)
  if (
    origin.protocol !== 'https:' ||
    origin.username !== '' ||
    origin.password !== '' ||
    origin.pathname !== '/' ||
    origin.search !== '' ||
    origin.hash !== ''
  ) {
    throw new Error('BACKEND_ORIGIN must be an HTTPS origin without a path or credentials')
  }

  return origin.origin
}

const backendOrigin = requiredBackendOrigin(process.env.BACKEND_ORIGIN)

export const config: VercelConfig = {
  rewrites: [
    routes.rewrite('/api/:path*', `${backendOrigin}/api/:path*`),
    routes.rewrite('/login/saml2/:path*', `${backendOrigin}/login/saml2/:path*`),
    routes.rewrite('/saml2/:path*', `${backendOrigin}/saml2/:path*`),
  ],
}
