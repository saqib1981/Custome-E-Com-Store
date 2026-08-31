'use client'

import { useEffect, useState, useRef } from 'react'
import { usePathname } from 'next/navigation'
import Sidebar from './Sidebar'
import StoreNavbar from './nav/StoreNavbar'
import ScrollToTopButton from './ScrollToTopButton'
import AnnouncementBar from './AnnouncementBar'
import StoreFavicon from './StoreFavicon'
import { StoreThemeProvider } from '@/context/StoreThemeContext'

function StoreShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [navOpen, setNavOpen] = useState(false)
  const mainScrollRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    setNavOpen(false)
  }, [pathname])

  return (
    <div className="flex h-screen flex-col bg-gray-50 dark:bg-gray-900">
      <StoreFavicon />
      <AnnouncementBar />
      <Sidebar open={navOpen} onClose={() => setNavOpen(false)} />
      <StoreNavbar onOpenMenu={() => setNavOpen(true)} />
      <main ref={mainScrollRef} className="flex-1 min-h-0 overflow-y-auto">
        {children}
      </main>
      <ScrollToTopButton scrollRef={mainScrollRef} pathname={pathname} />
    </div>
  )
}

export default function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  if (pathname.startsWith('/myadmin')) {
    return <>{children}</>
  }

  return (
    <StoreThemeProvider>
      <StoreShell>{children}</StoreShell>
    </StoreThemeProvider>
  )
}
