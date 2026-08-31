'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { X, type LucideIcon } from 'lucide-react'
import StoreBrandMark from '@/components/StoreBrandMark'
import { DEFAULT_STORE_PROFILE, getStoreNameInitials } from '@/lib/storeProfile'
import { MENU_ITEMS } from '@/lib/menu'

type SidebarProps = {
  open?: boolean
  onClose?: () => void
}

/** Off-canvas navigation drawer (mobile + desktop). */
export default function Sidebar({ open = false, onClose }: SidebarProps) {
  const pathname = usePathname()

  const storeName = DEFAULT_STORE_PROFILE.storeName
  const logoUrl = DEFAULT_STORE_PROFILE.logoUrl
  const hasLogo = Boolean(logoUrl.trim())
  const storeInitials = getStoreNameInitials(storeName)

  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose?.()
    }
    document.addEventListener('keydown', onKeyDown)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = prevOverflow
    }
  }, [open, onClose])

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-200 ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
        aria-hidden
      />
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] transform flex-col bg-white shadow-xl transition-transform duration-200 ease-out dark:bg-gray-800 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Main navigation"
        aria-hidden={!open}
      >
        <div className="flex items-center justify-between gap-2 px-4 py-4 border-b border-gray-100 dark:border-gray-700 shrink-0">
          <Link
            href="/"
            onClick={onClose}
            className="flex items-center gap-2 min-w-0 flex-1 rounded-md outline-none focus:outline-none focus-visible:outline-none"
            aria-label="Go to home"
            title="Home"
          >
            <StoreBrandMark storeName={storeName} logoUrl={logoUrl} size="sm" />
            {hasLogo ? (
              <span
                className="text-lg font-bold text-primary-600 dark:text-primary-400 tracking-tight shrink-0 hover:text-primary-700 dark:hover:text-primary-300"
                title={storeName}
              >
                {storeInitials}
              </span>
            ) : null}
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-md text-gray-600 hover:bg-primary-50 hover:text-primary-600 dark:text-gray-300 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 shrink-0"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <nav className="flex-1 mt-2 min-h-0 overflow-y-auto overflow-x-hidden" aria-label="Sidebar menu">
          <ul className="space-y-0">
            {MENU_ITEMS.map((item) => {
              const Icon = item.icon as LucideIcon
              const isActive = pathname === item.path

              return (
                <li key={item.path}>
                  <div
                    className={`flex items-center justify-between px-6 py-3 text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-gray-700 hover:text-primary-600 dark:hover:text-primary-400 transition-colors ${
                      isActive
                        ? 'bg-primary-50 dark:bg-gray-700 text-primary-600 dark:text-primary-400 border-r-4 border-primary-600'
                        : ''
                    }`}
                  >
                    <Link
                      href={item.path}
                      prefetch={false}
                      onClick={onClose}
                      className="flex flex-1 items-center min-w-0"
                      aria-current={isActive ? 'page' : undefined}
                    >
                      <Icon className="w-5 h-5 shrink-0 mr-3" aria-hidden />
                      <span className="font-medium truncate">{item.name}</span>
                    </Link>
                  </div>
                </li>
              )
            })}
          </ul>
        </nav>
      </aside>
    </>
  )
}
