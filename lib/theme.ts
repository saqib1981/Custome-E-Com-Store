/** localStorage key for light/dark preference */
export const THEME_STORAGE_KEY = 'theme'

export type ThemePreference = 'light' | 'dark'

export function readStoredTheme(): ThemePreference | null {
  if (typeof window === 'undefined') return null
  try {
    const v = localStorage.getItem(THEME_STORAGE_KEY)
    return v === 'light' || v === 'dark' ? v : null
  } catch {
    return null
  }
}

export function getDefaultTheme(): ThemePreference {
  return 'dark'
}

export function applyThemePreference(theme: ThemePreference): void {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  if (theme === 'dark') root.classList.add('dark')
  else root.classList.remove('dark')
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme)
  } catch {
    // ignore
  }
}

export function getActiveThemePreference(): ThemePreference {
  if (typeof document === 'undefined') return getDefaultTheme()
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light'
}
