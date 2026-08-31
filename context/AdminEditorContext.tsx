'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { AdminGlobalSettingId } from '@/lib/admin-global-settings'
import {
  DEFAULT_ADMIN_THEME_PAGE_ID,
  getThemePageById,
  getThemePageByPath,
  type AdminThemePageId,
} from '@/lib/admin-theme-pages'
import { DEFAULT_ANNOUNCEMENT, type AnnouncementConfig } from '@/lib/announcement'
import { DEFAULT_GENERAL_SETTINGS, type GeneralSettingsConfig } from '@/lib/general-settings'
import { DEFAULT_LOGO_FAVICON, type LogoFaviconConfig } from '@/lib/logo-favicon'
import type { PreviewViewport } from '@/lib/preview-viewport'

export type AdminSectionId = 'announcement'
export type AdminSidebarTab = 'sections' | 'global'
export type LogoFaviconUploadFolder = 'favicon' | 'logo' | 'logo-transparent'

type AdminEditorContextValue = {
  sidebarTab: AdminSidebarTab
  setSidebarTab: (tab: AdminSidebarTab) => void
  activeSection: AdminSectionId | null
  activeGlobalSetting: AdminGlobalSettingId | null
  isDetailPanelOpen: boolean
  openSection: (id: AdminSectionId) => void
  closeSection: () => void
  openGlobalSetting: (id: AdminGlobalSettingId) => void
  closeGlobalSetting: () => void
  announcementLoading: boolean
  announcementSaving: boolean
  announcementSaved: AnnouncementConfig
  announcementDraft: AnnouncementConfig
  announcementDirty: boolean
  announcementStatus: 'idle' | 'saved' | 'error'
  updateAnnouncementDraft: (patch: Partial<AnnouncementConfig>) => void
  saveAnnouncement: () => Promise<boolean>
  logoFaviconLoading: boolean
  logoFaviconSaving: boolean
  logoFaviconSaved: LogoFaviconConfig
  logoFaviconDraft: LogoFaviconConfig
  logoFaviconDirty: boolean
  logoFaviconStatus: 'idle' | 'saved' | 'error'
  logoFaviconUploading: LogoFaviconUploadFolder | null
  updateLogoFaviconDraft: (patch: Partial<LogoFaviconConfig>) => void
  uploadLogoFaviconImage: (folder: LogoFaviconUploadFolder, file: File) => Promise<void>
  saveLogoFavicon: () => Promise<boolean>
  generalSettingsLoading: boolean
  generalSettingsSaving: boolean
  generalSettingsSaved: GeneralSettingsConfig
  generalSettingsDraft: GeneralSettingsConfig
  generalSettingsDirty: boolean
  generalSettingsStatus: 'idle' | 'saved' | 'error'
  updateGeneralSettingsDraft: (patch: Partial<GeneralSettingsConfig>) => void
  saveGeneralSettings: () => Promise<boolean>
  previewViewport: PreviewViewport
  setPreviewViewport: (viewport: PreviewViewport) => void
  activeThemePageId: AdminThemePageId
  previewPath: string
  setActiveThemePage: (id: AdminThemePageId) => void
  setPreviewPath: (path: string) => void
}

const AdminEditorContext = createContext<AdminEditorContextValue | null>(null)

function configsEqual(a: LogoFaviconConfig, b: LogoFaviconConfig): boolean {
  return (
    a.faviconUrl === b.faviconUrl &&
    a.faviconFileName === b.faviconFileName &&
    a.logoUrl === b.logoUrl &&
    a.logoFileName === b.logoFileName &&
    a.logoTransparentUrl === b.logoTransparentUrl &&
    a.logoTransparentFileName === b.logoTransparentFileName &&
    a.logoWidthDesktop === b.logoWidthDesktop &&
    a.logoWidthMobile === b.logoWidthMobile
  )
}

export function AdminEditorProvider({ children }: { children: ReactNode }) {
  const [sidebarTab, setSidebarTab] = useState<AdminSidebarTab>('sections')
  const [activeSection, setActiveSection] = useState<AdminSectionId | null>(null)
  const [activeGlobalSetting, setActiveGlobalSetting] = useState<AdminGlobalSettingId | null>(null)
  const [previewViewport, setPreviewViewport] = useState<PreviewViewport>('desktop')
  const [activeThemePageId, setActiveThemePageId] =
    useState<AdminThemePageId>(DEFAULT_ADMIN_THEME_PAGE_ID)
  const [previewPath, setPreviewPathState] = useState(
    () => getThemePageById(DEFAULT_ADMIN_THEME_PAGE_ID).path
  )

  const setActiveThemePage = useCallback((id: AdminThemePageId) => {
    const page = getThemePageById(id)
    setActiveThemePageId(page.id)
    setPreviewPathState(page.path)
  }, [])

  const setPreviewPath = useCallback((path: string) => {
    setPreviewPathState(path)
    const page = getThemePageByPath(path)
    if (page) setActiveThemePageId(page.id)
  }, [])

  const [announcementSaved, setAnnouncementSaved] = useState<AnnouncementConfig>(DEFAULT_ANNOUNCEMENT)
  const [announcementDraft, setAnnouncementDraft] = useState<AnnouncementConfig>(DEFAULT_ANNOUNCEMENT)
  const [announcementLoading, setAnnouncementLoading] = useState(true)
  const [announcementSaving, setAnnouncementSaving] = useState(false)
  const [announcementStatus, setAnnouncementStatus] = useState<'idle' | 'saved' | 'error'>('idle')

  const [logoFaviconSaved, setLogoFaviconSaved] = useState<LogoFaviconConfig>(DEFAULT_LOGO_FAVICON)
  const [logoFaviconDraft, setLogoFaviconDraft] = useState<LogoFaviconConfig>(DEFAULT_LOGO_FAVICON)
  const [logoFaviconLoading, setLogoFaviconLoading] = useState(true)
  const [logoFaviconSaving, setLogoFaviconSaving] = useState(false)
  const [logoFaviconStatus, setLogoFaviconStatus] = useState<'idle' | 'saved' | 'error'>('idle')
  const [logoFaviconUploading, setLogoFaviconUploading] = useState<LogoFaviconUploadFolder | null>(
    null
  )

  const [generalSettingsSaved, setGeneralSettingsSaved] =
    useState<GeneralSettingsConfig>(DEFAULT_GENERAL_SETTINGS)
  const [generalSettingsDraft, setGeneralSettingsDraft] =
    useState<GeneralSettingsConfig>(DEFAULT_GENERAL_SETTINGS)
  const [generalSettingsLoading, setGeneralSettingsLoading] = useState(true)
  const [generalSettingsSaving, setGeneralSettingsSaving] = useState(false)
  const [generalSettingsStatus, setGeneralSettingsStatus] = useState<'idle' | 'saved' | 'error'>(
    'idle'
  )

  useEffect(() => {
    void fetch('/api/admin/announcement', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : DEFAULT_ANNOUNCEMENT))
      .then((data: AnnouncementConfig) => {
        setAnnouncementSaved(data)
        setAnnouncementDraft(data)
      })
      .catch(() => {
        setAnnouncementSaved(DEFAULT_ANNOUNCEMENT)
        setAnnouncementDraft(DEFAULT_ANNOUNCEMENT)
      })
      .finally(() => setAnnouncementLoading(false))
  }, [])

  useEffect(() => {
    void fetch('/api/admin/logo-favicon', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : DEFAULT_LOGO_FAVICON))
      .then((data: LogoFaviconConfig) => {
        setLogoFaviconSaved(data)
        setLogoFaviconDraft(data)
      })
      .catch(() => {
        setLogoFaviconSaved(DEFAULT_LOGO_FAVICON)
        setLogoFaviconDraft(DEFAULT_LOGO_FAVICON)
      })
      .finally(() => setLogoFaviconLoading(false))
  }, [])

  useEffect(() => {
    void fetch('/api/admin/general-settings', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : DEFAULT_GENERAL_SETTINGS))
      .then((data: GeneralSettingsConfig) => {
        setGeneralSettingsSaved(data)
        setGeneralSettingsDraft(data)
      })
      .catch(() => {
        setGeneralSettingsSaved(DEFAULT_GENERAL_SETTINGS)
        setGeneralSettingsDraft(DEFAULT_GENERAL_SETTINGS)
      })
      .finally(() => setGeneralSettingsLoading(false))
  }, [])

  const announcementDirty = useMemo(
    () =>
      announcementSaved.enabled !== announcementDraft.enabled ||
      announcementSaved.message !== announcementDraft.message ||
      announcementSaved.speed !== announcementDraft.speed ||
      announcementSaved.gap !== announcementDraft.gap ||
      announcementSaved.backgroundColor !== announcementDraft.backgroundColor ||
      announcementSaved.textColor !== announcementDraft.textColor ||
      announcementSaved.height !== announcementDraft.height,
    [announcementSaved, announcementDraft]
  )

  const logoFaviconDirty = useMemo(
    () => !configsEqual(logoFaviconSaved, logoFaviconDraft),
    [logoFaviconSaved, logoFaviconDraft]
  )

  const generalSettingsDirty = useMemo(
    () => generalSettingsSaved.backgroundColor !== generalSettingsDraft.backgroundColor,
    [generalSettingsSaved, generalSettingsDraft]
  )

  const isDetailPanelOpen = activeSection !== null || activeGlobalSetting !== null

  const openSection = useCallback((id: AdminSectionId) => {
    setSidebarTab('sections')
    setActiveGlobalSetting(null)
    setActiveSection(id)
    setAnnouncementStatus('idle')
  }, [])

  const closeSection = useCallback(() => {
    setActiveSection(null)
    setAnnouncementStatus('idle')
  }, [])

  const openGlobalSetting = useCallback((id: AdminGlobalSettingId) => {
    setSidebarTab('global')
    setActiveSection(null)
    setActiveGlobalSetting(id)
    setLogoFaviconStatus('idle')
    setGeneralSettingsStatus('idle')
  }, [])

  const closeGlobalSetting = useCallback(() => {
    setActiveGlobalSetting(null)
    setLogoFaviconStatus('idle')
    setGeneralSettingsStatus('idle')
  }, [])

  const updateAnnouncementDraft = useCallback((patch: Partial<AnnouncementConfig>) => {
    setAnnouncementDraft((prev) => ({ ...prev, ...patch }))
    setAnnouncementStatus('idle')
  }, [])

  const saveAnnouncement = useCallback(async () => {
    setAnnouncementSaving(true)
    setAnnouncementStatus('idle')
    try {
      const res = await fetch('/api/admin/announcement', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(announcementDraft),
      })
      if (!res.ok) throw new Error('Save failed')
      const data = (await res.json()) as AnnouncementConfig
      setAnnouncementSaved(data)
      setAnnouncementDraft(data)
      setAnnouncementStatus('saved')
      return true
    } catch {
      setAnnouncementStatus('error')
      return false
    } finally {
      setAnnouncementSaving(false)
    }
  }, [announcementDraft])

  const updateLogoFaviconDraft = useCallback((patch: Partial<LogoFaviconConfig>) => {
    setLogoFaviconDraft((prev) => ({ ...prev, ...patch }))
    setLogoFaviconStatus('idle')
  }, [])

  const uploadLogoFaviconImage = useCallback(
    async (folder: LogoFaviconUploadFolder, file: File) => {
      setLogoFaviconUploading(folder)
      setLogoFaviconStatus('idle')
      try {
        const form = new FormData()
        form.append('file', file)
        form.append('folder', folder)

        const res = await fetch('/api/admin/upload', { method: 'POST', body: form })
        if (!res.ok) throw new Error('Upload failed')
        const data = (await res.json()) as { url: string; fileName: string }

        if (folder === 'favicon') {
          updateLogoFaviconDraft({ faviconUrl: data.url, faviconFileName: data.fileName })
        } else if (folder === 'logo') {
          updateLogoFaviconDraft({ logoUrl: data.url, logoFileName: data.fileName })
        } else {
          updateLogoFaviconDraft({
            logoTransparentUrl: data.url,
            logoTransparentFileName: data.fileName,
          })
        }
      } catch {
        setLogoFaviconStatus('error')
      } finally {
        setLogoFaviconUploading(null)
      }
    },
    [updateLogoFaviconDraft]
  )

  const saveLogoFavicon = useCallback(async () => {
    setLogoFaviconSaving(true)
    setLogoFaviconStatus('idle')
    try {
      const res = await fetch('/api/admin/logo-favicon', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(logoFaviconDraft),
      })
      if (!res.ok) throw new Error('Save failed')
      const data = (await res.json()) as LogoFaviconConfig
      setLogoFaviconSaved(data)
      setLogoFaviconDraft(data)
      setLogoFaviconStatus('saved')
      return true
    } catch {
      setLogoFaviconStatus('error')
      return false
    } finally {
      setLogoFaviconSaving(false)
    }
  }, [logoFaviconDraft])

  const updateGeneralSettingsDraft = useCallback((patch: Partial<GeneralSettingsConfig>) => {
    setGeneralSettingsDraft((prev) => ({ ...prev, ...patch }))
    setGeneralSettingsStatus('idle')
  }, [])

  const saveGeneralSettings = useCallback(async () => {
    setGeneralSettingsSaving(true)
    setGeneralSettingsStatus('idle')
    try {
      const res = await fetch('/api/admin/general-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(generalSettingsDraft),
      })
      if (!res.ok) throw new Error('Save failed')
      const data = (await res.json()) as GeneralSettingsConfig
      setGeneralSettingsSaved(data)
      setGeneralSettingsDraft(data)
      setGeneralSettingsStatus('saved')
      return true
    } catch {
      setGeneralSettingsStatus('error')
      return false
    } finally {
      setGeneralSettingsSaving(false)
    }
  }, [generalSettingsDraft])

  const value = useMemo<AdminEditorContextValue>(
    () => ({
      sidebarTab,
      setSidebarTab,
      activeSection,
      activeGlobalSetting,
      isDetailPanelOpen,
      openSection,
      closeSection,
      openGlobalSetting,
      closeGlobalSetting,
      announcementLoading,
      announcementSaving,
      announcementSaved,
      announcementDraft,
      announcementDirty,
      announcementStatus,
      updateAnnouncementDraft,
      saveAnnouncement,
      logoFaviconLoading,
      logoFaviconSaving,
      logoFaviconSaved,
      logoFaviconDraft,
      logoFaviconDirty,
      logoFaviconStatus,
      logoFaviconUploading,
      updateLogoFaviconDraft,
      uploadLogoFaviconImage,
      saveLogoFavicon,
      generalSettingsLoading,
      generalSettingsSaving,
      generalSettingsSaved,
      generalSettingsDraft,
      generalSettingsDirty,
      generalSettingsStatus,
      updateGeneralSettingsDraft,
      saveGeneralSettings,
      previewViewport,
      setPreviewViewport,
      activeThemePageId,
      previewPath,
      setActiveThemePage,
      setPreviewPath,
    }),
    [
      sidebarTab,
      activeSection,
      activeGlobalSetting,
      isDetailPanelOpen,
      openSection,
      closeSection,
      openGlobalSetting,
      closeGlobalSetting,
      announcementLoading,
      announcementSaving,
      announcementSaved,
      announcementDraft,
      announcementDirty,
      announcementStatus,
      updateAnnouncementDraft,
      saveAnnouncement,
      logoFaviconLoading,
      logoFaviconSaving,
      logoFaviconSaved,
      logoFaviconDraft,
      logoFaviconDirty,
      logoFaviconStatus,
      logoFaviconUploading,
      updateLogoFaviconDraft,
      uploadLogoFaviconImage,
      saveLogoFavicon,
      generalSettingsLoading,
      generalSettingsSaving,
      generalSettingsSaved,
      generalSettingsDraft,
      generalSettingsDirty,
      generalSettingsStatus,
      updateGeneralSettingsDraft,
      saveGeneralSettings,
      previewViewport,
      activeThemePageId,
      previewPath,
      setActiveThemePage,
      setPreviewPath,
    ]
  )

  return <AdminEditorContext.Provider value={value}>{children}</AdminEditorContext.Provider>
}

export function useAdminEditor() {
  const ctx = useContext(AdminEditorContext)
  if (!ctx) throw new Error('useAdminEditor must be used within AdminEditorProvider')
  return ctx
}
