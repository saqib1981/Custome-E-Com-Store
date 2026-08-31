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
import { DEFAULT_ANNOUNCEMENT, type AnnouncementConfig } from '@/lib/announcement'

export type AdminSectionId = 'announcement'

type AdminEditorContextValue = {
  activeSection: AdminSectionId | null
  openSection: (id: AdminSectionId) => void
  closeSection: () => void
  announcementLoading: boolean
  announcementSaving: boolean
  announcementSaved: AnnouncementConfig
  announcementDraft: AnnouncementConfig
  announcementDirty: boolean
  announcementStatus: 'idle' | 'saved' | 'error'
  updateAnnouncementDraft: (patch: Partial<AnnouncementConfig>) => void
  saveAnnouncement: () => Promise<boolean>
}

const AdminEditorContext = createContext<AdminEditorContextValue | null>(null)

export function AdminEditorProvider({ children }: { children: ReactNode }) {
  const [activeSection, setActiveSection] = useState<AdminSectionId | null>(null)
  const [saved, setSaved] = useState<AnnouncementConfig>(DEFAULT_ANNOUNCEMENT)
  const [draft, setDraft] = useState<AnnouncementConfig>(DEFAULT_ANNOUNCEMENT)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState<'idle' | 'saved' | 'error'>('idle')

  useEffect(() => {
    void fetch('/api/admin/announcement', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : DEFAULT_ANNOUNCEMENT))
      .then((data: AnnouncementConfig) => {
        setSaved(data)
        setDraft(data)
      })
      .catch(() => {
        setSaved(DEFAULT_ANNOUNCEMENT)
        setDraft(DEFAULT_ANNOUNCEMENT)
      })
      .finally(() => setLoading(false))
  }, [])

  const announcementDirty = useMemo(
    () =>
      saved.enabled !== draft.enabled ||
      saved.message !== draft.message ||
      saved.speed !== draft.speed ||
      saved.gap !== draft.gap ||
      saved.backgroundColor !== draft.backgroundColor ||
      saved.textColor !== draft.textColor ||
      saved.height !== draft.height,
    [saved, draft]
  )

  const openSection = useCallback((id: AdminSectionId) => {
    setActiveSection(id)
    setStatus('idle')
  }, [])

  const closeSection = useCallback(() => {
    setActiveSection(null)
    setStatus('idle')
  }, [])

  const updateAnnouncementDraft = useCallback((patch: Partial<AnnouncementConfig>) => {
    setDraft((prev) => ({ ...prev, ...patch }))
    setStatus('idle')
  }, [])

  const saveAnnouncement = useCallback(async () => {
    setSaving(true)
    setStatus('idle')
    try {
      const res = await fetch('/api/admin/announcement', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draft),
      })
      if (!res.ok) throw new Error('Save failed')
      const data = (await res.json()) as AnnouncementConfig
      setSaved(data)
      setDraft(data)
      setStatus('saved')
      return true
    } catch {
      setStatus('error')
      return false
    } finally {
      setSaving(false)
    }
  }, [draft])

  const value = useMemo<AdminEditorContextValue>(
    () => ({
      activeSection,
      openSection,
      closeSection,
      announcementLoading: loading,
      announcementSaving: saving,
      announcementSaved: saved,
      announcementDraft: draft,
      announcementDirty,
      announcementStatus: status,
      updateAnnouncementDraft,
      saveAnnouncement,
    }),
    [
      activeSection,
      openSection,
      closeSection,
      loading,
      saving,
      saved,
      draft,
      announcementDirty,
      status,
      updateAnnouncementDraft,
      saveAnnouncement,
    ]
  )

  return <AdminEditorContext.Provider value={value}>{children}</AdminEditorContext.Provider>
}

export function useAdminEditor() {
  const ctx = useContext(AdminEditorContext)
  if (!ctx) throw new Error('useAdminEditor must be used within AdminEditorProvider')
  return ctx
}
