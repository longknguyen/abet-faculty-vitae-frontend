import { Moon, Sun } from 'lucide-react'
import { useState } from 'react'

import { saveTheme, type ThemeName } from './theme'

function appliedTheme(): ThemeName {
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light'
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<ThemeName>(appliedTheme)
  const nextTheme: ThemeName = theme === 'dark' ? 'light' : 'dark'

  return (
    <button
      type="button"
      className="grid size-11 place-items-center rounded-full text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10"
      aria-label={`Switch to ${nextTheme} theme`}
      onClick={() => {
        saveTheme(nextTheme)
        setTheme(nextTheme)
      }}
    >
      {theme === 'dark' ? <Sun aria-hidden="true" size={18} /> : <Moon aria-hidden="true" size={18} />}
    </button>
  )
}
