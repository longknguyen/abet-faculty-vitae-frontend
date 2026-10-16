import { resolveApiUrl } from '../../shared/http/apiFetch'

const NETBADGE_LOGIN_PATH = '/saml2/authenticate/netbadge'

export function netBadgeLoginUrl(): string {
  return resolveApiUrl(NETBADGE_LOGIN_PATH).toString()
}

export function startNetBadgeAuthentication(): void {
  globalThis.location.assign(netBadgeLoginUrl())
}
