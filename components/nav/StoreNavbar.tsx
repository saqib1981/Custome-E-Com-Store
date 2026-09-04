'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Menu, Search, ShoppingBag, User } from 'lucide-react'
import StoreBrandMark from '@/components/StoreBrandMark'
import DesktopStoreNav from '@/components/nav/DesktopStoreNav'
import StoreNavLink from '@/components/nav/StoreNavLink'
import { useStoreTheme } from '@/context/StoreThemeContext'
import type { HeaderNavSettingsConfig } from '@/lib/header-settings'
import type { LogoFaviconConfig } from '@/lib/logo-favicon'
import type { PreviewViewport } from '@/lib/preview-viewport'
import { isPreviewCompactActions, isPreviewDesktopLayout } from '@/lib/preview-viewport'
import type { StoreNavItem } from '@/lib/shopify-menu'

type StoreNavbarProps = {
  onOpenMenu?: () => void
  cartCount?: number
  previewViewport?: PreviewViewport
  previewPath?: string
  onPreviewNavigate?: (path: string) => void
  logoFaviconOverride?: LogoFaviconConfig
  menuOverride?: StoreNavItem[]
  headerNavOverride?: HeaderNavSettingsConfig
}

const iconButtonClass =
  'inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-gray-800 transition-colors hover:bg-gray-100 hover:text-primary-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:text-gray-200 dark:hover:bg-gray-800 dark:hover:text-primary-400'

export default function StoreNavbar({
  onOpenMenu,
  cartCount = 0,
  previewViewport,
  previewPath = '/',
  onPreviewNavigate,
  logoFaviconOverride,
  menuOverride,
  headerNavOverride,
}: StoreNavbarProps) {
  const pathname = usePathname()
  const inPreview = previewViewport !== undefined
  const activePath = inPreview ? previewPath : pathname
  const { storeName, logoFavicon: themeLogoFavicon, mainMenu, headerNav: themeHeaderNav } =
    useStoreTheme()
  const logoFavicon = logoFaviconOverride ?? themeLogoFavicon
  const menuItems = menuOverride ?? mainMenu
  const headerNav = headerNavOverride ?? themeHeaderNav
  const logoUrl = logoFavicon.logoUrl

  const [responsiveLogoWidth, setResponsiveLogoWidth] = useState(logoFavicon.logoWidthDesktop)

  useEffect(() => {
    if (previewViewport) return
    const mq = window.matchMedia('(min-width: 1024px)')
    const update = () => {
      setResponsiveLogoWidth(
        mq.matches ? logoFavicon.logoWidthDesktop : logoFavicon.logoWidthMobile
      )
    }
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [logoFavicon.logoWidthDesktop, logoFavicon.logoWidthMobile, previewViewport])

  const previewDesktop = isPreviewDesktopLayout(previewViewport)
  const logoWidth = previewViewport
    ? previewDesktop
      ? logoFavicon.logoWidthDesktop
      : logoFavicon.logoWidthMobile
    : responsiveLogoWidth
  const previewCompact = isPreviewCompactActions(previewViewport)

  const menuButtonClass = inPreview
    ? previewDesktop
      ? 'hidden'
      : 'inline-flex'
    : 'lg:hidden'

  const desktopNavClass = inPreview
    ? previewDesktop
      ? 'block'
      : 'hidden'
    : 'hidden lg:block'

  const accountButtonClass = inPreview
    ? previewCompact
      ? 'hidden'
      : 'inline-flex'
    : 'hidden sm:inline-flex'

  const topRowClass = inPreview
    ? previewDesktop
      ? 'h-[60px]'
      : 'h-14'
    : 'h-14 lg:h-[60px]'

  const headerBottomBorderClass = inPreview
    ? previewDesktop
      ? ''
      : 'border-b border-gray-200 dark:border-gray-800'
    : 'border-b border-gray-200 lg:border-b-0 dark:border-gray-800'

  return (
    <header className={`sticky top-0 z-30 max-w-full shrink-0 overflow-x-clip bg-white shadow-sm dark:bg-gray-900 ${headerBottomBorderClass}`}>
      <div className={`mx-auto flex max-w-[1400px] items-center justify-between gap-3 px-4 sm:px-6 ${topRowClass}`}>
        <div className={`flex min-w-0 flex-1 items-center gap-2 ${inPreview ? (previewDesktop ? 'lg:flex-none' : '') : 'lg:flex-none'}`}>
          <button
            type="button"
            onClick={onOpenMenu}
            className={`${iconButtonClass} ${inPreview ? '' : '-ml-2'} ${menuButtonClass}`}
            aria-label="Open menu"
          >
            <Menu className="h-[22px] w-[22px]" strokeWidth={1.75} />
          </button>

          <StoreNavLink
            href="/"
            previewMode={inPreview}
            onPreviewNavigate={onPreviewNavigate}
            className="inline-flex min-w-0 items-center gap-2.5 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
            aria-label={`${storeName} home`}
            style={{ maxWidth: logoWidth + 40 }}
          >
            <StoreBrandMark storeName={storeName} logoUrl={logoUrl} logoWidth={logoWidth} size="sm" />
          </StoreNavLink>
        </div>

        <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
          <button type="button" className={iconButtonClass} aria-label="Search">
            <Search className="h-[17px] w-[17px]" strokeWidth={2} />
          </button>
          <button type="button" className={`${iconButtonClass} ${accountButtonClass}`} aria-label="Account">
            <User className="h-4 w-4" strokeWidth={2} />
          </button>
          <StoreNavLink
            href="/cart"
            previewMode={inPreview}
            onPreviewNavigate={onPreviewNavigate}
            className={`${iconButtonClass} relative`}
            aria-label="Cart"
          >
            <ShoppingBag className="h-4 w-4" strokeWidth={2} />
            {cartCount > 0 ? (
              <span className="absolute right-2 top-2 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-primary-600 px-1 text-[10px] font-semibold leading-none text-white">
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            ) : null}
          </StoreNavLink>
        </div>
      </div>

      <DesktopStoreNav
        items={menuItems}
        pathname={activePath}
        previewMode={inPreview}
        onPreviewNavigate={onPreviewNavigate}
        className={desktopNavClass}
        navStyle={headerNav}
      />
    </header>
  )
}
