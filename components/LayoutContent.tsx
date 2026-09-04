'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import Sidebar from './Sidebar'
import StoreNavbar from './nav/StoreNavbar'
import StoreFloatingButtons from './StoreFloatingButtons'
import StoreFooter from './StoreFooter'
import AnnouncementBar from './AnnouncementBar'
import StoreFavicon from './StoreFavicon'
import SearchPopup from './search/SearchPopup'
import { StoreThemeProvider, useStoreTheme } from '@/context/StoreThemeContext'

function StoreShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { generalSettings, logoFavicon } = useStoreTheme()
  const [navOpen, setNavOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  useEffect(() => {
    setNavOpen(false)
    // Search page has its own results UI — don't force the popup open there.
    setSearchOpen(false)
  }, [pathname])

  return (
    <div
      className="relative flex min-h-screen max-w-full flex-col overflow-x-clip"
      style={{ backgroundColor: generalSettings.backgroundColor }}
    >
      <StoreFavicon faviconUrl={logoFavicon.faviconUrl} />
      <AnnouncementBar />
      <Sidebar open={navOpen} onClose={() => setNavOpen(false)} />
      <StoreNavbar onOpenMenu={() => setNavOpen(true)} onOpenSearch={() => setSearchOpen(true)} />
      <main className="flex-1">{children}</main>
      <StoreFooter />
      <StoreFloatingButtons pathname={pathname} />
      <SearchPopup open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  )
}

export default function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <StoreThemeProvider>
      {pathname.startsWith('/myadmin') ? (
        <>{children}</>
      ) : (
        <StoreShell>{children}</StoreShell>
      )}
    </StoreThemeProvider>
  )
}
