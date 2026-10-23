import { resolveApiUrl } from '../../shared/http/apiFetch'

const NETBADGE_LOGIN_PATH = '/saml2/authenticate/netbadge'
const WORKSPACE_LOADING_HINT_KEY = 'vitae.workspace-loading'

export function shouldShowWorkspaceLoading(): boolean {
  try {
    return globalThis.sessionStorage.getItem(WORKSPACE_LOADING_HINT_KEY) === 'true'
  } catch {
    return false
  }
}

export function rememberWorkspaceLoading(): void {
  try {
    globalThis.sessionStorage.setItem(WORKSPACE_LOADING_HINT_KEY, 'true')
  } catch {
    // Storage can be unavailable in privacy-restricted browser contexts.
  }
}

export function netBadgeLoginUrl(): string {
  return resolveApiUrl(NETBADGE_LOGIN_PATH).toString()
}

export function startNetBadgeAuthentication(): void {
  rememberWorkspaceLoading()
  globalThis.location.assign(netBadgeLoginUrl())
}
