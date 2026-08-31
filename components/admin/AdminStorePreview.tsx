'use client'

import { useEffect, useState } from 'react'
import { Loader2, Monitor, Smartphone, Tablet } from 'lucide-react'
import AnnouncementBarView from '@/components/announcement/AnnouncementBarView'
import StoreNavbar from '@/components/nav/StoreNavbar'
import Sidebar from '@/components/Sidebar'
import { useAdminEditor } from '@/context/AdminEditorContext'
import { useStoreTheme } from '@/context/StoreThemeContext'
import {
  PREVIEW_VIEWPORT_WIDTHS,
  isPreviewDesktopLayout,
  type PreviewViewport,
} from '@/lib/preview-viewport'

const PREVIEW_VIEWPORTS: {
  id: PreviewViewport
  label: string
  icon: typeof Smartphone
}[] = [
  { id: 'mobile', label: 'Mobile', icon: Smartphone },
  { id: 'tablet', label: 'Tablet', icon: Tablet },
  { id: 'desktop', label: 'Desktop', icon: Monitor },
]

function PreviewViewportSwitcher({
  viewport,
  onChange,
}: {
  viewport: PreviewViewport
  onChange: (viewport: PreviewViewport) => void
}) {
  return (
    <div
      className="flex items-center gap-0.5 rounded-lg border border-gray-300 bg-white p-0.5 dark:border-gray-600 dark:bg-gray-800"
      role="group"
      aria-label="Preview screen size"
    >
      {PREVIEW_VIEWPORTS.map(({ id, label, icon: Icon }) => {
        const active = viewport === id
        return (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            aria-label={label}
            aria-pressed={active}
            title={label}
            className={`inline-flex h-8 w-8 items-center justify-center rounded-md transition-colors ${
              active
                ? 'bg-primary-600 text-white shadow-sm dark:bg-primary-500'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-gray-100'
            }`}
          >
            <Icon className="h-4 w-4" aria-hidden />
          </button>
        )
      })}
    </div>
  )
}

export default function AdminStorePreview() {
  const [viewport, setViewport] = useState<PreviewViewport>('desktop')
  const [navOpen, setNavOpen] = useState(false)
  const [previewPath, setPreviewPath] = useState('/')
  const {
    activeSection,
    activeGlobalSetting,
    announcementDraft,
    announcementSaved,
    announcementLoading,
    announcementDirty,
    logoFaviconDraft,
    logoFaviconSaved,
    logoFaviconLoading,
    logoFaviconDirty,
  } = useAdminEditor()
  const { mainMenu } = useStoreTheme()

  const isEditingAnnouncement = activeSection === 'announcement'
  const isEditingLogoFavicon = activeGlobalSetting === 'logo-favicon'
  const announcementPreview = isEditingAnnouncement ? announcementDraft : announcementSaved
  const logoFaviconPreview = isEditingLogoFavicon ? logoFaviconDraft : logoFaviconSaved
  const isLoading = announcementLoading || logoFaviconLoading

  const viewportWidth = PREVIEW_VIEWPORT_WIDTHS[viewport]
  const isDesktop = viewport === 'desktop'

  useEffect(() => {
    if (isPreviewDesktopLayout(viewport)) setNavOpen(false)
  }, [viewport])

  const previewHint = isEditingAnnouncement
    ? announcementDirty
      ? 'Unsaved changes — preview updates live.'
      : 'Changes update live before you save.'
    : isEditingLogoFavicon
      ? logoFaviconDirty
        ? 'Unsaved logo changes — preview updates live.'
        : 'Logo changes update live before you save.'
      : 'Live store preview.'

  return (
    <div className="flex h-full flex-col overflow-hidden bg-gray-200/70 dark:bg-gray-950">
      <div className="flex shrink-0 items-center justify-between gap-4 border-b border-gray-300/70 px-4 py-3 dark:border-gray-800">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Preview
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {previewHint}
            {!isDesktop ? (
              <span className="ml-1 text-gray-500 dark:text-gray-400">· {viewportWidth}px</span>
            ) : null}
          </p>
        </div>
        <PreviewViewportSwitcher viewport={viewport} onChange={setViewport} />
      </div>

      <div className="relative flex min-h-0 flex-1 justify-center overflow-y-auto p-4 sm:p-6">
        {isLoading ? (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-gray-200/60 dark:bg-gray-950/60">
            <Loader2 className="mr-2 h-6 w-6 animate-spin text-gray-500 dark:text-gray-400" aria-hidden />
            <span className="text-sm text-gray-600 dark:text-gray-300">Loading preview…</span>
          </div>
        ) : null}

        <div
          className={`relative flex min-h-full flex-col overflow-hidden bg-gray-50 shadow-lg transition-[width,max-width] duration-300 ease-out dark:bg-gray-900 ${
            isDesktop
              ? 'w-full rounded-xl border border-gray-300 dark:border-gray-700'
              : 'w-full rounded-[1.25rem] border-[3px] border-gray-800 dark:border-gray-600'
          }`}
          style={
            isDesktop
              ? undefined
              : { maxWidth: viewportWidth ?? undefined, width: '100%' }
          }
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
            previewViewport={viewport}
            previewPath={previewPath}
            onPreviewNavigate={setPreviewPath}
            logoFaviconOverride={logoFaviconPreview}
            menuOverride={mainMenu}
            onOpenMenu={() => setNavOpen(true)}
          />
          <div className="flex flex-1 flex-col p-8 sm:p-12">
            <p className="mb-4 text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
              Preview · {previewPath === '/' ? 'Home' : previewPath}
            </p>
            <div className="mb-4 h-6 w-32 rounded bg-gray-200 dark:bg-gray-700" aria-hidden />
            <div className="space-y-2">
              <div className="h-3 w-full max-w-md rounded bg-gray-200 dark:bg-gray-700" aria-hidden />
              <div className="h-3 w-full max-w-sm rounded bg-gray-200 dark:bg-gray-700" aria-hidden />
              <div className="h-3 w-full max-w-lg rounded bg-gray-200 dark:bg-gray-700" aria-hidden />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
