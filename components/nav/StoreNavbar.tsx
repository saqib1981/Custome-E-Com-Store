'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ChevronDown, Menu, Search, ShoppingBag, User } from 'lucide-react'
import StoreBrandMark from '@/components/StoreBrandMark'
import StoreNavLink from '@/components/nav/StoreNavLink'
import { useStoreTheme } from '@/context/StoreThemeContext'
import type { LogoFaviconConfig } from '@/lib/logo-favicon'
import type { PreviewViewport } from '@/lib/preview-viewport'
import { isPreviewCompactActions, isPreviewDesktopLayout } from '@/lib/preview-viewport'
import { isStoreNavActive, type StoreNavItem } from '@/lib/shopify-menu'

type StoreNavbarProps = {
  onOpenMenu?: () => void
  cartCount?: number
  previewViewport?: PreviewViewport
  previewPath?: string
  onPreviewNavigate?: (path: string) => void
  logoFaviconOverride?: LogoFaviconConfig
  menuOverride?: StoreNavItem[]
}

const iconButtonClass =
  'inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-gray-800 transition-colors hover:bg-gray-100 hover:text-primary-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:text-gray-200 dark:hover:bg-gray-800 dark:hover:text-primary-400'

const navLinkClass = (active: boolean) =>
  `relative inline-flex min-h-[50px] items-center px-4 py-2.5 text-sm font-medium tracking-wide transition-colors ${
    active
      ? 'text-primary-600 dark:text-primary-400 after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:rounded-full after:bg-primary-600 dark:after:bg-primary-400'
      : 'text-gray-800 hover:text-primary-600 dark:text-gray-200 dark:hover:text-primary-400'
  }`

function NavAnchor({
  item,
  active,
  className,
  previewMode,
  onPreviewNavigate,
}: {
  item: StoreNavItem
  active: boolean
  className?: string
  previewMode?: boolean
  onPreviewNavigate?: (path: string) => void
}) {
  const classes = `${navLinkClass(active)} ${className ?? ''}`

  return (
    <StoreNavLink
      href={item.href}
      external={item.external}
      previewMode={previewMode}
      onPreviewNavigate={onPreviewNavigate}
      className={classes}
      aria-current={active ? 'page' : undefined}
    >
      {item.title}
    </StoreNavLink>
  )
}

function DesktopNavItem({
  item,
  pathname,
  previewMode,
  onPreviewNavigate,
}: {
  item: StoreNavItem
  pathname: string
  previewMode?: boolean
  onPreviewNavigate?: (path: string) => void
}) {
  const active = isStoreNavActive(pathname, item)
  const hasChildren = item.items.length > 0

  if (!hasChildren) {
    return (
      <li>
        <NavAnchor
          item={item}
          active={active}
          previewMode={previewMode}
          onPreviewNavigate={onPreviewNavigate}
        />
      </li>
    )
  }

  return (
    <li className="group relative">
      <div className="inline-flex items-center">
        <NavAnchor
          item={item}
          active={active}
          previewMode={previewMode}
          onPreviewNavigate={onPreviewNavigate}
        />
        <ChevronDown className="-ml-2 mr-1 h-3.5 w-3.5 text-gray-500 transition-transform group-hover:rotate-180" aria-hidden />
      </div>
      <ul className="invisible absolute left-0 top-full z-40 min-w-[200px] translate-y-1 rounded-md border border-gray-200 bg-white py-1 opacity-0 shadow-lg transition-all group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100 dark:border-gray-700 dark:bg-gray-900">
        {item.items.map((child) => (
          <li key={child.id}>
            <NavAnchor
              item={child}
              active={isStoreNavActive(pathname, child)}
              className="min-h-0 w-full px-4 py-2.5 after:hidden"
              previewMode={previewMode}
              onPreviewNavigate={onPreviewNavigate}
            />
          </li>
        ))}
      </ul>
    </li>
  )
}

export default function StoreNavbar({
  onOpenMenu,
  cartCount = 0,
  previewViewport,
  previewPath = '/',
  onPreviewNavigate,
  logoFaviconOverride,
  menuOverride,
}: StoreNavbarProps) {
  const pathname = usePathname()
  const inPreview = previewViewport !== undefined
  const activePath = inPreview ? previewPath : pathname
  const { storeName, logoFavicon: themeLogoFavicon, mainMenu } = useStoreTheme()
  const logoFavicon = logoFaviconOverride ?? themeLogoFavicon
  const menuItems = menuOverride ?? mainMenu
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

  return (
    <header className="sticky top-0 z-30 shrink-0 border-b border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className={`mx-auto flex max-w-[1400px] items-center justify-between gap-3 px-4 sm:px-6 ${topRowClass}`}>
        <div className={`flex min-w-0 flex-1 items-center gap-2 ${inPreview ? (previewDesktop ? 'lg:flex-none' : '') : 'lg:flex-none'}`}>
          <button
            type="button"
            onClick={onOpenMenu}
            className={`${iconButtonClass} -ml-2 ${menuButtonClass}`}
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
            {!logoUrl.trim() ? (
              <span className="truncate text-base font-bold text-gray-900 dark:text-gray-100">{storeName}</span>
            ) : null}
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

      <nav
        className={`${desktopNavClass} border-t border-gray-100 dark:border-gray-800`}
        aria-label="Main navigation"
      >
        <ul className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-center gap-x-0 px-4 sm:px-6">
          {menuItems.map((item) => (
            <DesktopNavItem
              key={item.id}
              item={item}
              pathname={activePath}
              previewMode={inPreview}
              onPreviewNavigate={onPreviewNavigate}
            />
          ))}
        </ul>
      </nav>
    </header>
  )
}
