'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
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
import {
  DEFAULT_FLOATING_BUTTONS,
  floatingButtonsConfigsEqual,
  type FloatingButtonsConfig,
} from '@/lib/floating-buttons'
import {
  FLOATING_BUTTONS_AUTOSAVE_MS,
  fetchFloatingButtons,
  persistFloatingButtons,
} from '@/lib/floating-buttons-client'
import {
  DEFAULT_HEADER_NAV_SETTINGS,
  menuHighlightsEqual,
  type HeaderNavSettingsConfig,
} from '@/lib/header-settings'
import {
  DEFAULT_HERO_BANNER,
  heroBannerConfigsEqual,
  type HeroBannerConfig,
} from '@/lib/hero-banner'
import {
  DEFAULT_HOME_DIVIDER,
  homeDividerConfigsEqual,
  type HomeDividerConfig,
} from '@/lib/home-divider'
import {
  collectionTabsConfigsEqual,
  DEFAULT_COLLECTION_TABS,
  type CollectionTabsConfig,
} from '@/lib/collection-tabs'
import {
  trustBannerConfigsEqual,
  DEFAULT_TRUST_BANNER,
  type TrustBannerConfig,
} from '@/lib/trust-banner'
import {
  DEFAULT_STORE_FOOTER,
  storeFooterConfigsEqual,
  type StoreFooterConfig,
} from '@/lib/store-footer'
import {
  collectionCardsConfigsEqual,
  DEFAULT_COLLECTION_CARDS,
  type CollectionCardsConfig,
} from '@/lib/collection-cards'
import {
  collectionsListConfigsEqual,
  DEFAULT_COLLECTIONS_LIST,
  type CollectionsListConfig,
} from '@/lib/collections-list'
import { DEFAULT_LOGO_FAVICON, type LogoFaviconConfig } from '@/lib/logo-favicon'
import type { PreviewViewport } from '@/lib/preview-viewport'

export type AdminSectionId =
  | 'announcement'
  | 'header'
  | 'hero-banner'
  | 'home-divider'
  | 'collection-cards'
  | 'home-divider-after-cards'
  | 'collection-tabs'
  | 'home-divider-after-tabs'
  | 'trust-banner'
  | 'home-divider-after-trust-banner'
  | 'store-footer'
  | 'collections-list'
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
  heroBannerLoading: boolean
  heroBannerSaving: boolean
  heroBannerSaved: HeroBannerConfig
  heroBannerDraft: HeroBannerConfig
  heroBannerDirty: boolean
  heroBannerStatus: 'idle' | 'saved' | 'error'
  updateHeroBannerDraft: (
    patch: Partial<HeroBannerConfig> | ((prev: HeroBannerConfig) => Partial<HeroBannerConfig>)
  ) => void
  saveHeroBanner: () => Promise<boolean>
  homeDividerLoading: boolean
  homeDividerSaving: boolean
  homeDividerSaved: HomeDividerConfig
  homeDividerDraft: HomeDividerConfig
  homeDividerDirty: boolean
  homeDividerStatus: 'idle' | 'saved' | 'error'
  updateHomeDividerDraft: (patch: Partial<HomeDividerConfig>) => void
  saveHomeDivider: () => Promise<boolean>
  homeDividerAfterCardsLoading: boolean
  homeDividerAfterCardsSaving: boolean
  homeDividerAfterCardsSaved: HomeDividerConfig
  homeDividerAfterCardsDraft: HomeDividerConfig
  homeDividerAfterCardsDirty: boolean
  homeDividerAfterCardsStatus: 'idle' | 'saved' | 'error'
  updateHomeDividerAfterCardsDraft: (patch: Partial<HomeDividerConfig>) => void
  saveHomeDividerAfterCards: () => Promise<boolean>
  homeDividerAfterTabsLoading: boolean
  homeDividerAfterTabsSaving: boolean
  homeDividerAfterTabsSaved: HomeDividerConfig
  homeDividerAfterTabsDraft: HomeDividerConfig
  homeDividerAfterTabsDirty: boolean
  homeDividerAfterTabsStatus: 'idle' | 'saved' | 'error'
  updateHomeDividerAfterTabsDraft: (patch: Partial<HomeDividerConfig>) => void
  saveHomeDividerAfterTabs: () => Promise<boolean>
  collectionCardsLoading: boolean
  collectionCardsSaving: boolean
  collectionCardsSaved: CollectionCardsConfig
  collectionCardsDraft: CollectionCardsConfig
  collectionCardsDirty: boolean
  collectionCardsStatus: 'idle' | 'saved' | 'error'
  updateCollectionCardsDraft: (patch: Partial<CollectionCardsConfig>) => void
  saveCollectionCards: () => Promise<boolean>
  collectionTabsLoading: boolean
  collectionTabsSaving: boolean
  collectionTabsSaved: CollectionTabsConfig
  collectionTabsDraft: CollectionTabsConfig
  collectionTabsDirty: boolean
  collectionTabsStatus: 'idle' | 'saved' | 'error'
  updateCollectionTabsDraft: (patch: Partial<CollectionTabsConfig>) => void
  saveCollectionTabs: () => Promise<boolean>
  trustBannerLoading: boolean
  trustBannerSaving: boolean
  trustBannerSaved: TrustBannerConfig
  trustBannerDraft: TrustBannerConfig
  trustBannerDirty: boolean
  trustBannerStatus: 'idle' | 'saved' | 'error'
  updateTrustBannerDraft: (patch: Partial<TrustBannerConfig>) => void
  saveTrustBanner: () => Promise<boolean>
  homeDividerAfterTrustBannerLoading: boolean
  homeDividerAfterTrustBannerSaving: boolean
  homeDividerAfterTrustBannerSaved: HomeDividerConfig
  homeDividerAfterTrustBannerDraft: HomeDividerConfig
  homeDividerAfterTrustBannerDirty: boolean
  homeDividerAfterTrustBannerStatus: 'idle' | 'saved' | 'error'
  updateHomeDividerAfterTrustBannerDraft: (patch: Partial<HomeDividerConfig>) => void
  saveHomeDividerAfterTrustBanner: () => Promise<boolean>
  storeFooterLoading: boolean
  storeFooterSaving: boolean
  storeFooterSaved: StoreFooterConfig
  storeFooterDraft: StoreFooterConfig
  storeFooterDirty: boolean
  storeFooterStatus: 'idle' | 'saved' | 'error'
  storeFooterLogoUploading: boolean
  updateStoreFooterDraft: (patch: Partial<StoreFooterConfig>) => void
  uploadStoreFooterLogo: (file: File) => Promise<void>
  saveStoreFooter: () => Promise<boolean>
  collectionsListLoading: boolean
  collectionsListSaving: boolean
  collectionsListSaved: CollectionsListConfig
  collectionsListDraft: CollectionsListConfig
  collectionsListDirty: boolean
  collectionsListStatus: 'idle' | 'saved' | 'error'
  updateCollectionsListDraft: (patch: Partial<CollectionsListConfig>) => void
  saveCollectionsList: () => Promise<boolean>
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
  headerNavLoading: boolean
  headerNavSaving: boolean
  headerNavSaved: HeaderNavSettingsConfig
  headerNavDraft: HeaderNavSettingsConfig
  headerNavDirty: boolean
  headerNavStatus: 'idle' | 'saved' | 'error'
  updateHeaderNavDraft: (patch: Partial<HeaderNavSettingsConfig>) => void
  saveHeaderNavSettings: () => Promise<boolean>
  saveHeaderSection: () => Promise<boolean>
  headerSectionDirty: boolean
  headerSectionSaving: boolean
  headerSectionStatus: 'idle' | 'saved' | 'error'
  generalSettingsLoading: boolean
  generalSettingsSaving: boolean
  generalSettingsSaved: GeneralSettingsConfig
  generalSettingsDraft: GeneralSettingsConfig
  generalSettingsDirty: boolean
  generalSettingsStatus: 'idle' | 'saved' | 'error'
  updateGeneralSettingsDraft: (patch: Partial<GeneralSettingsConfig>) => void
  saveGeneralSettings: () => Promise<boolean>
  floatingButtonsLoading: boolean
  floatingButtonsSaving: boolean
  floatingButtonsSaved: FloatingButtonsConfig
  floatingButtonsDraft: FloatingButtonsConfig
  floatingButtonsDirty: boolean
  floatingButtonsStatus: 'idle' | 'saved' | 'error'
  updateFloatingButtonsDraft: (patch: Partial<FloatingButtonsConfig>) => void
  saveFloatingButtons: () => Promise<boolean>
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
    setActiveSection(null)
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

  const [heroBannerSaved, setHeroBannerSaved] = useState<HeroBannerConfig>(DEFAULT_HERO_BANNER)
  const [heroBannerDraft, setHeroBannerDraft] = useState<HeroBannerConfig>(DEFAULT_HERO_BANNER)
  const [heroBannerLoading, setHeroBannerLoading] = useState(true)
  const [heroBannerSaving, setHeroBannerSaving] = useState(false)
  const [heroBannerStatus, setHeroBannerStatus] = useState<'idle' | 'saved' | 'error'>('idle')
  const heroBannerDraftRef = useRef(heroBannerDraft)
  heroBannerDraftRef.current = heroBannerDraft
  const heroBannerSavedRef = useRef(heroBannerSaved)
  heroBannerSavedRef.current = heroBannerSaved

  const [homeDividerSaved, setHomeDividerSaved] = useState<HomeDividerConfig>(DEFAULT_HOME_DIVIDER)
  const [homeDividerDraft, setHomeDividerDraft] = useState<HomeDividerConfig>(DEFAULT_HOME_DIVIDER)
  const [homeDividerLoading, setHomeDividerLoading] = useState(true)
  const [homeDividerSaving, setHomeDividerSaving] = useState(false)
  const [homeDividerStatus, setHomeDividerStatus] = useState<'idle' | 'saved' | 'error'>('idle')

  const [homeDividerAfterCardsSaved, setHomeDividerAfterCardsSaved] =
    useState<HomeDividerConfig>(DEFAULT_HOME_DIVIDER)
  const [homeDividerAfterCardsDraft, setHomeDividerAfterCardsDraft] =
    useState<HomeDividerConfig>(DEFAULT_HOME_DIVIDER)
  const [homeDividerAfterCardsLoading, setHomeDividerAfterCardsLoading] = useState(true)
  const [homeDividerAfterCardsSaving, setHomeDividerAfterCardsSaving] = useState(false)
  const [homeDividerAfterCardsStatus, setHomeDividerAfterCardsStatus] = useState<
    'idle' | 'saved' | 'error'
  >('idle')

  const [homeDividerAfterTabsSaved, setHomeDividerAfterTabsSaved] =
    useState<HomeDividerConfig>(DEFAULT_HOME_DIVIDER)
  const [homeDividerAfterTabsDraft, setHomeDividerAfterTabsDraft] =
    useState<HomeDividerConfig>(DEFAULT_HOME_DIVIDER)
  const [homeDividerAfterTabsLoading, setHomeDividerAfterTabsLoading] = useState(true)
  const [homeDividerAfterTabsSaving, setHomeDividerAfterTabsSaving] = useState(false)
  const [homeDividerAfterTabsStatus, setHomeDividerAfterTabsStatus] = useState<
    'idle' | 'saved' | 'error'
  >('idle')

  const [collectionCardsSaved, setCollectionCardsSaved] =
    useState<CollectionCardsConfig>(DEFAULT_COLLECTION_CARDS)
  const [collectionCardsDraft, setCollectionCardsDraft] =
    useState<CollectionCardsConfig>(DEFAULT_COLLECTION_CARDS)
  const [collectionCardsLoading, setCollectionCardsLoading] = useState(true)
  const [collectionCardsSaving, setCollectionCardsSaving] = useState(false)
  const [collectionCardsStatus, setCollectionCardsStatus] = useState<'idle' | 'saved' | 'error'>('idle')

  const [collectionTabsSaved, setCollectionTabsSaved] =
    useState<CollectionTabsConfig>(DEFAULT_COLLECTION_TABS)
  const [collectionTabsDraft, setCollectionTabsDraft] =
    useState<CollectionTabsConfig>(DEFAULT_COLLECTION_TABS)
  const [collectionTabsLoading, setCollectionTabsLoading] = useState(true)
  const [collectionTabsSaving, setCollectionTabsSaving] = useState(false)
  const [collectionTabsStatus, setCollectionTabsStatus] = useState<'idle' | 'saved' | 'error'>('idle')

  const [trustBannerSaved, setTrustBannerSaved] = useState<TrustBannerConfig>(DEFAULT_TRUST_BANNER)
  const [trustBannerDraft, setTrustBannerDraft] = useState<TrustBannerConfig>(DEFAULT_TRUST_BANNER)
  const [trustBannerLoading, setTrustBannerLoading] = useState(true)
  const [trustBannerSaving, setTrustBannerSaving] = useState(false)
  const [trustBannerStatus, setTrustBannerStatus] = useState<'idle' | 'saved' | 'error'>('idle')

  const [homeDividerAfterTrustBannerSaved, setHomeDividerAfterTrustBannerSaved] =
    useState<HomeDividerConfig>(DEFAULT_HOME_DIVIDER)
  const [homeDividerAfterTrustBannerDraft, setHomeDividerAfterTrustBannerDraft] =
    useState<HomeDividerConfig>(DEFAULT_HOME_DIVIDER)
  const [homeDividerAfterTrustBannerLoading, setHomeDividerAfterTrustBannerLoading] = useState(true)
  const [homeDividerAfterTrustBannerSaving, setHomeDividerAfterTrustBannerSaving] = useState(false)
  const [homeDividerAfterTrustBannerStatus, setHomeDividerAfterTrustBannerStatus] = useState<
    'idle' | 'saved' | 'error'
  >('idle')

  const [storeFooterSaved, setStoreFooterSaved] = useState<StoreFooterConfig>(DEFAULT_STORE_FOOTER)
  const [storeFooterDraft, setStoreFooterDraft] = useState<StoreFooterConfig>(DEFAULT_STORE_FOOTER)
  const [storeFooterLoading, setStoreFooterLoading] = useState(true)
  const [storeFooterSaving, setStoreFooterSaving] = useState(false)
  const [storeFooterStatus, setStoreFooterStatus] = useState<'idle' | 'saved' | 'error'>('idle')
  const [storeFooterLogoUploading, setStoreFooterLogoUploading] = useState(false)

  const [collectionsListSaved, setCollectionsListSaved] =
    useState<CollectionsListConfig>(DEFAULT_COLLECTIONS_LIST)
  const [collectionsListDraft, setCollectionsListDraft] =
    useState<CollectionsListConfig>(DEFAULT_COLLECTIONS_LIST)
  const [collectionsListLoading, setCollectionsListLoading] = useState(true)
  const [collectionsListSaving, setCollectionsListSaving] = useState(false)
  const [collectionsListStatus, setCollectionsListStatus] = useState<'idle' | 'saved' | 'error'>('idle')

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

  const [floatingButtonsSaved, setFloatingButtonsSaved] =
    useState<FloatingButtonsConfig>(DEFAULT_FLOATING_BUTTONS)
  const [floatingButtonsDraft, setFloatingButtonsDraft] =
    useState<FloatingButtonsConfig>(DEFAULT_FLOATING_BUTTONS)
  const [floatingButtonsLoading, setFloatingButtonsLoading] = useState(true)
  const [floatingButtonsSaving, setFloatingButtonsSaving] = useState(false)
  const [floatingButtonsStatus, setFloatingButtonsStatus] = useState<'idle' | 'saved' | 'error'>(
    'idle'
  )
  const floatingButtonsDraftRef = useRef(floatingButtonsDraft)
  floatingButtonsDraftRef.current = floatingButtonsDraft
  const floatingButtonsSavedRef = useRef(floatingButtonsSaved)
  floatingButtonsSavedRef.current = floatingButtonsSaved
  const saveFloatingButtonsRef = useRef<() => Promise<boolean>>(async () => false)

  const [headerNavSaved, setHeaderNavSaved] =
    useState<HeaderNavSettingsConfig>(DEFAULT_HEADER_NAV_SETTINGS)
  const [headerNavDraft, setHeaderNavDraft] =
    useState<HeaderNavSettingsConfig>(DEFAULT_HEADER_NAV_SETTINGS)
  const [headerNavLoading, setHeaderNavLoading] = useState(true)
  const [headerNavSaving, setHeaderNavSaving] = useState(false)
  const [headerNavStatus, setHeaderNavStatus] = useState<'idle' | 'saved' | 'error'>('idle')
  const [headerSectionSaving, setHeaderSectionSaving] = useState(false)
  const [headerSectionStatus, setHeaderSectionStatus] = useState<'idle' | 'saved' | 'error'>('idle')

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
    let cancelled = false

    void fetch('/api/admin/hero-banner', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : DEFAULT_HERO_BANNER))
      .then((data: HeroBannerConfig) => {
        if (cancelled) return
        setHeroBannerSaved(data)
        setHeroBannerDraft((prev) =>
          heroBannerConfigsEqual(prev, heroBannerSavedRef.current) ? data : prev
        )
      })
      .catch(() => {
        if (cancelled) return
        setHeroBannerSaved(DEFAULT_HERO_BANNER)
        setHeroBannerDraft((prev) =>
          heroBannerConfigsEqual(prev, heroBannerSavedRef.current) ? DEFAULT_HERO_BANNER : prev
        )
      })
      .finally(() => {
        if (!cancelled) setHeroBannerLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    void fetch('/api/admin/home-divider', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : DEFAULT_HOME_DIVIDER))
      .then((data: HomeDividerConfig) => {
        setHomeDividerSaved(data)
        setHomeDividerDraft(data)
      })
      .catch(() => {
        setHomeDividerSaved(DEFAULT_HOME_DIVIDER)
        setHomeDividerDraft(DEFAULT_HOME_DIVIDER)
      })
      .finally(() => setHomeDividerLoading(false))
  }, [])

  useEffect(() => {
    void fetch('/api/admin/home-divider-after-cards', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : DEFAULT_HOME_DIVIDER))
      .then((data: HomeDividerConfig) => {
        setHomeDividerAfterCardsSaved(data)
        setHomeDividerAfterCardsDraft(data)
      })
      .catch(() => {
        setHomeDividerAfterCardsSaved(DEFAULT_HOME_DIVIDER)
        setHomeDividerAfterCardsDraft(DEFAULT_HOME_DIVIDER)
      })
      .finally(() => setHomeDividerAfterCardsLoading(false))
  }, [])

  useEffect(() => {
    void fetch('/api/admin/home-divider-after-tabs', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : DEFAULT_HOME_DIVIDER))
      .then((data: HomeDividerConfig) => {
        setHomeDividerAfterTabsSaved(data)
        setHomeDividerAfterTabsDraft(data)
      })
      .catch(() => {
        setHomeDividerAfterTabsSaved(DEFAULT_HOME_DIVIDER)
        setHomeDividerAfterTabsDraft(DEFAULT_HOME_DIVIDER)
      })
      .finally(() => setHomeDividerAfterTabsLoading(false))
  }, [])

  useEffect(() => {
    void fetch('/api/admin/collection-cards', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : DEFAULT_COLLECTION_CARDS))
      .then((data: CollectionCardsConfig) => {
        setCollectionCardsSaved(data)
        setCollectionCardsDraft(data)
      })
      .catch(() => {
        setCollectionCardsSaved(DEFAULT_COLLECTION_CARDS)
        setCollectionCardsDraft(DEFAULT_COLLECTION_CARDS)
      })
      .finally(() => setCollectionCardsLoading(false))
  }, [])

  useEffect(() => {
    void fetch('/api/admin/collection-tabs', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : DEFAULT_COLLECTION_TABS))
      .then((data: CollectionTabsConfig) => {
        setCollectionTabsSaved(data)
        setCollectionTabsDraft(data)
      })
      .catch(() => {
        setCollectionTabsSaved(DEFAULT_COLLECTION_TABS)
        setCollectionTabsDraft(DEFAULT_COLLECTION_TABS)
      })
      .finally(() => setCollectionTabsLoading(false))
  }, [])

  useEffect(() => {
    void fetch('/api/admin/trust-banner', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : DEFAULT_TRUST_BANNER))
      .then((data: TrustBannerConfig) => {
        setTrustBannerSaved(data)
        setTrustBannerDraft(data)
      })
      .catch(() => {
        setTrustBannerSaved(DEFAULT_TRUST_BANNER)
        setTrustBannerDraft(DEFAULT_TRUST_BANNER)
      })
      .finally(() => setTrustBannerLoading(false))
  }, [])

  useEffect(() => {
    void fetch('/api/admin/home-divider-after-trust-banner', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : DEFAULT_HOME_DIVIDER))
      .then((data: HomeDividerConfig) => {
        setHomeDividerAfterTrustBannerSaved(data)
        setHomeDividerAfterTrustBannerDraft(data)
      })
      .catch(() => {
        setHomeDividerAfterTrustBannerSaved(DEFAULT_HOME_DIVIDER)
        setHomeDividerAfterTrustBannerDraft(DEFAULT_HOME_DIVIDER)
      })
      .finally(() => setHomeDividerAfterTrustBannerLoading(false))
  }, [])

  useEffect(() => {
    void fetch('/api/admin/store-footer', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : DEFAULT_STORE_FOOTER))
      .then((data: StoreFooterConfig) => {
        setStoreFooterSaved(data)
        setStoreFooterDraft(data)
      })
      .catch(() => {
        setStoreFooterSaved(DEFAULT_STORE_FOOTER)
        setStoreFooterDraft(DEFAULT_STORE_FOOTER)
      })
      .finally(() => setStoreFooterLoading(false))
  }, [])

  useEffect(() => {
    void fetch('/api/admin/collections-list', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : DEFAULT_COLLECTIONS_LIST))
      .then((data: CollectionsListConfig) => {
        setCollectionsListSaved(data)
        setCollectionsListDraft(data)
      })
      .catch(() => {
        setCollectionsListSaved(DEFAULT_COLLECTIONS_LIST)
        setCollectionsListDraft(DEFAULT_COLLECTIONS_LIST)
      })
      .finally(() => setCollectionsListLoading(false))
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

  useEffect(() => {
    let cancelled = false

    void fetchFloatingButtons()
      .then((data) => {
        if (cancelled) return
        setFloatingButtonsSaved(data)
        setFloatingButtonsDraft((prev) =>
          floatingButtonsConfigsEqual(prev, floatingButtonsSavedRef.current) ? data : prev
        )
      })
      .catch(() => {
        if (cancelled) return
        setFloatingButtonsSaved(DEFAULT_FLOATING_BUTTONS)
        setFloatingButtonsDraft((prev) =>
          floatingButtonsConfigsEqual(prev, floatingButtonsSavedRef.current)
            ? DEFAULT_FLOATING_BUTTONS
            : prev
        )
      })
      .finally(() => {
        if (!cancelled) setFloatingButtonsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    void fetch('/api/admin/header-settings', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : DEFAULT_HEADER_NAV_SETTINGS))
      .then((data: HeaderNavSettingsConfig) => {
        setHeaderNavSaved(data)
        setHeaderNavDraft(data)
      })
      .catch(() => {
        setHeaderNavSaved(DEFAULT_HEADER_NAV_SETTINGS)
        setHeaderNavDraft(DEFAULT_HEADER_NAV_SETTINGS)
      })
      .finally(() => setHeaderNavLoading(false))
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

  const heroBannerDirty = useMemo(
    () => !heroBannerConfigsEqual(heroBannerSaved, heroBannerDraft),
    [heroBannerSaved, heroBannerDraft]
  )

  const homeDividerDirty = useMemo(
    () => !homeDividerConfigsEqual(homeDividerSaved, homeDividerDraft),
    [homeDividerSaved, homeDividerDraft]
  )

  const homeDividerAfterCardsDirty = useMemo(
    () => !homeDividerConfigsEqual(homeDividerAfterCardsSaved, homeDividerAfterCardsDraft),
    [homeDividerAfterCardsSaved, homeDividerAfterCardsDraft]
  )

  const homeDividerAfterTabsDirty = useMemo(
    () => !homeDividerConfigsEqual(homeDividerAfterTabsSaved, homeDividerAfterTabsDraft),
    [homeDividerAfterTabsSaved, homeDividerAfterTabsDraft]
  )

  const collectionCardsDirty = useMemo(
    () => !collectionCardsConfigsEqual(collectionCardsSaved, collectionCardsDraft),
    [collectionCardsSaved, collectionCardsDraft]
  )

  const collectionTabsDirty = useMemo(
    () => !collectionTabsConfigsEqual(collectionTabsSaved, collectionTabsDraft),
    [collectionTabsSaved, collectionTabsDraft]
  )

  const trustBannerDirty = useMemo(
    () => !trustBannerConfigsEqual(trustBannerSaved, trustBannerDraft),
    [trustBannerSaved, trustBannerDraft]
  )

  const homeDividerAfterTrustBannerDirty = useMemo(
    () => !homeDividerConfigsEqual(homeDividerAfterTrustBannerSaved, homeDividerAfterTrustBannerDraft),
    [homeDividerAfterTrustBannerSaved, homeDividerAfterTrustBannerDraft]
  )

  const storeFooterDirty = useMemo(
    () => !storeFooterConfigsEqual(storeFooterSaved, storeFooterDraft),
    [storeFooterSaved, storeFooterDraft]
  )

  const collectionsListDirty = useMemo(
    () => !collectionsListConfigsEqual(collectionsListSaved, collectionsListDraft),
    [collectionsListSaved, collectionsListDraft]
  )

  const logoFaviconDirty = useMemo(
    () => !configsEqual(logoFaviconSaved, logoFaviconDraft),
    [logoFaviconSaved, logoFaviconDraft]
  )

  const generalSettingsDirty = useMemo(
    () => generalSettingsSaved.backgroundColor !== generalSettingsDraft.backgroundColor,
    [generalSettingsSaved, generalSettingsDraft]
  )

  const floatingButtonsDirty = useMemo(
    () => !floatingButtonsConfigsEqual(floatingButtonsSaved, floatingButtonsDraft),
    [floatingButtonsSaved, floatingButtonsDraft]
  )

  const headerNavDirty = useMemo(
    () =>
      headerNavSaved.menuId !== headerNavDraft.menuId ||
      headerNavSaved.menuHandle !== headerNavDraft.menuHandle ||
      headerNavSaved.linkColor !== headerNavDraft.linkColor ||
      headerNavSaved.linkHoverColor !== headerNavDraft.linkHoverColor ||
      headerNavSaved.linkActiveColor !== headerNavDraft.linkActiveColor ||
      headerNavSaved.linkActiveUnderlineColor !== headerNavDraft.linkActiveUnderlineColor ||
      headerNavSaved.navBorderColor !== headerNavDraft.navBorderColor ||
      !menuHighlightsEqual(headerNavSaved.menuHighlights, headerNavDraft.menuHighlights),
    [headerNavSaved, headerNavDraft]
  )

  const headerSectionDirty = logoFaviconDirty || headerNavDirty

  const isDetailPanelOpen = activeSection !== null || activeGlobalSetting !== null

  const openSection = useCallback((id: AdminSectionId) => {
    setSidebarTab('sections')
    setActiveGlobalSetting(null)
    setActiveSection(id)
    if (id === 'collections-list') {
      const page = getThemePageById('collections-list')
      setActiveThemePageId(page.id)
      setPreviewPathState(page.path)
    } else if (
      id === 'announcement' ||
      id === 'header' ||
      id === 'hero-banner' ||
      id === 'home-divider' ||
      id === 'collection-cards' ||
      id === 'home-divider-after-cards' ||
      id === 'collection-tabs' ||
      id === 'home-divider-after-tabs' ||
      id === 'trust-banner' ||
      id === 'home-divider-after-trust-banner' ||
      id === 'store-footer'
    ) {
      const page = getThemePageById('home')
      setActiveThemePageId(page.id)
      setPreviewPathState(page.path)
    }
    setAnnouncementStatus('idle')
    setHeroBannerStatus('idle')
    setLogoFaviconStatus('idle')
    setHeaderNavStatus('idle')
    setHeaderSectionStatus('idle')
  }, [])

  const closeSection = useCallback(() => {
    setActiveSection(null)
    setAnnouncementStatus('idle')
    setHeroBannerStatus('idle')
    setLogoFaviconStatus('idle')
    setHeaderNavStatus('idle')
    setHeaderSectionStatus('idle')
  }, [])

  const openGlobalSetting = useCallback((id: AdminGlobalSettingId) => {
    setSidebarTab('global')
    setActiveSection(null)
    setActiveGlobalSetting(id)
    setLogoFaviconStatus('idle')
    setGeneralSettingsStatus('idle')
  }, [])

  const closeGlobalSetting = useCallback(() => {
    if (
      activeGlobalSetting === 'floating-buttons' &&
      !floatingButtonsConfigsEqual(floatingButtonsSavedRef.current, floatingButtonsDraftRef.current)
    ) {
      void saveFloatingButtonsRef.current()
    }
    setActiveGlobalSetting(null)
    setLogoFaviconStatus('idle')
    setGeneralSettingsStatus('idle')
  }, [activeGlobalSetting])

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

  const updateHeroBannerDraft = useCallback(
    (patch: Partial<HeroBannerConfig> | ((prev: HeroBannerConfig) => Partial<HeroBannerConfig>)) => {
      setHeroBannerDraft((prev) => ({
        ...prev,
        ...(typeof patch === 'function' ? patch(prev) : patch),
      }))
      setHeroBannerStatus('idle')
    },
    []
  )

  const saveHeroBanner = useCallback(async () => {
    const draft = heroBannerDraftRef.current
    setHeroBannerSaving(true)
    setHeroBannerStatus('idle')
    try {
      const res = await fetch('/api/admin/hero-banner', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draft),
      })
      if (!res.ok) throw new Error('Save failed')
      const data = (await res.json()) as HeroBannerConfig
      setHeroBannerSaved(data)
      setHeroBannerDraft(data)
      setHeroBannerStatus('saved')
      return true
    } catch {
      setHeroBannerStatus('error')
      return false
    } finally {
      setHeroBannerSaving(false)
    }
  }, [])

  const updateHomeDividerDraft = useCallback((patch: Partial<HomeDividerConfig>) => {
    setHomeDividerDraft((prev) => ({ ...prev, ...patch }))
    setHomeDividerStatus('idle')
  }, [])

  const saveHomeDivider = useCallback(async () => {
    setHomeDividerSaving(true)
    setHomeDividerStatus('idle')
    try {
      const res = await fetch('/api/admin/home-divider', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(homeDividerDraft),
      })
      if (!res.ok) throw new Error('Save failed')
      const data = (await res.json()) as HomeDividerConfig
      setHomeDividerSaved(data)
      setHomeDividerDraft(data)
      setHomeDividerStatus('saved')
      return true
    } catch {
      setHomeDividerStatus('error')
      return false
    } finally {
      setHomeDividerSaving(false)
    }
  }, [homeDividerDraft])

  const updateHomeDividerAfterCardsDraft = useCallback((patch: Partial<HomeDividerConfig>) => {
    setHomeDividerAfterCardsDraft((prev) => ({ ...prev, ...patch }))
    setHomeDividerAfterCardsStatus('idle')
  }, [])

  const saveHomeDividerAfterCards = useCallback(async () => {
    setHomeDividerAfterCardsSaving(true)
    setHomeDividerAfterCardsStatus('idle')
    try {
      const res = await fetch('/api/admin/home-divider-after-cards', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(homeDividerAfterCardsDraft),
      })
      if (!res.ok) throw new Error('Save failed')
      const data = (await res.json()) as HomeDividerConfig
      setHomeDividerAfterCardsSaved(data)
      setHomeDividerAfterCardsDraft(data)
      setHomeDividerAfterCardsStatus('saved')
      return true
    } catch {
      setHomeDividerAfterCardsStatus('error')
      return false
    } finally {
      setHomeDividerAfterCardsSaving(false)
    }
  }, [homeDividerAfterCardsDraft])

  const updateHomeDividerAfterTabsDraft = useCallback((patch: Partial<HomeDividerConfig>) => {
    setHomeDividerAfterTabsDraft((prev) => ({ ...prev, ...patch }))
    setHomeDividerAfterTabsStatus('idle')
  }, [])

  const saveHomeDividerAfterTabs = useCallback(async () => {
    setHomeDividerAfterTabsSaving(true)
    setHomeDividerAfterTabsStatus('idle')
    try {
      const res = await fetch('/api/admin/home-divider-after-tabs', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(homeDividerAfterTabsDraft),
      })
      if (!res.ok) throw new Error('Save failed')
      const data = (await res.json()) as HomeDividerConfig
      setHomeDividerAfterTabsSaved(data)
      setHomeDividerAfterTabsDraft(data)
      setHomeDividerAfterTabsStatus('saved')
      return true
    } catch {
      setHomeDividerAfterTabsStatus('error')
      return false
    } finally {
      setHomeDividerAfterTabsSaving(false)
    }
  }, [homeDividerAfterTabsDraft])

  const updateCollectionCardsDraft = useCallback((patch: Partial<CollectionCardsConfig>) => {
    setCollectionCardsDraft((prev) => ({ ...prev, ...patch }))
    setCollectionCardsStatus('idle')
  }, [])

  const saveCollectionCards = useCallback(async () => {
    setCollectionCardsSaving(true)
    setCollectionCardsStatus('idle')
    try {
      const res = await fetch('/api/admin/collection-cards', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(collectionCardsDraft),
      })
      if (!res.ok) throw new Error('Save failed')
      const data = (await res.json()) as CollectionCardsConfig
      setCollectionCardsSaved(data)
      setCollectionCardsDraft(data)
      setCollectionCardsStatus('saved')
      return true
    } catch {
      setCollectionCardsStatus('error')
      return false
    } finally {
      setCollectionCardsSaving(false)
    }
  }, [collectionCardsDraft])

  const updateCollectionTabsDraft = useCallback((patch: Partial<CollectionTabsConfig>) => {
    setCollectionTabsDraft((prev) => ({ ...prev, ...patch }))
    setCollectionTabsStatus('idle')
  }, [])

  const saveCollectionTabs = useCallback(async () => {
    setCollectionTabsSaving(true)
    setCollectionTabsStatus('idle')
    try {
      const res = await fetch('/api/admin/collection-tabs', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(collectionTabsDraft),
      })
      if (!res.ok) throw new Error('Save failed')
      const data = (await res.json()) as CollectionTabsConfig
      setCollectionTabsSaved(data)
      setCollectionTabsDraft(data)
      setCollectionTabsStatus('saved')
      return true
    } catch {
      setCollectionTabsStatus('error')
      return false
    } finally {
      setCollectionTabsSaving(false)
    }
  }, [collectionTabsDraft])

  const updateTrustBannerDraft = useCallback((patch: Partial<TrustBannerConfig>) => {
    setTrustBannerDraft((prev) => ({ ...prev, ...patch }))
    setTrustBannerStatus('idle')
  }, [])

  const saveTrustBanner = useCallback(async () => {
    setTrustBannerSaving(true)
    setTrustBannerStatus('idle')
    try {
      const res = await fetch('/api/admin/trust-banner', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(trustBannerDraft),
      })
      if (!res.ok) throw new Error('Save failed')
      const data = (await res.json()) as TrustBannerConfig
      setTrustBannerSaved(data)
      setTrustBannerDraft(data)
      setTrustBannerStatus('saved')
      return true
    } catch {
      setTrustBannerStatus('error')
      return false
    } finally {
      setTrustBannerSaving(false)
    }
  }, [trustBannerDraft])

  const updateHomeDividerAfterTrustBannerDraft = useCallback((patch: Partial<HomeDividerConfig>) => {
    setHomeDividerAfterTrustBannerDraft((prev) => ({ ...prev, ...patch }))
    setHomeDividerAfterTrustBannerStatus('idle')
  }, [])

  const saveHomeDividerAfterTrustBanner = useCallback(async () => {
    setHomeDividerAfterTrustBannerSaving(true)
    setHomeDividerAfterTrustBannerStatus('idle')
    try {
      const res = await fetch('/api/admin/home-divider-after-trust-banner', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(homeDividerAfterTrustBannerDraft),
      })
      if (!res.ok) throw new Error('Save failed')
      const data = (await res.json()) as HomeDividerConfig
      setHomeDividerAfterTrustBannerSaved(data)
      setHomeDividerAfterTrustBannerDraft(data)
      setHomeDividerAfterTrustBannerStatus('saved')
      return true
    } catch {
      setHomeDividerAfterTrustBannerStatus('error')
      return false
    } finally {
      setHomeDividerAfterTrustBannerSaving(false)
    }
  }, [homeDividerAfterTrustBannerDraft])

  const updateStoreFooterDraft = useCallback((patch: Partial<StoreFooterConfig>) => {
    setStoreFooterDraft((prev) => ({ ...prev, ...patch }))
    setStoreFooterStatus('idle')
  }, [])

  const uploadStoreFooterLogo = useCallback(
    async (file: File) => {
      setStoreFooterLogoUploading(true)
      setStoreFooterStatus('idle')
      try {
        const form = new FormData()
        form.append('file', file)
        form.append('folder', 'logo')

        const res = await fetch('/api/admin/upload', { method: 'POST', body: form })
        if (!res.ok) throw new Error('Upload failed')
        const data = (await res.json()) as { url: string; fileName: string }
        updateStoreFooterDraft({ logoUrl: data.url, logoFileName: data.fileName })
      } catch {
        setStoreFooterStatus('error')
      } finally {
        setStoreFooterLogoUploading(false)
      }
    },
    [updateStoreFooterDraft]
  )

  const saveStoreFooter = useCallback(async () => {
    setStoreFooterSaving(true)
    setStoreFooterStatus('idle')
    try {
      const res = await fetch('/api/admin/store-footer', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(storeFooterDraft),
      })
      if (!res.ok) throw new Error('Save failed')
      const data = (await res.json()) as StoreFooterConfig
      setStoreFooterSaved(data)
      setStoreFooterDraft(data)
      setStoreFooterStatus('saved')
      return true
    } catch {
      setStoreFooterStatus('error')
      return false
    } finally {
      setStoreFooterSaving(false)
    }
  }, [storeFooterDraft])

  const updateCollectionsListDraft = useCallback((patch: Partial<CollectionsListConfig>) => {
    setCollectionsListDraft((prev) => ({ ...prev, ...patch }))
    setCollectionsListStatus('idle')
  }, [])

  const saveCollectionsList = useCallback(async () => {
    setCollectionsListSaving(true)
    setCollectionsListStatus('idle')
    try {
      const res = await fetch('/api/admin/collections-list', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(collectionsListDraft),
      })
      if (!res.ok) throw new Error('Save failed')
      const data = (await res.json()) as CollectionsListConfig
      setCollectionsListSaved(data)
      setCollectionsListDraft(data)
      setCollectionsListStatus('saved')
      return true
    } catch {
      setCollectionsListStatus('error')
      return false
    } finally {
      setCollectionsListSaving(false)
    }
  }, [collectionsListDraft])

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

  const updateFloatingButtonsDraft = useCallback((patch: Partial<FloatingButtonsConfig>) => {
    setFloatingButtonsDraft((prev) => ({ ...prev, ...patch }))
    setFloatingButtonsStatus('idle')
  }, [])

  const saveFloatingButtons = useCallback(async () => {
    setFloatingButtonsSaving(true)
    setFloatingButtonsStatus('idle')
    try {
      const data = await persistFloatingButtons(floatingButtonsDraftRef.current)
      setFloatingButtonsSaved(data)
      setFloatingButtonsDraft(data)
      setFloatingButtonsStatus('saved')
      return true
    } catch {
      setFloatingButtonsStatus('error')
      return false
    } finally {
      setFloatingButtonsSaving(false)
    }
  }, [])

  saveFloatingButtonsRef.current = saveFloatingButtons

  useEffect(() => {
    if (activeGlobalSetting !== 'floating-buttons') return
    if (!floatingButtonsDirty) return

    const timer = window.setTimeout(() => {
      void saveFloatingButtonsRef.current()
    }, FLOATING_BUTTONS_AUTOSAVE_MS)

    return () => window.clearTimeout(timer)
  }, [activeGlobalSetting, floatingButtonsDraft, floatingButtonsDirty])

  const updateHeaderNavDraft = useCallback((patch: Partial<HeaderNavSettingsConfig>) => {
    setHeaderNavDraft((prev) => ({ ...prev, ...patch }))
    setHeaderNavStatus('idle')
    setHeaderSectionStatus('idle')
  }, [])

  const saveHeaderNavSettings = useCallback(async () => {
    setHeaderNavSaving(true)
    setHeaderNavStatus('idle')
    try {
      const res = await fetch('/api/admin/header-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(headerNavDraft),
      })
      if (!res.ok) throw new Error('Save failed')
      const data = (await res.json()) as HeaderNavSettingsConfig
      setHeaderNavSaved(data)
      setHeaderNavDraft(data)
      setHeaderNavStatus('saved')
      return true
    } catch {
      setHeaderNavStatus('error')
      return false
    } finally {
      setHeaderNavSaving(false)
    }
  }, [headerNavDraft])

  const saveHeaderSection = useCallback(async () => {
    setHeaderSectionSaving(true)
    setHeaderSectionStatus('idle')
    setLogoFaviconStatus('idle')
    setHeaderNavStatus('idle')
    try {
      let ok = true
      if (logoFaviconDirty) {
        ok = (await saveLogoFavicon()) && ok
      }
      if (headerNavDirty) {
        ok = (await saveHeaderNavSettings()) && ok
      }
      setHeaderSectionStatus(ok ? 'saved' : 'error')
      return ok
    } catch {
      setHeaderSectionStatus('error')
      return false
    } finally {
      setHeaderSectionSaving(false)
    }
  }, [headerNavDirty, logoFaviconDirty, saveHeaderNavSettings, saveLogoFavicon])

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
      heroBannerLoading,
      heroBannerSaving,
      heroBannerSaved,
      heroBannerDraft,
      heroBannerDirty,
      heroBannerStatus,
      updateHeroBannerDraft,
      saveHeroBanner,
      homeDividerLoading,
      homeDividerSaving,
      homeDividerSaved,
      homeDividerDraft,
      homeDividerDirty,
      homeDividerStatus,
      updateHomeDividerDraft,
      saveHomeDivider,
      homeDividerAfterCardsLoading,
      homeDividerAfterCardsSaving,
      homeDividerAfterCardsSaved,
      homeDividerAfterCardsDraft,
      homeDividerAfterCardsDirty,
      homeDividerAfterCardsStatus,
      updateHomeDividerAfterCardsDraft,
      saveHomeDividerAfterCards,
      homeDividerAfterTabsLoading,
      homeDividerAfterTabsSaving,
      homeDividerAfterTabsSaved,
      homeDividerAfterTabsDraft,
      homeDividerAfterTabsDirty,
      homeDividerAfterTabsStatus,
      updateHomeDividerAfterTabsDraft,
      saveHomeDividerAfterTabs,
      collectionCardsLoading,
      collectionCardsSaving,
      collectionCardsSaved,
      collectionCardsDraft,
      collectionCardsDirty,
      collectionCardsStatus,
      updateCollectionCardsDraft,
      saveCollectionCards,
      collectionTabsLoading,
      collectionTabsSaving,
      collectionTabsSaved,
      collectionTabsDraft,
      collectionTabsDirty,
      collectionTabsStatus,
      updateCollectionTabsDraft,
      saveCollectionTabs,
      trustBannerLoading,
      trustBannerSaving,
      trustBannerSaved,
      trustBannerDraft,
      trustBannerDirty,
      trustBannerStatus,
      updateTrustBannerDraft,
      saveTrustBanner,
      homeDividerAfterTrustBannerLoading,
      homeDividerAfterTrustBannerSaving,
      homeDividerAfterTrustBannerSaved,
      homeDividerAfterTrustBannerDraft,
      homeDividerAfterTrustBannerDirty,
      homeDividerAfterTrustBannerStatus,
      updateHomeDividerAfterTrustBannerDraft,
      saveHomeDividerAfterTrustBanner,
      storeFooterLoading,
      storeFooterSaving,
      storeFooterSaved,
      storeFooterDraft,
      storeFooterDirty,
      storeFooterStatus,
      storeFooterLogoUploading,
      updateStoreFooterDraft,
      uploadStoreFooterLogo,
      saveStoreFooter,
      collectionsListLoading,
      collectionsListSaving,
      collectionsListSaved,
      collectionsListDraft,
      collectionsListDirty,
      collectionsListStatus,
      updateCollectionsListDraft,
      saveCollectionsList,
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
      headerNavLoading,
      headerNavSaving,
      headerNavSaved,
      headerNavDraft,
      headerNavDirty,
      headerNavStatus,
      updateHeaderNavDraft,
      saveHeaderNavSettings,
      saveHeaderSection,
      headerSectionDirty,
      headerSectionSaving,
      headerSectionStatus,
      generalSettingsLoading,
      generalSettingsSaving,
      generalSettingsSaved,
      generalSettingsDraft,
      generalSettingsDirty,
      generalSettingsStatus,
      updateGeneralSettingsDraft,
      saveGeneralSettings,
      floatingButtonsLoading,
      floatingButtonsSaving,
      floatingButtonsSaved,
      floatingButtonsDraft,
      floatingButtonsDirty,
      floatingButtonsStatus,
      updateFloatingButtonsDraft,
      saveFloatingButtons,
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
      heroBannerLoading,
      heroBannerSaving,
      heroBannerSaved,
      heroBannerDraft,
      heroBannerDirty,
      heroBannerStatus,
      updateHeroBannerDraft,
      saveHeroBanner,
      homeDividerLoading,
      homeDividerSaving,
      homeDividerSaved,
      homeDividerDraft,
      homeDividerDirty,
      homeDividerStatus,
      updateHomeDividerDraft,
      saveHomeDivider,
      homeDividerAfterCardsLoading,
      homeDividerAfterCardsSaving,
      homeDividerAfterCardsSaved,
      homeDividerAfterCardsDraft,
      homeDividerAfterCardsDirty,
      homeDividerAfterCardsStatus,
      updateHomeDividerAfterCardsDraft,
      saveHomeDividerAfterCards,
      homeDividerAfterTabsLoading,
      homeDividerAfterTabsSaving,
      homeDividerAfterTabsSaved,
      homeDividerAfterTabsDraft,
      homeDividerAfterTabsDirty,
      homeDividerAfterTabsStatus,
      updateHomeDividerAfterTabsDraft,
      saveHomeDividerAfterTabs,
      collectionCardsLoading,
      collectionCardsSaving,
      collectionCardsSaved,
      collectionCardsDraft,
      collectionCardsDirty,
      collectionCardsStatus,
      updateCollectionCardsDraft,
      saveCollectionCards,
      collectionTabsLoading,
      collectionTabsSaving,
      collectionTabsSaved,
      collectionTabsDraft,
      collectionTabsDirty,
      collectionTabsStatus,
      updateCollectionTabsDraft,
      saveCollectionTabs,
      trustBannerLoading,
      trustBannerSaving,
      trustBannerSaved,
      trustBannerDraft,
      trustBannerDirty,
      trustBannerStatus,
      updateTrustBannerDraft,
      saveTrustBanner,
      homeDividerAfterTrustBannerLoading,
      homeDividerAfterTrustBannerSaving,
      homeDividerAfterTrustBannerSaved,
      homeDividerAfterTrustBannerDraft,
      homeDividerAfterTrustBannerDirty,
      homeDividerAfterTrustBannerStatus,
      updateHomeDividerAfterTrustBannerDraft,
      saveHomeDividerAfterTrustBanner,
      storeFooterLoading,
      storeFooterSaving,
      storeFooterSaved,
      storeFooterDraft,
      storeFooterDirty,
      storeFooterStatus,
      storeFooterLogoUploading,
      updateStoreFooterDraft,
      uploadStoreFooterLogo,
      saveStoreFooter,
      collectionsListLoading,
      collectionsListSaving,
      collectionsListSaved,
      collectionsListDraft,
      collectionsListDirty,
      collectionsListStatus,
      updateCollectionsListDraft,
      saveCollectionsList,
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
      headerNavLoading,
      headerNavSaving,
      headerNavSaved,
      headerNavDraft,
      headerNavDirty,
      headerNavStatus,
      updateHeaderNavDraft,
      saveHeaderNavSettings,
      saveHeaderSection,
      headerSectionDirty,
      headerSectionSaving,
      headerSectionStatus,
      generalSettingsLoading,
      generalSettingsSaving,
      generalSettingsSaved,
      generalSettingsDraft,
      generalSettingsDirty,
      generalSettingsStatus,
      updateGeneralSettingsDraft,
      saveGeneralSettings,
      floatingButtonsLoading,
      floatingButtonsSaving,
      floatingButtonsSaved,
      floatingButtonsDraft,
      floatingButtonsDirty,
      floatingButtonsStatus,
      updateFloatingButtonsDraft,
      saveFloatingButtons,
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
