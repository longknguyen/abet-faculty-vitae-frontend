# Security policy

Please report suspected vulnerabilities privately to the project maintainers rather than opening a public issue. Include the affected route or component, reproduction steps and the potential impact, but do not include real faculty CVs, credentials or session cookies.

## Frontend security boundaries

- The browser never treats client-side file checks as authoritative. The backend must still enforce size and type limits, scan uploads and isolate document parsing.
- Authentication uses the backend's NetBadge session. Requests include the session cookie and state-changing requests require the backend-issued CSRF token.
- Values prefixed with `VITE_` are bundled into public JavaScript and must never contain secrets.
- Production should use HTTPS and same-origin frontend/API hosting where practical. If origins differ, allow only the exact frontend origin with credentials and do not use wildcard CORS.
- The hosting layer should apply a restrictive Content Security Policy, `X-Content-Type-Options: nosniff`, `Referrer-Policy: same-origin`, an appropriate `Permissions-Policy` and clickjacking protection.
Dependency updates, lockfile installation, linting, tests, production builds, dependency auditing and CodeQL analysis are automated in GitHub Actions.
