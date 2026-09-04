'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
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
  buildMenuCacheKey,
  clearCachedMainMenu,
  mainMenusEqual,
  MENU_BACKGROUND_REFRESH_MS,
  readCachedMainMenu,
  STORE_MENU_REFRESH_EVENT,
  writeCachedMainMenu,
} from '@/lib/store-menu-client'
import {
  STORE_THEME_REFRESH_EVENT,
  type StoreThemeRefreshDetail,
} from '@/lib/store-theme-client'
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
  const res = await fetch('/api/store/menu', { cache: 'no-store' })
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
  const menuCacheKeyRef = useRef('default')

  const applyMenuItems = useCallback((items: StoreNavItem[], menuKey: string) => {
    setMainMenu((prev) => {
      if (mainMenusEqual(prev, items)) return prev
      writeCachedMainMenu(items, menuKey)
      menuCacheKeyRef.current = menuKey
      return items
    })
  }, [])

  const refreshMenu = useCallback(
    async (mode: 'initial' | 'background' | 'force', menuKey: string) => {
      if (menuRefreshInFlight.current && mode === 'background') return
      menuRefreshInFlight.current = true
      try {
        const items = await fetchMainMenuFromApi()
        if (items) {
          applyMenuItems(items, menuKey)
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
        if (cancelled) return
        setHeaderNav(data)

        const menuKey = buildMenuCacheKey(data.menuId, data.menuHandle)
        menuCacheKeyRef.current = menuKey

        const cached = readCachedMainMenu(menuKey)
        if (cached) {
          hadCachedMenu.current = true
          setMainMenu(cached)
          setMenuLoading(false)
          void refreshMenu('background', menuKey)
        } else {
          hadCachedMenu.current = false
          void refreshMenu('initial', menuKey)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setHeaderNav(DEFAULT_HEADER_NAV_SETTINGS)
          void refreshMenu('initial', 'default')
        }
      })

    const intervalId = window.setInterval(() => {
      void refreshMenu('background', menuCacheKeyRef.current)
    }, MENU_BACKGROUND_REFRESH_MS)

    return () => {
      cancelled = true
      window.clearInterval(intervalId)
    }
  }, [refreshMenu])

  useEffect(() => {
    const onThemeRefresh = (event: Event) => {
      const detail = (event as CustomEvent<StoreThemeRefreshDetail>).detail ?? {}
      const keys = detail.keys
      const refreshLogo = !keys || keys.includes('logo-favicon')
      const refreshGeneral = !keys || keys.includes('general')
      const refreshHeader = !keys || keys.includes('header-nav')

      if (refreshLogo) {
        void fetch('/api/admin/logo-favicon', { cache: 'no-store' })
          .then((res) => (res.ok ? res.json() : null))
          .then((data: LogoFaviconConfig | null) => {
            if (data) setLogoFavicon(data)
          })
          .catch(() => {})
      }

      if (refreshGeneral) {
        void fetch('/api/admin/general-settings', { cache: 'no-store' })
          .then((res) => (res.ok ? res.json() : null))
          .then((data: GeneralSettingsConfig | null) => {
            if (data) setGeneralSettings(data)
          })
          .catch(() => {})
      }

      if (refreshHeader) {
        void fetch('/api/admin/header-settings', { cache: 'no-store' })
          .then((res) => (res.ok ? res.json() : null))
          .then((data: HeaderNavSettingsConfig | null) => {
            if (data) setHeaderNav(data)
          })
          .catch(() => {})
      }
    }

    window.addEventListener(STORE_THEME_REFRESH_EVENT, onThemeRefresh)
    return () => window.removeEventListener(STORE_THEME_REFRESH_EVENT, onThemeRefresh)
  }, [])

  useEffect(() => {
    const refreshFromShopify = () => {
      clearCachedMainMenu()
      void refreshMenu('force', menuCacheKeyRef.current)
    }

    window.addEventListener('focus', refreshFromShopify)
    const onVisibility = () => {
      if (document.visibilityState === 'visible') refreshFromShopify()
    }
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      window.removeEventListener('focus', refreshFromShopify)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [refreshMenu])

  useEffect(() => {
    const onRefresh = (event: Event) => {
      const detail = (event as CustomEvent<{ menuKey?: string; menuId?: string; menuHandle?: string }>)
        .detail

      void fetch('/api/admin/header-settings', { cache: 'no-store' })
        .then((res) => (res.ok ? res.json() : DEFAULT_HEADER_NAV_SETTINGS))
        .then((data: HeaderNavSettingsConfig) => {
          setHeaderNav(data)
          menuCacheKeyRef.current =
            detail?.menuKey ?? buildMenuCacheKey(data.menuId, data.menuHandle)
          clearCachedMainMenu()
          hadCachedMenu.current = false
          void refreshMenu('initial', menuCacheKeyRef.current)
        })
        .catch(() => {
          if (detail?.menuKey) menuCacheKeyRef.current = detail.menuKey
          else if (detail) {
            menuCacheKeyRef.current = buildMenuCacheKey(detail.menuId ?? '', detail.menuHandle ?? '')
          }
          clearCachedMainMenu()
          hadCachedMenu.current = false
          void refreshMenu('initial', menuCacheKeyRef.current)
        })
    }

    window.addEventListener(STORE_MENU_REFRESH_EVENT, onRefresh)
    return () => window.removeEventListener(STORE_MENU_REFRESH_EVENT, onRefresh)
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
