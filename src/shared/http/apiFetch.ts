import { ApiError } from './ApiError'

const XSRF_COOKIE_NAME = 'XSRF-TOKEN'
const XSRF_HEADER_NAME = 'X-XSRF-TOKEN'

function configuredApiBaseUrl(): URL {
  const configuredValue = import.meta.env.DEV
    ? import.meta.env.VITE_API_BASE_URL?.trim()
    : undefined
  const fallbackOrigin = globalThis.location.origin
  const baseUrl = new URL(configuredValue === '' ? fallbackOrigin : configuredValue ?? fallbackOrigin)

  if (baseUrl.username !== '' || baseUrl.password !== '') {
    throw new Error('The API base URL must not contain credentials')
  }

  const isLocalDevelopment =
    import.meta.env.DEV && ['localhost', '127.0.0.1'].includes(baseUrl.hostname)

  if (baseUrl.protocol !== 'https:' && !(isLocalDevelopment && baseUrl.protocol === 'http:')) {
    throw new Error('The API base URL must use HTTPS outside local development')
  }

  return baseUrl
}

function readCookie(name: string): string | undefined {
  const prefix = `${encodeURIComponent(name)}=`

  return document.cookie
    .split(';')
    .map((entry) => entry.trim())
    .find((entry) => entry.startsWith(prefix))
    ?.slice(prefix.length)
}

export function resolveApiUrl(path: string): URL {
  if (!path.startsWith('/')) {
    throw new Error('API request paths must be root-relative')
  }

  return new URL(path, configuredApiBaseUrl())
}

export async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const method = init.method?.toUpperCase() ?? 'GET'
  const headers = new Headers(init.headers)
  headers.set('Accept', 'application/json')

  if (!['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    const csrfToken = readCookie(XSRF_COOKIE_NAME)
    if (csrfToken === undefined || csrfToken === '') {
      throw new ApiError('The security token is missing. Refresh the page and try again.', 403)
    }
    headers.set(XSRF_HEADER_NAME, decodeURIComponent(csrfToken))
  }

  let response: Response
  try {
    response = await fetch(resolveApiUrl(path), {
      ...init,
      credentials: 'include',
      headers,
      redirect: 'follow',
    })
  } catch (error) {
    throw new ApiError('The server could not be reached.', 0, { cause: error })
  }

  if (!response.ok) {
    throw new ApiError('The server could not complete the request.', response.status)
  }

  return response
}
