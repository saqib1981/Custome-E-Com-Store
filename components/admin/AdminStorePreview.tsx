'use client'

import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import AnnouncementBarView from '@/components/announcement/AnnouncementBarView'
import StoreNavbar from '@/components/nav/StoreNavbar'
import Sidebar from '@/components/Sidebar'
import { useAdminEditor } from '@/context/AdminEditorContext'
import { useStoreTheme } from '@/context/StoreThemeContext'
import {
  PREVIEW_VIEWPORT_WIDTHS,
  isPreviewDesktopLayout,
} from '@/lib/preview-viewport'
import { resolveThemePageLabel } from '@/lib/admin-theme-pages'

export default function AdminStorePreview() {
  const [navOpen, setNavOpen] = useState(false)
  const {
    activeSection,
    activeGlobalSetting,
    announcementDraft,
    announcementSaved,
    announcementLoading,
    logoFaviconDraft,
    logoFaviconSaved,
    logoFaviconLoading,
    generalSettingsDraft,
    generalSettingsSaved,
    generalSettingsLoading,
    previewViewport,
    previewPath,
    setPreviewPath,
  } = useAdminEditor()
  const { mainMenu } = useStoreTheme()

  const isEditingAnnouncement = activeSection === 'announcement'
  const isEditingLogoFavicon = activeGlobalSetting === 'logo-favicon'
  const isEditingGeneralSettings = activeGlobalSetting === 'general'
  const announcementPreview = isEditingAnnouncement ? announcementDraft : announcementSaved
  const logoFaviconPreview = isEditingLogoFavicon ? logoFaviconDraft : logoFaviconSaved
  const generalSettingsPreview = isEditingGeneralSettings
    ? generalSettingsDraft
    : generalSettingsSaved
  const isLoading = announcementLoading || logoFaviconLoading || generalSettingsLoading

  const viewportWidth = PREVIEW_VIEWPORT_WIDTHS[previewViewport]
  const isDesktop = previewViewport === 'desktop'

  useEffect(() => {
    if (isPreviewDesktopLayout(previewViewport)) setNavOpen(false)
  }, [previewViewport])

  return (
    <div className="relative flex h-full min-h-0 flex-1 justify-center overflow-y-auto bg-white p-4 sm:p-6">
      {isLoading ? (
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
          menuOverride={mainMenu}
          logoFaviconOverride={logoFaviconPreview}
        />
        <AnnouncementBarView config={announcementPreview} repeats={6} />
        <StoreNavbar
          previewViewport={previewViewport}
          previewPath={previewPath}
          onPreviewNavigate={setPreviewPath}
          logoFaviconOverride={logoFaviconPreview}
          menuOverride={mainMenu}
          onOpenMenu={() => setNavOpen(true)}
        />
        <div className="flex flex-1 flex-col p-8 sm:p-12">
          <p className="mb-4 text-xs font-medium uppercase tracking-wide text-gray-400">
            Preview · {resolveThemePageLabel(previewPath)}
          </p>
          <div className="mb-4 h-6 w-32 rounded bg-gray-200" aria-hidden />
          <div className="space-y-2">
            <div className="h-3 w-full max-w-md rounded bg-gray-200" aria-hidden />
            <div className="h-3 w-full max-w-sm rounded bg-gray-200" aria-hidden />
            <div className="h-3 w-full max-w-lg rounded bg-gray-200" aria-hidden />
          </div>
        </div>
      </div>
    </div>
  )
}
