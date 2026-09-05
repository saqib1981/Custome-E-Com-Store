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
import CartDrawer from './cart/CartDrawer'
import { StoreThemeProvider, useStoreTheme } from '@/context/StoreThemeContext'
import { CartProvider, useCart } from '@/context/CartContext'

function CheckoutShell({ children }: { children: React.ReactNode }) {
  const { logoFavicon } = useStoreTheme()

  return (
    <div className="relative min-h-screen max-w-full overflow-x-clip bg-white">
      <StoreFavicon faviconUrl={logoFavicon.faviconUrl} />
      <main className="min-h-screen">{children}</main>
      <CartDrawer />
    </div>
  )
}

function StoreShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { generalSettings, logoFavicon } = useStoreTheme()
  const { itemCount, openDrawer } = useCart()
  const [navOpen, setNavOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  useEffect(() => {
    setNavOpen(false)
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
      <StoreNavbar
        onOpenMenu={() => setNavOpen(true)}
        onOpenSearch={() => setSearchOpen(true)}
        onOpenCart={openDrawer}
        cartCount={itemCount}
      />
      <main className="flex-1">{children}</main>
      <StoreFooter />
      <StoreFloatingButtons pathname={pathname} />
      <SearchPopup open={searchOpen} onClose={() => setSearchOpen(false)} />
      <CartDrawer />
    </div>
  )
}

export default function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isCheckout = pathname === '/checkout' || pathname.startsWith('/checkout/')

  return (
    <StoreThemeProvider>
      <CartProvider>
        {pathname.startsWith('/myadmin') ? (
          <>{children}</>
        ) : isCheckout ? (
          <CheckoutShell>{children}</CheckoutShell>
        ) : (
          <StoreShell>{children}</StoreShell>
        )}
      </CartProvider>
    </StoreThemeProvider>
  )
}
