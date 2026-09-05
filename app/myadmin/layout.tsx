'use client'

import Link from 'next/link'
import { Eye, LayoutPanelTop } from 'lucide-react'
import { AdminEditorProvider, useAdminEditor } from '@/context/AdminEditorContext'
import AdminSidebarNav from '@/components/admin/AdminSidebarNav'
import { AnnouncementBarSettingsPanel } from '@/components/admin/AdminSidebar'
import HeaderSettingsPanel from '@/components/admin/HeaderSettingsPanel'
import HeroBannerSettingsPanel from '@/components/admin/HeroBannerSettingsPanel'
import HomeDividerSettingsPanel, {
  HomeDividerAfterCardsSettingsPanel,
  HomeDividerAfterTabsSettingsPanel,
  HomeDividerAfterTrustBannerSettingsPanel,
} from '@/components/admin/HomeDividerSettingsPanel'
import CollectionCardsSettingsPanel from '@/components/admin/CollectionCardsSettingsPanel'
import CollectionTabsSettingsPanel from '@/components/admin/CollectionTabsSettingsPanel'
import TrustBannerSettingsPanel from '@/components/admin/TrustBannerSettingsPanel'
import StoreFooterSettingsPanel from '@/components/admin/StoreFooterSettingsPanel'
import CollectionsListSettingsPanel from '@/components/admin/CollectionsListSettingsPanel'
import CollectionProductsSettingsPanel from '@/components/admin/CollectionProductsSettingsPanel'
import ProductPageSettingsPanel from '@/components/admin/ProductPageSettingsPanel'
import SearchSettingsPanel from '@/components/admin/SearchSettingsPanel'
import CartSettingsPanel from '@/components/admin/CartSettingsPanel'
import CheckoutSettingsPanel from '@/components/admin/CheckoutSettingsPanel'
import GlobalSettingPanel from '@/components/admin/GlobalSettingPanel'
import AdminLightMode from '@/components/admin/AdminLightMode'
import PreviewViewportSwitcher from '@/components/admin/PreviewViewportSwitcher'
import AdminEditorTabs from '@/components/admin/AdminEditorTabs'
import AdminThemePageSelect from '@/components/admin/AdminThemePageSelect'
import AdminStoreFavicon from '@/components/admin/AdminStoreFavicon'
import { useStoreTheme } from '@/context/StoreThemeContext'

function AdminSidebarPanel() {
  const { activeSection, activeGlobalSetting } = useAdminEditor()

  if (activeSection === 'announcement') {
    return <AnnouncementBarSettingsPanel />
  }

  if (activeSection === 'header') {
    return <HeaderSettingsPanel />
  }

  if (activeSection === 'hero-banner') {
    return <HeroBannerSettingsPanel />
  }

  if (activeSection === 'home-divider') {
    return <HomeDividerSettingsPanel />
  }

  if (activeSection === 'collection-cards') {
    return <CollectionCardsSettingsPanel />
  }

  if (activeSection === 'home-divider-after-cards') {
    return <HomeDividerAfterCardsSettingsPanel />
  }

  if (activeSection === 'collection-tabs') {
    return <CollectionTabsSettingsPanel />
  }

  if (activeSection === 'home-divider-after-tabs') {
    return <HomeDividerAfterTabsSettingsPanel />
  }

  if (activeSection === 'trust-banner') {
    return <TrustBannerSettingsPanel />
  }

  if (activeSection === 'home-divider-after-trust-banner') {
    return <HomeDividerAfterTrustBannerSettingsPanel />
  }

  if (activeSection === 'store-footer') {
    return <StoreFooterSettingsPanel />
  }

  if (activeSection === 'collections-list') {
    return <CollectionsListSettingsPanel />
  }

  if (activeSection === 'collection-products') {
    return <CollectionProductsSettingsPanel />
  }

  if (activeSection === 'product-page') {
    return <ProductPageSettingsPanel />
  }

  if (activeSection === 'search') {
    return <SearchSettingsPanel />
  }

  if (activeSection === 'cart') {
    return <CartSettingsPanel />
  }

  if (activeSection === 'checkout') {
    return <CheckoutSettingsPanel />
  }

  if (activeGlobalSetting) {
    return <GlobalSettingPanel settingId={activeGlobalSetting} />
  }

  return <AdminSidebarNav />
}

function MyAdminShell({ children }: { children: React.ReactNode }) {
  const { isDetailPanelOpen, previewViewport, setPreviewViewport } = useAdminEditor()
  const { storeName } = useStoreTheme()
  const adminStoreLabel = storeName.trim() || 'Store'

  return (
    <div className="flex h-screen max-w-[100vw] flex-col overflow-x-clip bg-gray-100 text-gray-900">
      <AdminLightMode />
      <AdminStoreFavicon />
      <header className="grid shrink-0 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 overflow-x-clip border-b border-gray-800 bg-gray-950 px-4 py-3 sm:gap-4">
        <div className="flex min-w-0 items-center">
          <AdminEditorTabs />
        </div>
        <div className="flex min-w-0 items-center justify-start gap-2 sm:gap-3">
          <LayoutPanelTop className="h-5 w-5 shrink-0 text-primary-400" aria-hidden />
          <div className="min-w-0 text-left">
            <p className="text-sm font-semibold text-gray-100">Theme editor</p>
            <p className="truncate text-xs text-gray-400">{adminStoreLabel} · Admin</p>
          </div>
          <div className="min-w-0">
            <AdminThemePageSelect />
          </div>
        </div>
        <div className="flex shrink-0 items-center justify-end gap-2 sm:gap-3">
          <PreviewViewportSwitcher viewport={previewViewport} onChange={setPreviewViewport} />
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="View store"
            title="View store"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-gray-700 bg-gray-900 text-gray-200 hover:bg-gray-800"
          >
            <Eye className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </header>
      <div className="flex min-h-0 min-w-0 flex-1 overflow-x-clip">
        <aside
          className={`shrink-0 overflow-y-auto overflow-x-clip border-r border-gray-200 bg-white transition-[width] duration-200 ${
            isDetailPanelOpen ? 'w-[360px]' : 'w-64'
          }`}
        >
          <AdminSidebarPanel />
        </aside>
        <main className="min-w-0 flex-1 overflow-hidden overflow-x-clip bg-white">{children}</main>
      </div>
    </div>
  )
}

export default function MyAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminEditorProvider>
      <MyAdminShell>{children}</MyAdminShell>
    </AdminEditorProvider>
  )
}
