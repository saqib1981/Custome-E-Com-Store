'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu } from 'lucide-react'
import Sidebar from './Sidebar'
import RightMenuPanel from './RightMenuPanel'
import RightMenuIcon from './icons/RightMenuIcon'
import StoreBrandMark from './StoreBrandMark'
import ScrollToTopButton from './ScrollToTopButton'
import AnnouncementBar from './AnnouncementBar'
import { DEFAULT_STORE_PROFILE } from '@/lib/storeProfile'

export default function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [navOpen, setNavOpen] = useState(false)
  const [rightMenuOpen, setRightMenuOpen] = useState(false)
  const mainScrollRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    setNavOpen(false)
    setRightMenuOpen(false)
  }, [pathname])

  if (pathname.startsWith('/myadmin')) {
    return <>{children}</>
  }

  return (
    <div className="flex h-screen flex-col bg-gray-50 dark:bg-gray-900">
      <AnnouncementBar />
      <Sidebar open={navOpen} onClose={() => setNavOpen(false)} />
      <RightMenuPanel open={rightMenuOpen} onClose={() => setRightMenuOpen(false)} />
      <header className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-gray-800 shadow-sm shrink-0">
        <button
          type="button"
          onClick={() => {
            setRightMenuOpen(false)
            setNavOpen(true)
          }}
          className="shrink-0 p-2 -ml-2 rounded-md text-gray-700 hover:bg-primary-50 hover:text-primary-600 dark:text-gray-300 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
          aria-label="Open menu"
        >
          <Menu className="w-6 h-6" />
        </button>
        <Link
          href="/"
          className="flex items-center gap-2 min-w-0 flex-1 rounded-md outline-none focus:outline-none focus-visible:outline-none"
          aria-label="Go to home"
          title="Home"
        >
          <StoreBrandMark
            storeName={DEFAULT_STORE_PROFILE.storeName}
            logoUrl={DEFAULT_STORE_PROFILE.logoUrl}
            size="sm"
          />
          <span
            className="text-base font-bold text-primary-600 dark:text-primary-400 truncate hover:text-primary-700 dark:hover:text-primary-300"
            title={DEFAULT_STORE_PROFILE.storeName}
          >
            {DEFAULT_STORE_PROFILE.storeName}
          </span>
        </Link>
        <button
          type="button"
          onClick={() => {
            setNavOpen(false)
            setRightMenuOpen(true)
          }}
          className="shrink-0 p-2 -mr-2 rounded-md text-gray-700 hover:bg-primary-50 hover:text-primary-600 dark:text-gray-300 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
          aria-label="Open tools menu"
          title="Open menu"
        >
          <RightMenuIcon className="h-6 w-6" />
        </button>
      </header>
      <main ref={mainScrollRef} className="flex-1 min-h-0 overflow-y-auto">
        {children}
      </main>
      <ScrollToTopButton scrollRef={mainScrollRef} pathname={pathname} />
    </div>
  )
}
