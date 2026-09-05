'use client'

import {
  Clock,
  LayoutGrid,
  LayoutPanelTop,
  Megaphone,
  Minus,
  Package,
  PanelBottom,
  Search,
  ShoppingBag,
  ShoppingCart,
  ShieldCheck,
  Image as ImageIcon,
  LayoutList,
  User,
} from 'lucide-react'
import { useAdminEditor } from '@/context/AdminEditorContext'
import { GLOBAL_SETTINGS_ITEMS } from '@/lib/admin-global-settings'

function HomepageSectionsNav() {
  const { openSection } = useAdminEditor()

  return (
    <nav className="mt-2 space-y-1" aria-label="Homepage sections">
      <button
        type="button"
        onClick={() => openSection('announcement')}
        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
      >
        <Megaphone className="h-4 w-4 shrink-0" aria-hidden />
        Announcement bar
      </button>
      <button
        type="button"
        onClick={() => openSection('header')}
        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
      >
        <LayoutPanelTop className="h-4 w-4 shrink-0" aria-hidden />
        Header
      </button>
      <button
        type="button"
        onClick={() => openSection('hero-banner')}
        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
      >
        <ImageIcon className="h-4 w-4 shrink-0" aria-hidden />
        Hero slider
      </button>
      <button
        type="button"
        onClick={() => openSection('home-divider')}
        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
      >
        <Minus className="h-4 w-4 shrink-0" aria-hidden />
        Divider
      </button>
      <button
        type="button"
        onClick={() => openSection('collection-cards')}
        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
      >
        <LayoutGrid className="h-4 w-4 shrink-0" aria-hidden />
        Collection cards
      </button>
      <button
        type="button"
        onClick={() => openSection('home-divider-after-cards')}
        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
      >
        <Minus className="h-4 w-4 shrink-0" aria-hidden />
        Divider
      </button>
      <button
        type="button"
        onClick={() => openSection('collection-tabs')}
        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
      >
        <LayoutList className="h-4 w-4 shrink-0" aria-hidden />
        Collection tabs
      </button>
      <button
        type="button"
        onClick={() => openSection('home-divider-after-tabs')}
        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
      >
        <Minus className="h-4 w-4 shrink-0" aria-hidden />
        Divider
      </button>
      <button
        type="button"
        onClick={() => openSection('trust-banner')}
        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
      >
        <ShieldCheck className="h-4 w-4 shrink-0" aria-hidden />
        Trust banner
      </button>
      <button
        type="button"
        onClick={() => openSection('home-divider-after-trust-banner')}
        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
      >
        <Minus className="h-4 w-4 shrink-0" aria-hidden />
        Divider
      </button>
      <button
        type="button"
        onClick={() => openSection('store-footer')}
        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
      >
        <PanelBottom className="h-4 w-4 shrink-0" aria-hidden />
        Footer
      </button>
    </nav>
  )
}

function CollectionsListSectionsNav() {
  const { openSection } = useAdminEditor()

  return (
    <nav className="mt-2 space-y-1" aria-label="Collection list sections">
      <button
        type="button"
        onClick={() => openSection('announcement')}
        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
      >
        <Megaphone className="h-4 w-4 shrink-0" aria-hidden />
        Announcement bar
      </button>
      <button
        type="button"
        onClick={() => openSection('header')}
        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
      >
        <LayoutPanelTop className="h-4 w-4 shrink-0" aria-hidden />
        Header
      </button>
      <button
        type="button"
        onClick={() => openSection('collections-list')}
        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
      >
        <LayoutGrid className="h-4 w-4 shrink-0" aria-hidden />
        Collection cards
      </button>
      <button
        type="button"
        onClick={() => openSection('store-footer')}
        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
      >
        <PanelBottom className="h-4 w-4 shrink-0" aria-hidden />
        Footer
      </button>
    </nav>
  )
}

function CollectionPageSectionsNav() {
  const { openSection } = useAdminEditor()

  return (
    <nav className="mt-2 space-y-1" aria-label="Collection page sections">
      <button
        type="button"
        onClick={() => openSection('announcement')}
        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
      >
        <Megaphone className="h-4 w-4 shrink-0" aria-hidden />
        Announcement bar
      </button>
      <button
        type="button"
        onClick={() => openSection('header')}
        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
      >
        <LayoutPanelTop className="h-4 w-4 shrink-0" aria-hidden />
        Header
      </button>
      <button
        type="button"
        onClick={() => openSection('collection-products')}
        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
      >
        <Package className="h-4 w-4 shrink-0" aria-hidden />
        Products
      </button>
      <button
        type="button"
        onClick={() => openSection('store-footer')}
        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
      >
        <PanelBottom className="h-4 w-4 shrink-0" aria-hidden />
        Footer
      </button>
    </nav>
  )
}

function ProductPageSectionsNav() {
  const { openSection } = useAdminEditor()

  return (
    <nav className="mt-2 space-y-1" aria-label="Product page sections">
      <button
        type="button"
        onClick={() => openSection('announcement')}
        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
      >
        <Megaphone className="h-4 w-4 shrink-0" aria-hidden />
        Announcement bar
      </button>
      <button
        type="button"
        onClick={() => openSection('header')}
        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
      >
        <LayoutPanelTop className="h-4 w-4 shrink-0" aria-hidden />
        Header
      </button>
      <button
        type="button"
        onClick={() => openSection('product-page')}
        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
      >
        <Package className="h-4 w-4 shrink-0" aria-hidden />
        Product
      </button>
      <button
        type="button"
        onClick={() => openSection('home-divider-after-product')}
        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
      >
        <Minus className="h-4 w-4 shrink-0" aria-hidden />
        Divider
      </button>
      <button
        type="button"
        onClick={() => openSection('related-products')}
        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
      >
        <LayoutGrid className="h-4 w-4 shrink-0" aria-hidden />
        Related products
      </button>
      <button
        type="button"
        onClick={() => openSection('home-divider-after-related-products')}
        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
      >
        <Minus className="h-4 w-4 shrink-0" aria-hidden />
        Divider
      </button>
      <button
        type="button"
        onClick={() => openSection('recent-products')}
        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
      >
        <Clock className="h-4 w-4 shrink-0" aria-hidden />
        Recent products
      </button>
      <button
        type="button"
        onClick={() => openSection('store-footer')}
        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
      >
        <PanelBottom className="h-4 w-4 shrink-0" aria-hidden />
        Footer
      </button>
    </nav>
  )
}

function SearchPageSectionsNav() {
  const { openSection } = useAdminEditor()

  return (
    <nav className="mt-2 space-y-1" aria-label="Search page sections">
      <button
        type="button"
        onClick={() => openSection('announcement')}
        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
      >
        <Megaphone className="h-4 w-4 shrink-0" aria-hidden />
        Announcement bar
      </button>
      <button
        type="button"
        onClick={() => openSection('header')}
        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
      >
        <LayoutPanelTop className="h-4 w-4 shrink-0" aria-hidden />
        Header
      </button>
      <button
        type="button"
        onClick={() => openSection('search')}
        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
      >
        <Search className="h-4 w-4 shrink-0" aria-hidden />
        Search
      </button>
      <button
        type="button"
        onClick={() => openSection('store-footer')}
        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
      >
        <PanelBottom className="h-4 w-4 shrink-0" aria-hidden />
        Footer
      </button>
    </nav>
  )
}

function CartPageSectionsNav() {
  const { openSection } = useAdminEditor()

  return (
    <nav className="mt-2 space-y-1" aria-label="Cart page sections">
      <button
        type="button"
        onClick={() => openSection('announcement')}
        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
      >
        <Megaphone className="h-4 w-4 shrink-0" aria-hidden />
        Announcement bar
      </button>
      <button
        type="button"
        onClick={() => openSection('header')}
        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
      >
        <LayoutPanelTop className="h-4 w-4 shrink-0" aria-hidden />
        Header
      </button>
      <button
        type="button"
        onClick={() => openSection('cart')}
        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
      >
        <ShoppingBag className="h-4 w-4 shrink-0" aria-hidden />
        Cart
      </button>
      <button
        type="button"
        onClick={() => openSection('store-footer')}
        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
      >
        <PanelBottom className="h-4 w-4 shrink-0" aria-hidden />
        Footer
      </button>
    </nav>
  )
}

function AccountPageSectionsNav() {
  const { openSection } = useAdminEditor()

  return (
    <nav className="mt-2 space-y-1" aria-label="Account page sections">
      <button
        type="button"
        onClick={() => openSection('announcement')}
        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
      >
        <Megaphone className="h-4 w-4 shrink-0" aria-hidden />
        Announcement bar
      </button>
      <button
        type="button"
        onClick={() => openSection('header')}
        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
      >
        <LayoutPanelTop className="h-4 w-4 shrink-0" aria-hidden />
        Header
      </button>
      <button
        type="button"
        onClick={() => openSection('account')}
        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
      >
        <User className="h-4 w-4 shrink-0" aria-hidden />
        Account
      </button>
      <button
        type="button"
        onClick={() => openSection('store-footer')}
        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
      >
        <PanelBottom className="h-4 w-4 shrink-0" aria-hidden />
        Footer
      </button>
    </nav>
  )
}

function CheckoutPageSectionsNav() {
  const { openSection } = useAdminEditor()

  return (
    <nav className="mt-2 space-y-1" aria-label="Checkout page sections">
      <button
        type="button"
        onClick={() => openSection('announcement')}
        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
      >
        <Megaphone className="h-4 w-4 shrink-0" aria-hidden />
        Announcement bar
      </button>
      <button
        type="button"
        onClick={() => openSection('header')}
        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
      >
        <LayoutPanelTop className="h-4 w-4 shrink-0" aria-hidden />
        Header
      </button>
      <button
        type="button"
        onClick={() => openSection('checkout')}
        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
      >
        <ShoppingCart className="h-4 w-4 shrink-0" aria-hidden />
        Checkout
      </button>
      <button
        type="button"
        onClick={() => openSection('store-footer')}
        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
      >
        <PanelBottom className="h-4 w-4 shrink-0" aria-hidden />
        Footer
      </button>
    </nav>
  )
}

export default function AdminSidebarNav() {
  const { sidebarTab, openGlobalSetting, activeThemePageId } = useAdminEditor()
  const isCollectionsListPage = activeThemePageId === 'collections-list'
  const isCollectionPage = activeThemePageId === 'collection'
  const isProductPage = activeThemePageId === 'product'
  const isSearchPage = activeThemePageId === 'search'
  const isCartPage = activeThemePageId === 'cart'
  const isAccountPage = activeThemePageId === 'account'
  const isCheckoutPage = activeThemePageId === 'checkout'

  const sectionsLabel = isCheckoutPage
    ? 'Checkout'
    : isAccountPage
      ? 'Account'
      : isCartPage
    ? 'Cart'
    : isSearchPage
      ? 'Search'
      : isProductPage
        ? 'Product'
        : isCollectionPage
          ? 'Collection'
          : isCollectionsListPage
            ? 'Collection list'
            : 'Homepage'

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto p-4">
        {sidebarTab === 'sections' ? (
          <div>
            <p className="px-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              {sectionsLabel}
            </p>
            {isCheckoutPage ? (
              <CheckoutPageSectionsNav />
            ) : isAccountPage ? (
              <AccountPageSectionsNav />
            ) : isCartPage ? (
              <CartPageSectionsNav />
            ) : isSearchPage ? (
              <SearchPageSectionsNav />
            ) : isProductPage ? (
              <ProductPageSectionsNav />
            ) : isCollectionPage ? (
              <CollectionPageSectionsNav />
            ) : isCollectionsListPage ? (
              <CollectionsListSectionsNav />
            ) : (
              <HomepageSectionsNav />
            )}
          </div>
        ) : (
          <div>
            <p className="px-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Theme settings
            </p>
            <nav className="mt-2 space-y-1" aria-label="Global settings">
              {GLOBAL_SETTINGS_ITEMS.map((item) => {
                const Icon = item.icon
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => openGlobalSetting(item.id)}
                    className="flex w-full flex-col items-start gap-0.5 rounded-md px-3 py-2.5 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <span className="flex items-center gap-2 text-sm font-medium text-gray-800 dark:text-gray-200">
                      <Icon className="h-4 w-4 shrink-0 text-gray-500 dark:text-gray-400" aria-hidden />
                      {item.name}
                    </span>
                    <span className="pl-6 text-xs text-gray-500 dark:text-gray-400">{item.description}</span>
                  </button>
                )
              })}
            </nav>
          </div>
        )}
      </div>
    </div>
  )
}
