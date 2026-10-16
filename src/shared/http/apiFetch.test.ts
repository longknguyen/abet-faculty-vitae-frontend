import { afterEach, describe, expect, it, vi } from 'vitest'

import { apiFetch } from './apiFetch'

afterEach(() => {
  document.cookie = 'XSRF-TOKEN=; Max-Age=0; Path=/'
  vi.unstubAllGlobals()
})

describe('apiFetch', () => {
  it('does not send a state-changing request without a CSRF token', async () => {
    const fetchMock = vi.fn<typeof fetch>()
    vi.stubGlobal('fetch', fetchMock)

    await expect(apiFetch('/api/v1/test', { method: 'POST' })).rejects.toMatchObject({
      status: 403,
    })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('sends authenticated requests with the CSRF header', async () => {
    document.cookie = 'XSRF-TOKEN=csrf-token; Path=/'
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response('{}', { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)

    await apiFetch('/api/v1/test', { method: 'POST' })

    expect(fetchMock).toHaveBeenCalledOnce()
    const requestInit = fetchMock.mock.calls[0]?.[1]
    expect(requestInit?.credentials).toBe('include')
    expect(new Headers(requestInit?.headers).get('X-XSRF-TOKEN')).toBe('csrf-token')
  })
})
