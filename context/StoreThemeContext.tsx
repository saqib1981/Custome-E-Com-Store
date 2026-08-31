'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { DEFAULT_GENERAL_SETTINGS, type GeneralSettingsConfig } from '@/lib/general-settings'
import {
  DEFAULT_HEADER_NAV_SETTINGS,
  type HeaderNavSettingsConfig,
} from '@/lib/header-settings'
import { DEFAULT_LOGO_FAVICON, type LogoFaviconConfig } from '@/lib/logo-favicon'
import {
  mainMenusEqual,
  MENU_BACKGROUND_REFRESH_MS,
  readCachedMainMenu,
  writeCachedMainMenu,
} from '@/lib/store-menu-client'
import { FALLBACK_MAIN_MENU, type StoreNavItem } from '@/lib/shopify-menu'

type StoreThemeContextValue = {
  loading: boolean
  logoFavicon: LogoFaviconConfig
  generalSettings: GeneralSettingsConfig
  headerNav: HeaderNavSettingsConfig
  storeName: string
  mainMenu: StoreNavItem[]
  menuLoading: boolean
}

const StoreThemeContext = createContext<StoreThemeContextValue>({
  loading: true,
  logoFavicon: DEFAULT_LOGO_FAVICON,
  generalSettings: DEFAULT_GENERAL_SETTINGS,
  headerNav: DEFAULT_HEADER_NAV_SETTINGS,
  storeName: '',
  mainMenu: FALLBACK_MAIN_MENU,
  menuLoading: true,
})

async function fetchMainMenuFromApi(): Promise<StoreNavItem[] | null> {
  const res = await fetch('/api/store/menu')
  if (!res.ok) return null
  const data = (await res.json()) as { items?: StoreNavItem[] }
  if (!Array.isArray(data.items) || !data.items.length) return null
  return data.items
}

export function StoreThemeProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true)
  const [logoFavicon, setLogoFavicon] = useState<LogoFaviconConfig>(DEFAULT_LOGO_FAVICON)
  const [generalSettings, setGeneralSettings] =
    useState<GeneralSettingsConfig>(DEFAULT_GENERAL_SETTINGS)
  const [headerNav, setHeaderNav] = useState<HeaderNavSettingsConfig>(DEFAULT_HEADER_NAV_SETTINGS)
  const [menuLoading, setMenuLoading] = useState(true)
  const [mainMenu, setMainMenu] = useState<StoreNavItem[]>(FALLBACK_MAIN_MENU)
  const [storeName, setStoreName] = useState('')
  const menuRefreshInFlight = useRef(false)
  const hadCachedMenu = useRef(false)

  const applyMenuItems = useCallback((items: StoreNavItem[]) => {
    setMainMenu((prev) => {
      if (mainMenusEqual(prev, items)) return prev
      writeCachedMainMenu(items)
      return items
    })
  }, [])

  const refreshMenu = useCallback(
    async (mode: 'initial' | 'background') => {
      if (menuRefreshInFlight.current) return
      menuRefreshInFlight.current = true
      try {
        const items = await fetchMainMenuFromApi()
        if (items) {
          applyMenuItems(items)
        } else if (mode === 'initial' && !hadCachedMenu.current) {
          setMainMenu(FALLBACK_MAIN_MENU)
        }
      } catch {
        if (mode === 'initial' && !hadCachedMenu.current) {
          setMainMenu(FALLBACK_MAIN_MENU)
        }
      } finally {
        if (mode === 'initial') setMenuLoading(false)
        menuRefreshInFlight.current = false
      }
    },
    [applyMenuItems]
  )

  useLayoutEffect(() => {
    const cached = readCachedMainMenu()
    if (cached) {
      hadCachedMenu.current = true
      setMainMenu(cached)
      setMenuLoading(false)
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    void fetch('/api/admin/logo-favicon', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : DEFAULT_LOGO_FAVICON))
      .then((data: LogoFaviconConfig) => {
        if (!cancelled) setLogoFavicon(data)
      })
      .catch(() => {
        if (!cancelled) setLogoFavicon(DEFAULT_LOGO_FAVICON)
      })

    void fetch('/api/admin/general-settings', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : DEFAULT_GENERAL_SETTINGS))
      .then((data: GeneralSettingsConfig) => {
        if (!cancelled) setGeneralSettings(data)
      })
      .catch(() => {
        if (!cancelled) setGeneralSettings(DEFAULT_GENERAL_SETTINGS)
      })

    void fetch('/api/store/shop')
      .then((res) => (res.ok ? res.json() : { name: '' }))
      .then((data: { name?: string }) => {
        if (!cancelled) setStoreName(String(data.name ?? '').trim())
      })
      .catch(() => {
        if (!cancelled) setStoreName('')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    void fetch('/api/admin/header-settings', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : DEFAULT_HEADER_NAV_SETTINGS))
      .then((data: HeaderNavSettingsConfig) => {
        if (!cancelled) setHeaderNav(data)
      })
      .catch(() => {
        if (!cancelled) setHeaderNav(DEFAULT_HEADER_NAV_SETTINGS)
      })

    void refreshMenu(hadCachedMenu.current ? 'background' : 'initial')

    const intervalId = window.setInterval(() => {
      void refreshMenu('background')
    }, MENU_BACKGROUND_REFRESH_MS)

    return () => {
      cancelled = true
      window.clearInterval(intervalId)
    }
  }, [refreshMenu])

  const value = useMemo<StoreThemeContextValue>(
    () => ({
      loading,
      logoFavicon,
      generalSettings,
      headerNav,
      storeName,
      mainMenu,
      menuLoading,
    }),
    [loading, logoFavicon, generalSettings, headerNav, storeName, mainMenu, menuLoading]
  )

  return <StoreThemeContext.Provider value={value}>{children}</StoreThemeContext.Provider>
}

export function useStoreTheme() {
  return useContext(StoreThemeContext)
}
