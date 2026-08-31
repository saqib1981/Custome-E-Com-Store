'use client'

import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import AnnouncementBarView from '@/components/announcement/AnnouncementBarView'
import HeroBannerView from '@/components/hero/HeroBannerView'
import HomeDividerSection from '@/components/home/HomeDividerSection'
import CollectionCards from '@/components/CollectionCards'
import StoreNavbar from '@/components/nav/StoreNavbar'
import Sidebar from '@/components/Sidebar'
import { useAdminEditor } from '@/context/AdminEditorContext'
import {
  PREVIEW_VIEWPORT_WIDTHS,
  isPreviewDesktopLayout,
} from '@/lib/preview-viewport'
import { resolveThemePageLabel } from '@/lib/admin-theme-pages'
import { FALLBACK_MAIN_MENU, type StoreNavItem } from '@/lib/shopify-menu'
import { MENU_ADMIN_PREVIEW_REFRESH_MS } from '@/lib/store-menu-client'

async function fetchPreviewMenu(menuId: string, menuHandle: string): Promise<StoreNavItem[]> {
  const params = new URLSearchParams()
  if (menuId) params.set('menuId', menuId)
  if (menuHandle) params.set('menuHandle', menuHandle)

  const res = await fetch(`/api/admin/preview-menu?${params.toString()}`, { cache: 'no-store' })
  if (!res.ok) return FALLBACK_MAIN_MENU

  const data = (await res.json()) as { items?: StoreNavItem[] }
  if (Array.isArray(data.items) && data.items.length) return data.items
  return FALLBACK_MAIN_MENU
}

export default function AdminStorePreview() {
  const [navOpen, setNavOpen] = useState(false)
  const [previewMenu, setPreviewMenu] = useState<StoreNavItem[] | null>(null)
  const [previewMenuLoading, setPreviewMenuLoading] = useState(true)
  const {
    activeSection,
    activeGlobalSetting,
    announcementDraft,
    announcementSaved,
    announcementLoading,
    logoFaviconDraft,
    logoFaviconSaved,
    logoFaviconLoading,
    headerNavDraft,
    headerNavSaved,
    headerNavLoading,
    heroBannerDraft,
    heroBannerSaved,
    heroBannerLoading,
    homeDividerDraft,
    homeDividerSaved,
    homeDividerLoading,
    homeDividerAfterCardsDraft,
    homeDividerAfterCardsSaved,
    homeDividerAfterCardsLoading,
    collectionCardsDraft,
    collectionCardsSaved,
    collectionCardsLoading,
    generalSettingsDraft,
    generalSettingsSaved,
    generalSettingsLoading,
    previewViewport,
    previewPath,
    setPreviewPath,
  } = useAdminEditor()

  const isEditingAnnouncement = activeSection === 'announcement'
  const isEditingHeader = activeSection === 'header'
  const isEditingHeroBanner = activeSection === 'hero-banner'
  const isEditingHomeDivider = activeSection === 'home-divider'
  const isEditingCollectionCards = activeSection === 'collection-cards'
  const isEditingHomeDividerAfterCards = activeSection === 'home-divider-after-cards'
  const isEditingLogoFavicon = activeGlobalSetting === 'logo-favicon'
  const isEditingGeneralSettings = activeGlobalSetting === 'general'
  const announcementPreview = isEditingAnnouncement ? announcementDraft : announcementSaved
  const logoFaviconPreview =
    isEditingHeader || isEditingLogoFavicon ? logoFaviconDraft : logoFaviconSaved
  const headerNavPreview = isEditingHeader ? headerNavDraft : headerNavSaved
  const heroBannerPreview = isEditingHeroBanner ? heroBannerDraft : heroBannerSaved
  const homeDividerPreview = isEditingHomeDivider ? homeDividerDraft : homeDividerSaved
  const collectionCardsPreview = isEditingCollectionCards ? collectionCardsDraft : collectionCardsSaved
  const homeDividerAfterCardsPreview = isEditingHomeDividerAfterCards
    ? homeDividerAfterCardsDraft
    : homeDividerAfterCardsSaved
  const generalSettingsPreview = isEditingGeneralSettings
    ? generalSettingsDraft
    : generalSettingsSaved
  const isLoading =
    announcementLoading ||
    logoFaviconLoading ||
    headerNavLoading ||
    heroBannerLoading ||
    homeDividerLoading ||
    homeDividerAfterCardsLoading ||
    collectionCardsLoading ||
    generalSettingsLoading

  const menuSelection = isEditingHeader ? headerNavDraft : headerNavSaved

  const isHomePreview = previewPath === '/'

  const viewportWidth = PREVIEW_VIEWPORT_WIDTHS[previewViewport]
  const isDesktop = previewViewport === 'desktop'

  useEffect(() => {
    if (isPreviewDesktopLayout(previewViewport)) setNavOpen(false)
  }, [previewViewport])

  useEffect(() => {
    if (headerNavLoading) return

    let cancelled = false

    const run = async () => {
      setPreviewMenuLoading(true)
      try {
        const items = await fetchPreviewMenu(menuSelection.menuId, menuSelection.menuHandle)
        if (!cancelled) setPreviewMenu(items)
      } catch {
        if (!cancelled) setPreviewMenu(FALLBACK_MAIN_MENU)
      } finally {
        if (!cancelled) setPreviewMenuLoading(false)
      }
    }

    void run()

    const intervalId = window.setInterval(() => {
      void fetchPreviewMenu(menuSelection.menuId, menuSelection.menuHandle)
        .then((items) => {
          if (!cancelled) setPreviewMenu(items)
        })
        .catch(() => {
          // keep last good menu on poll failure
        })
    }, MENU_ADMIN_PREVIEW_REFRESH_MS)

    const onFocus = () => {
      void run()
    }
    window.addEventListener('focus', onFocus)

    return () => {
      cancelled = true
      window.clearInterval(intervalId)
      window.removeEventListener('focus', onFocus)
    }
  }, [headerNavLoading, menuSelection.menuId, menuSelection.menuHandle])

  const menuForPreview = previewMenu ?? FALLBACK_MAIN_MENU

  return (
    <div className="relative flex h-full min-h-0 flex-1 justify-center overflow-y-auto bg-white p-4 sm:p-6">
      {isLoading || (previewMenuLoading && !previewMenu) ? (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80">
          <Loader2 className="mr-2 h-6 w-6 animate-spin text-gray-500" aria-hidden />
          <span className="text-sm text-gray-600">Loading preview…</span>
        </div>
      ) : null}

      <div
        className={`relative flex min-h-full flex-col overflow-x-hidden shadow-lg transition-[width,max-width] duration-300 ease-out ${
          isDesktop
            ? 'w-full rounded-xl border border-gray-300'
            : 'w-full rounded-[1.25rem] border-[3px] border-gray-800'
        }`}
        style={{
          backgroundColor: generalSettingsPreview.backgroundColor,
          ...(isDesktop ? {} : { maxWidth: viewportWidth ?? undefined, width: '100%' }),
        }}
      >
        <Sidebar
          open={navOpen}
          onClose={() => setNavOpen(false)}
          contained
          previewPath={previewPath}
          onPreviewNavigate={setPreviewPath}
          menuOverride={menuForPreview}
          logoFaviconOverride={logoFaviconPreview}
        />
        <AnnouncementBarView config={announcementPreview} repeats={6} />
        <StoreNavbar
          previewViewport={previewViewport}
          previewPath={previewPath}
          onPreviewNavigate={setPreviewPath}
          logoFaviconOverride={logoFaviconPreview}
          headerNavOverride={headerNavPreview}
          menuOverride={menuForPreview}
          onOpenMenu={() => setNavOpen(true)}
        />
        {isHomePreview ? (
          <>
            <HeroBannerView
              config={heroBannerPreview}
              preview
              previewViewport={previewViewport}
              onPreviewNavigate={setPreviewPath}
            />
            <HomeDividerSection config={homeDividerPreview} />
            <CollectionCards
              preview
              configOverride={collectionCardsPreview}
              onPreviewNavigate={setPreviewPath}
            />
            <HomeDividerSection config={homeDividerAfterCardsPreview} />
          </>
        ) : (
          <div className="flex flex-1 flex-col p-8 sm:p-12">
            <>
              <p className="mb-4 text-xs font-medium uppercase tracking-wide text-gray-400">
                Preview · {resolveThemePageLabel(previewPath)}
              </p>
              <div className="mb-4 h-6 w-32 rounded bg-gray-200" aria-hidden />
              <div className="space-y-2">
                <div className="h-3 w-full max-w-md rounded bg-gray-200" aria-hidden />
                <div className="h-3 w-full max-w-sm rounded bg-gray-200" aria-hidden />
                <div className="h-3 w-full max-w-lg rounded bg-gray-200" aria-hidden />
              </div>
            </>
          </div>
        )}
      </div>
    </div>
  )
}
