'use client'

import { ChevronDown, ChevronRight } from 'lucide-react'
import type { CSSProperties } from 'react'
import StoreNavLink from '@/components/nav/StoreNavLink'
import {
  DEFAULT_HEADER_NAV_SETTINGS,
  findMenuHighlight,
  headerNavSettingsToCssVars,
  menuHighlightToCssVars,
  type HeaderMenuItemHighlight,
  type HeaderNavSettingsConfig,
} from '@/lib/header-settings'
import { isStoreNavActive, type StoreNavItem } from '@/lib/shopify-menu'

type NavLinkProps = {
  item: StoreNavItem
  active: boolean
  className?: string
  previewMode?: boolean
  onPreviewNavigate?: (path: string) => void
  highlight?: HeaderMenuItemHighlight
}

function NavMenuLabel({
  title,
  highlight,
}: {
  title: string
  highlight?: HeaderMenuItemHighlight
}) {
  const badgeLabel = highlight?.badgeLabel.trim()

  if (!badgeLabel || !highlight) {
    return <span>{title}</span>
  }

  return (
    <span className="store-nav-menu-label">
      <span
        className="store-nav-menu-badge"
        style={{
          backgroundColor: highlight.badgeBackgroundColor,
          color: highlight.badgeTextColor,
          ['--badge-bg' as string]: highlight.badgeBackgroundColor,
        }}
      >
        {badgeLabel.toUpperCase()}
      </span>
      <span>{title}</span>
    </span>
  )
}

function NavAnchor({ item, active, className, previewMode, onPreviewNavigate, highlight }: NavLinkProps) {
  const featured = Boolean(highlight)
  const linkStyle = featured
    ? (menuHighlightToCssVars(highlight!) as CSSProperties)
    : undefined

  return (
    <StoreNavLink
      href={item.href}
      external={item.external}
      openInNewTab={highlight?.openInNewTab}
      previewMode={previewMode}
      onPreviewNavigate={onPreviewNavigate}
      className={`store-nav-menu-link ${featured ? 'store-nav-menu-link--featured' : ''} ${className ?? ''}`}
      style={linkStyle}
      aria-current={active ? 'page' : undefined}
      data-active={active ? 'true' : 'false'}
    >
      <NavMenuLabel title={item.title} highlight={highlight} />
    </StoreNavLink>
  )
}

function DropdownNavAnchor({
  item,
  active,
  className,
  previewMode,
  onPreviewNavigate,
}: NavLinkProps) {
  return (
    <StoreNavLink
      href={item.href}
      external={item.external}
      previewMode={previewMode}
      onPreviewNavigate={onPreviewNavigate}
      className={`store-nav-dropdown-link ${className ?? ''}`}
      aria-current={active ? 'page' : undefined}
      data-active={active ? 'true' : 'false'}
    >
      {item.title}
    </StoreNavLink>
  )
}

function blurFocusedDescendant(root: HTMLElement | null) {
  if (!root) return
  const active = document.activeElement
  if (active instanceof HTMLElement && root.contains(active)) {
    active.blur()
  }
}

function NestedDropdownItem({
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
        <DropdownNavAnchor
          item={item}
          active={active}
          className="block px-4 py-2.5 hover:bg-gray-50"
          previewMode={previewMode}
          onPreviewNavigate={onPreviewNavigate}
        />
      </li>
    )
  }

  return (
    <li className="group/sub relative" onMouseLeave={(e) => blurFocusedDescendant(e.currentTarget)}>
      <div className="flex items-center justify-between gap-3 px-4 py-2.5 hover:bg-gray-50">
        <DropdownNavAnchor
          item={item}
          active={active}
          className="min-w-0 flex-1 truncate"
          previewMode={previewMode}
          onPreviewNavigate={onPreviewNavigate}
        />
        <ChevronRight className="h-3.5 w-3.5 shrink-0 text-gray-400" aria-hidden />
      </div>
      <ul className="store-nav-flyout absolute left-full top-0 z-10 min-w-[13rem] border border-gray-200 bg-white py-1 shadow-lg">
        {item.items.map((child) => (
          <NestedDropdownItem
            key={child.id}
            item={child}
            pathname={pathname}
            previewMode={previewMode}
            onPreviewNavigate={onPreviewNavigate}
          />
        ))}
      </ul>
    </li>
  )
}

function DesktopNavDropdown({
  item,
  pathname,
  previewMode,
  onPreviewNavigate,
  highlight,
}: {
  item: StoreNavItem
  pathname: string
  previewMode?: boolean
  onPreviewNavigate?: (path: string) => void
  highlight?: HeaderMenuItemHighlight
}) {
  const active = isStoreNavActive(pathname, item)

  return (
    <li
      className="group/menu relative"
      onMouseLeave={(e) => blurFocusedDescendant(e.currentTarget)}
    >
      <div className="inline-flex items-center">
        <NavAnchor
          item={item}
          active={active}
          previewMode={previewMode}
          onPreviewNavigate={onPreviewNavigate}
          highlight={highlight}
        />
        <ChevronDown
          className="-ml-2 mr-1 h-3.5 w-3.5 text-gray-500 transition-transform group-hover/menu:rotate-180"
          aria-hidden
        />
      </div>

      <ul className="store-nav-flyout absolute left-0 top-full z-50 min-w-[13rem] border border-gray-200 bg-white py-1 shadow-lg">
        {item.items.map((child) => (
          <NestedDropdownItem
            key={child.id}
            item={child}
            pathname={pathname}
            previewMode={previewMode}
            onPreviewNavigate={onPreviewNavigate}
          />
        ))}
      </ul>
    </li>
  )
}

function DesktopNavItem({
  item,
  pathname,
  previewMode,
  onPreviewNavigate,
  menuHighlights,
}: {
  item: StoreNavItem
  pathname: string
  previewMode?: boolean
  onPreviewNavigate?: (path: string) => void
  menuHighlights: HeaderMenuItemHighlight[]
}) {
  const active = isStoreNavActive(pathname, item)
  const hasChildren = item.items.length > 0
  const highlight = findMenuHighlight(item.title, menuHighlights)

  if (!hasChildren) {
    return (
      <li>
        <NavAnchor
          item={item}
          active={active}
          previewMode={previewMode}
          onPreviewNavigate={onPreviewNavigate}
          highlight={highlight}
        />
      </li>
    )
  }

  return (
    <DesktopNavDropdown
      item={item}
      pathname={pathname}
      previewMode={previewMode}
      onPreviewNavigate={onPreviewNavigate}
      highlight={highlight}
    />
  )
}

type DesktopStoreNavProps = {
  items: StoreNavItem[]
  pathname: string
  previewMode?: boolean
  onPreviewNavigate?: (path: string) => void
  className?: string
  navStyle?: HeaderNavSettingsConfig
}

export default function DesktopStoreNav({
  items,
  pathname,
  previewMode,
  onPreviewNavigate,
  className = '',
  navStyle = DEFAULT_HEADER_NAV_SETTINGS,
}: DesktopStoreNavProps) {
  const cssVars = headerNavSettingsToCssVars(navStyle)

  return (
    <nav
      className={`relative border-t border-solid ${className}`}
      style={{
        ...cssVars,
        borderColor: navStyle.navBorderColor,
      }}
      aria-label="Main navigation"
    >
      <ul className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-center gap-x-0 px-4 sm:px-6">
        {items.map((item) => (
          <DesktopNavItem
            key={item.id}
            item={item}
            pathname={pathname}
            previewMode={previewMode}
            onPreviewNavigate={onPreviewNavigate}
            menuHighlights={navStyle.menuHighlights}
          />
        ))}
      </ul>
    </nav>
  )
}
