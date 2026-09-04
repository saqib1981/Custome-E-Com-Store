'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ChevronDown, ChevronRight, X } from 'lucide-react'
import StoreBrandMark from '@/components/StoreBrandMark'
import StoreNavLink from '@/components/nav/StoreNavLink'
import { useStoreTheme } from '@/context/StoreThemeContext'
import type { LogoFaviconConfig } from '@/lib/logo-favicon'
import { isStoreNavActive, type StoreNavItem } from '@/lib/shopify-menu'

type SidebarProps = {
  open?: boolean
  onClose?: () => void
  /** Render inside a preview frame instead of the full viewport. */
  contained?: boolean
  previewPath?: string
  onPreviewNavigate?: (path: string) => void
  menuOverride?: StoreNavItem[]
  logoFaviconOverride?: LogoFaviconConfig
}

function MobileNavItem({
  item,
  pathname,
  onClose,
  previewMode,
  onPreviewNavigate,
  depth = 0,
}: {
  item: StoreNavItem
  pathname: string
  onClose?: () => void
  previewMode?: boolean
  onPreviewNavigate?: (path: string) => void
  depth?: number
}) {
  const [expanded, setExpanded] = useState(false)
  const active = isStoreNavActive(pathname, item)
  const hasChildren = item.items.length > 0
  const paddingLeft = 24 + depth * 16

  const rowClass = `flex items-center justify-between py-3 text-gray-700 transition-colors hover:bg-primary-50 hover:text-primary-600 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-primary-400 ${
    active
      ? 'bg-primary-50 text-primary-600 dark:bg-gray-700 dark:text-primary-400 border-r-4 border-primary-600'
      : ''
  }`

  const linkContent = (
    <span className="font-medium truncate">{item.title}</span>
  )

  return (
    <li>
      <div className={rowClass} style={{ paddingLeft, paddingRight: 24 }}>
        <StoreNavLink
          href={item.href}
          external={item.external}
          previewMode={previewMode}
          onPreviewNavigate={onPreviewNavigate}
          onClick={onClose}
          className="flex flex-1 items-center min-w-0"
          aria-current={active ? 'page' : undefined}
        >
          {linkContent}
        </StoreNavLink>
        {hasChildren ? (
          <button
            type="button"
            onClick={() => setExpanded((prev) => !prev)}
            className="ml-2 rounded p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-600"
            aria-label={expanded ? 'Collapse submenu' : 'Expand submenu'}
          >
            {expanded ? (
              <ChevronDown className="h-4 w-4" aria-hidden />
            ) : (
              <ChevronRight className="h-4 w-4" aria-hidden />
            )}
          </button>
        ) : null}
      </div>
      {hasChildren && expanded ? (
        <ul>
          {item.items.map((child) => (
            <MobileNavItem
              key={child.id}
              item={child}
              pathname={pathname}
              onClose={onClose}
              previewMode={previewMode}
              onPreviewNavigate={onPreviewNavigate}
              depth={depth + 1}
            />
          ))}
        </ul>
      ) : null}
    </li>
  )
}

/** Off-canvas navigation drawer — Shopify main menu on mobile. */
export default function Sidebar({
  open = false,
  onClose,
  contained = false,
  previewPath = '/',
  onPreviewNavigate,
  menuOverride,
  logoFaviconOverride,
}: SidebarProps) {
  const pathname = usePathname()
  const activePath = contained ? previewPath : pathname
  const previewMode = contained
  const { storeName, logoFavicon: themeLogoFavicon, mainMenu } = useStoreTheme()

  const logoFavicon = logoFaviconOverride ?? themeLogoFavicon
  const menuItems = menuOverride ?? mainMenu
  const logoUrl = logoFavicon.logoUrl

  const panelClass = contained
    ? 'absolute inset-y-0 left-0 z-50 flex w-[min(18rem,85%)] flex-col bg-white shadow-xl dark:bg-gray-800'
    : 'fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col bg-white shadow-xl dark:bg-gray-800'

  const overlayClass = contained
    ? 'absolute inset-0 z-40 bg-black/50'
    : 'fixed inset-0 z-40 bg-black/50'

  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose?.()
    }
    document.addEventListener('keydown', onKeyDown)
    if (contained) {
      return () => document.removeEventListener('keydown', onKeyDown)
    }
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = prevOverflow
    }
  }, [open, onClose, contained])

  // Closed drawer must not stay mounted in admin preview — `-translate-x-full`
  // slides it into the editor chrome beside the device frame and looks "stuck open".
  if (!open) return null

  return (
    <>
      <div className={overlayClass} onClick={onClose} aria-hidden />
      <aside className={panelClass} aria-label="Main navigation">
        <div className="flex shrink-0 items-center justify-between gap-2 border-b border-gray-100 px-4 py-4 dark:border-gray-700">
          <StoreNavLink
            href="/"
            previewMode={previewMode}
            onPreviewNavigate={onPreviewNavigate}
            onClick={onClose}
            className="flex min-w-0 flex-1 items-center gap-2 rounded-md outline-none"
            aria-label="Go to home"
          >
            <StoreBrandMark
              storeName={storeName}
              logoUrl={logoUrl}
              logoWidth={logoFavicon.logoWidthMobile}
              size="sm"
            />
          </StoreNavLink>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-md p-1.5 text-gray-600 hover:bg-primary-50 hover:text-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-gray-300 dark:hover:bg-gray-700"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="mt-2 min-h-0 flex-1 overflow-y-auto overflow-x-hidden" aria-label="Sidebar menu">
          <ul className="space-y-0">
            {menuItems.map((item) => (
              <MobileNavItem
                key={item.id}
                item={item}
                pathname={activePath}
                onClose={onClose}
                previewMode={previewMode}
                onPreviewNavigate={onPreviewNavigate}
              />
            ))}
          </ul>
        </nav>
      </aside>
    </>
  )
}
