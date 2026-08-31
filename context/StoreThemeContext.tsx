'use client'

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { DEFAULT_LOGO_FAVICON, type LogoFaviconConfig } from '@/lib/logo-favicon'
import { FALLBACK_MAIN_MENU, type StoreNavItem } from '@/lib/shopify-menu'
import { DEFAULT_STORE_PROFILE } from '@/lib/storeProfile'

type StoreThemeContextValue = {
  loading: boolean
  logoFavicon: LogoFaviconConfig
  storeName: string
  mainMenu: StoreNavItem[]
  menuLoading: boolean
}

const StoreThemeContext = createContext<StoreThemeContextValue>({
  loading: true,
  logoFavicon: DEFAULT_LOGO_FAVICON,
  storeName: DEFAULT_STORE_PROFILE.storeName,
  mainMenu: FALLBACK_MAIN_MENU,
  menuLoading: true,
})

export function StoreThemeProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true)
  const [logoFavicon, setLogoFavicon] = useState<LogoFaviconConfig>(DEFAULT_LOGO_FAVICON)
  const [menuLoading, setMenuLoading] = useState(true)
  const [mainMenu, setMainMenu] = useState<StoreNavItem[]>(FALLBACK_MAIN_MENU)

  useEffect(() => {
    let cancelled = false

    const loadTheme = () => {
      void fetch('/api/admin/logo-favicon', { cache: 'no-store' })
        .then((res) => (res.ok ? res.json() : DEFAULT_LOGO_FAVICON))
        .then((data: LogoFaviconConfig) => {
          if (!cancelled) setLogoFavicon(data)
        })
        .catch(() => {
          if (!cancelled) setLogoFavicon(DEFAULT_LOGO_FAVICON)
        })
        .finally(() => {
          if (!cancelled) setLoading(false)
        })
    }

    const loadMenu = () => {
      void fetch('/api/store/menu', { cache: 'no-store' })
        .then((res) => (res.ok ? res.json() : { items: FALLBACK_MAIN_MENU }))
        .then((data: { items: StoreNavItem[] }) => {
          if (!cancelled && Array.isArray(data.items) && data.items.length) {
            setMainMenu(data.items)
          }
        })
        .catch(() => {
          if (!cancelled) setMainMenu(FALLBACK_MAIN_MENU)
        })
        .finally(() => {
          if (!cancelled) setMenuLoading(false)
        })
    }

    loadTheme()
    loadMenu()

    const onFocus = () => {
      loadTheme()
      loadMenu()
    }
    window.addEventListener('focus', onFocus)
    return () => {
      cancelled = true
      window.removeEventListener('focus', onFocus)
    }
  }, [])

  const value = useMemo<StoreThemeContextValue>(
    () => ({
      loading,
      logoFavicon,
      storeName: DEFAULT_STORE_PROFILE.storeName,
      mainMenu,
      menuLoading,
    }),
    [loading, logoFavicon, mainMenu, menuLoading]
  )

  return <StoreThemeContext.Provider value={value}>{children}</StoreThemeContext.Provider>
}

export function useStoreTheme() {
  return useContext(StoreThemeContext)
}
