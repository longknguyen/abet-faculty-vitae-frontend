export type ThemeName = 'dark' | 'light'

const storageKey = 'vitae-theme'

function storedTheme(): ThemeName | undefined {
  try {
    const value = window.localStorage.getItem(storageKey)
    return value === 'dark' || value === 'light' ? value : undefined
  } catch {
    return undefined
  }
}

function systemTheme(): ThemeName {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function applyTheme(theme: ThemeName): void {
  document.documentElement.classList.toggle('dark', theme === 'dark')
  document.documentElement.classList.toggle('light', theme === 'light')
}

export function initialiseTheme(): ThemeName {
  const theme = storedTheme() ?? systemTheme()
  applyTheme(theme)
  return theme
}

export function saveTheme(theme: ThemeName): void {
  try {
    window.localStorage.setItem(storageKey, theme)
  } catch {
    // A privacy-restricted browser can still use the theme for this page view.
  }
  applyTheme(theme)
}
