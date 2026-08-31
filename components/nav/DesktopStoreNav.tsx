'use client'

import { ChevronDown, ChevronRight } from 'lucide-react'
import StoreNavLink from '@/components/nav/StoreNavLink'
import { isStoreNavActive, type StoreNavItem } from '@/lib/shopify-menu'

const navLinkClass = (active: boolean) =>
  `relative inline-flex min-h-[50px] items-center gap-1 px-4 py-2.5 text-sm font-medium tracking-wide transition-colors ${
    active
      ? 'text-primary-600 after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:rounded-full after:bg-primary-600'
      : 'text-gray-800 hover:text-primary-600'
  }`

const dropdownLinkClass = (active: boolean) =>
  `text-sm transition-colors ${
    active ? 'font-medium text-primary-600' : 'text-gray-800 hover:text-primary-600'
  }`

type NavLinkProps = {
  item: StoreNavItem
  active: boolean
  className?: string
  previewMode?: boolean
  onPreviewNavigate?: (path: string) => void
}

function NavAnchor({ item, active, className, previewMode, onPreviewNavigate }: NavLinkProps) {
  return (
    <StoreNavLink
      href={item.href}
      external={item.external}
      previewMode={previewMode}
      onPreviewNavigate={onPreviewNavigate}
      className={`${navLinkClass(active)} ${className ?? ''}`}
      aria-current={active ? 'page' : undefined}
    >
      {item.title}
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
      className={`${dropdownLinkClass(active)} ${className ?? ''}`}
      aria-current={active ? 'page' : undefined}
    >
      {item.title}
    </StoreNavLink>
  )
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
    <li className="group/sub relative">
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
      <ul className="invisible absolute left-full top-0 z-10 min-w-[13rem] border border-gray-200 bg-white py-1 opacity-0 shadow-lg transition-all group-hover/sub:visible group-hover/sub:opacity-100 group-focus-within/sub:visible group-focus-within/sub:opacity-100">
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
}: {
  item: StoreNavItem
  pathname: string
  previewMode?: boolean
  onPreviewNavigate?: (path: string) => void
}) {
  const active = isStoreNavActive(pathname, item)

  return (
    <li className="group/menu relative">
      <div className="inline-flex items-center">
        <NavAnchor
          item={item}
          active={active}
          previewMode={previewMode}
          onPreviewNavigate={onPreviewNavigate}
        />
        <ChevronDown
          className="-ml-2 mr-1 h-3.5 w-3.5 text-gray-500 transition-transform group-hover/menu:rotate-180 group-focus-within/menu:rotate-180"
          aria-hidden
        />
      </div>

      <ul className="invisible absolute left-0 top-full z-50 min-w-[13rem] border border-gray-200 bg-white py-1 opacity-0 shadow-lg transition-all group-hover/menu:visible group-hover/menu:opacity-100 group-focus-within/menu:visible group-focus-within/menu:opacity-100">
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
    <DesktopNavDropdown
      item={item}
      pathname={pathname}
      previewMode={previewMode}
      onPreviewNavigate={onPreviewNavigate}
    />
  )
}

type DesktopStoreNavProps = {
  items: StoreNavItem[]
  pathname: string
  previewMode?: boolean
  onPreviewNavigate?: (path: string) => void
  className?: string
}

export default function DesktopStoreNav({
  items,
  pathname,
  previewMode,
  onPreviewNavigate,
  className = '',
}: DesktopStoreNavProps) {
  return (
    <nav
      className={`relative border-y border-solid border-gray-200 ${className}`}
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
          />
        ))}
      </ul>
    </nav>
  )
}
