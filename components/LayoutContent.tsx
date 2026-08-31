'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import Sidebar from './Sidebar'
import StoreNavbar from './nav/StoreNavbar'
import StoreFloatingButtons from './StoreFloatingButtons'
import AnnouncementBar from './AnnouncementBar'
import StoreFavicon from './StoreFavicon'
import { StoreThemeProvider, useStoreTheme } from '@/context/StoreThemeContext'

function StoreShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { generalSettings, logoFavicon } = useStoreTheme()
  const [navOpen, setNavOpen] = useState(false)

  useEffect(() => {
    setNavOpen(false)
  }, [pathname])

  return (
    <div
      className="flex min-h-screen flex-col"
      style={{ backgroundColor: generalSettings.backgroundColor }}
    >
      <StoreFavicon faviconUrl={logoFavicon.faviconUrl} />
      <AnnouncementBar />
      <Sidebar open={navOpen} onClose={() => setNavOpen(false)} />
      <StoreNavbar onOpenMenu={() => setNavOpen(true)} />
      <main className="flex-1">{children}</main>
      <StoreFloatingButtons pathname={pathname} />
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
