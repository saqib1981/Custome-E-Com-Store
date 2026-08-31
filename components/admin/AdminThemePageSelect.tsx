'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ChevronDown,
  Home,
  Search,
  ShoppingBag,
  Tag,
  Tags,
  User,
  type LucideIcon,
} from 'lucide-react'
import { useAdminEditor } from '@/context/AdminEditorContext'
import {
  ADMIN_THEME_PAGES,
  getThemePageById,
  type AdminThemePageId,
} from '@/lib/admin-theme-pages'

const PAGE_ICONS: Record<AdminThemePageId, LucideIcon> = {
  home: Home,
  collection: Tags,
  product: Tag,
  cart: ShoppingBag,
  search: Search,
  account: User,
}

export default function AdminThemePageSelect() {
  const { activeThemePageId, setActiveThemePage } = useAdminEditor()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const rootRef = useRef<HTMLDivElement>(null)

  const activePage = getThemePageById(activeThemePageId)
  const ActiveIcon = PAGE_ICONS[activePage.id]

  const filteredPages = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return ADMIN_THEME_PAGES
    return ADMIN_THEME_PAGES.filter((page) => page.name.toLowerCase().includes(q))
  }, [query])

  useEffect(() => {
    if (!open) return
    const onPointerDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  const selectPage = (id: AdminThemePageId) => {
    setActiveThemePage(id)
    setOpen(false)
    setQuery('')
  }

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        aria-label="Theme page"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex items-center gap-2 rounded-md px-1.5 py-1 text-sm text-gray-200 transition-colors hover:bg-gray-900/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40"
      >
        <ActiveIcon className="h-4 w-4 shrink-0 text-gray-300" aria-hidden />
        <span className="max-w-[10rem] truncate font-medium">{activePage.name}</span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
          aria-hidden
        />
      </button>

      {open ? (
        <div className="absolute left-0 top-[calc(100%+0.35rem)] z-50 w-[17.5rem] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl">
          <div className="border-b border-gray-200 p-2">
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                aria-hidden
              />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search online store"
                className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                autoFocus
              />
            </div>
          </div>

          <ul role="listbox" aria-label="Theme pages" className="max-h-72 overflow-y-auto py-1">
            {filteredPages.length ? (
              filteredPages.map((page) => {
                const Icon = PAGE_ICONS[page.id]
                const active = page.id === activeThemePageId
                return (
                  <li key={page.id}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={active}
                      onClick={() => selectPage(page.id)}
                      className={`flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm transition-colors ${
                        active
                          ? 'bg-gray-100 font-medium text-gray-900'
                          : 'text-gray-800 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="h-4 w-4 shrink-0 text-gray-500" aria-hidden />
                      <span className="truncate">{page.name}</span>
                    </button>
                  </li>
                )
              })
            ) : (
              <li className="px-3 py-3 text-sm text-gray-500">No pages found</li>
            )}
          </ul>
        </div>
      ) : null}
    </div>
  )
}
