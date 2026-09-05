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
  badgesConfigsEqual,
  DEFAULT_BADGES,
  type BadgesConfig,
} from '@/lib/badges'
import {
  BADGES_AUTOSAVE_MS,
  fetchBadgesSettings,
  persistBadgesSettings,
} from '@/lib/badges-client'
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
import {
  collectionProductsConfigsEqual,
  DEFAULT_COLLECTION_PRODUCTS,
  parseCollectionHandleFromPath,
  type CollectionProductsConfig,
} from '@/lib/collection-products'
import {
  fetchCollectionProductsSettings,
  persistCollectionProductsSettings,
} from '@/lib/collection-products-client'
import {
  DEFAULT_PRODUCT_PAGE,
  parseProductHandleFromPath,
  productPageConfigsEqual,
  type ProductPageConfig,
} from '@/lib/product-page'
import {
  fetchProductPageSettings,
  persistProductPageSettings,
} from '@/lib/product-page-client'
import {
  DEFAULT_RELATED_PRODUCTS,
  relatedProductsConfigsEqual,
  type RelatedProductsConfig,
} from '@/lib/related-products'
import {
  fetchRelatedProductsSettings,
  persistRelatedProductsSettings,
} from '@/lib/related-products-client'
import {
  DEFAULT_RECENT_PRODUCTS,
  recentProductsConfigsEqual,
  type RecentProductsConfig,
} from '@/lib/recent-products'
import {
  fetchRecentProductsSettings,
  persistRecentProductsSettings,
} from '@/lib/recent-products-client'
import {
  DEFAULT_SEARCH,
  searchConfigsEqual,
  type SearchConfig,
} from '@/lib/search'
import { fetchSearchSettings, persistSearchSettings } from '@/lib/search-client'
import {
  DEFAULT_CART,
  cartConfigsEqual,
  type CartConfig,
} from '@/lib/cart'
import { fetchCartSettings, persistCartSettings } from '@/lib/cart-client'
import {
  DEFAULT_CHECKOUT,
  checkoutConfigsEqual,
  type CheckoutConfig,
} from '@/lib/checkout'
import { fetchCheckoutSettings, persistCheckoutSettings } from '@/lib/checkout-client'
import { clearStoreSettingsBrowserCaches } from '@/lib/store-settings-cache'
import { DEFAULT_LOGO_FAVICON, type LogoFaviconConfig } from '@/lib/logo-favicon'
import { uploadAdminStoreAsset } from '@/lib/admin-store-upload'
import { dispatchStoreThemeRefresh } from '@/lib/store-theme-client'
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
  | 'home-divider-after-product'
  | 'home-divider-after-related-products'
  | 'store-footer'
  | 'collections-list'
  | 'collection-products'
  | 'product-page'
  | 'related-products'
  | 'recent-products'
  | 'search'
  | 'cart'
  | 'checkout'
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
  homeDividerAfterProductLoading: boolean
  homeDividerAfterProductSaving: boolean
  homeDividerAfterProductSaved: HomeDividerConfig
  homeDividerAfterProductDraft: HomeDividerConfig
  homeDividerAfterProductDirty: boolean
  homeDividerAfterProductStatus: 'idle' | 'saved' | 'error'
  updateHomeDividerAfterProductDraft: (patch: Partial<HomeDividerConfig>) => void
  saveHomeDividerAfterProduct: () => Promise<boolean>
  homeDividerAfterRelatedProductsLoading: boolean
  homeDividerAfterRelatedProductsSaving: boolean
  homeDividerAfterRelatedProductsSaved: HomeDividerConfig
  homeDividerAfterRelatedProductsDraft: HomeDividerConfig
  homeDividerAfterRelatedProductsDirty: boolean
  homeDividerAfterRelatedProductsStatus: 'idle' | 'saved' | 'error'
  updateHomeDividerAfterRelatedProductsDraft: (patch: Partial<HomeDividerConfig>) => void
  saveHomeDividerAfterRelatedProducts: () => Promise<boolean>
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
  collectionProductsLoading: boolean
  collectionProductsSaving: boolean
  collectionProductsSaved: CollectionProductsConfig
  collectionProductsDraft: CollectionProductsConfig
  collectionProductsDirty: boolean
  collectionProductsStatus: 'idle' | 'saved' | 'error'
  collectionProductsErrorMessage: string | null
  updateCollectionProductsDraft: (patch: Partial<CollectionProductsConfig>) => void
  saveCollectionProducts: () => Promise<boolean>
  productPageLoading: boolean
  productPageSaving: boolean
  productPageSaved: ProductPageConfig
  productPageDraft: ProductPageConfig
  productPageDirty: boolean
  productPageStatus: 'idle' | 'saved' | 'error'
  updateProductPageDraft: (patch: Partial<ProductPageConfig>) => void
  saveProductPage: () => Promise<boolean>
  relatedProductsLoading: boolean
  relatedProductsSaving: boolean
  relatedProductsSaved: RelatedProductsConfig
  relatedProductsDraft: RelatedProductsConfig
  relatedProductsDirty: boolean
  relatedProductsStatus: 'idle' | 'saved' | 'error'
  updateRelatedProductsDraft: (patch: Partial<RelatedProductsConfig>) => void
  saveRelatedProducts: () => Promise<boolean>
  recentProductsLoading: boolean
  recentProductsSaving: boolean
  recentProductsSaved: RecentProductsConfig
  recentProductsDraft: RecentProductsConfig
  recentProductsDirty: boolean
  recentProductsStatus: 'idle' | 'saved' | 'error'
  updateRecentProductsDraft: (patch: Partial<RecentProductsConfig>) => void
  saveRecentProducts: () => Promise<boolean>
  searchLoading: boolean
  searchSaving: boolean
  searchSaved: SearchConfig
  searchDraft: SearchConfig
  searchDirty: boolean
  searchStatus: 'idle' | 'saved' | 'error'
  updateSearchDraft: (patch: Partial<SearchConfig>) => void
  saveSearch: () => Promise<boolean>
  cartLoading: boolean
  cartSaving: boolean
  cartSaved: CartConfig
  cartDraft: CartConfig
  cartDirty: boolean
  cartStatus: 'idle' | 'saved' | 'error'
  updateCartDraft: (patch: Partial<CartConfig>) => void
  saveCart: () => Promise<boolean>
  checkoutLoading: boolean
  checkoutSaving: boolean
  checkoutSaved: CheckoutConfig
  checkoutDraft: CheckoutConfig
  checkoutDirty: boolean
  checkoutStatus: 'idle' | 'saved' | 'error'
  updateCheckoutDraft: (patch: Partial<CheckoutConfig>) => void
  saveCheckout: () => Promise<boolean>
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
  badgesLoading: boolean
  badgesSaving: boolean
  badgesSaved: BadgesConfig
  badgesDraft: BadgesConfig
  badgesDirty: boolean
  badgesStatus: 'idle' | 'saved' | 'error'
  updateBadgesDraft: (patch: Partial<BadgesConfig>) => void
  saveBadges: () => Promise<boolean>
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

  const [homeDividerAfterProductSaved, setHomeDividerAfterProductSaved] =
    useState<HomeDividerConfig>(DEFAULT_HOME_DIVIDER)
  const [homeDividerAfterProductDraft, setHomeDividerAfterProductDraft] =
    useState<HomeDividerConfig>(DEFAULT_HOME_DIVIDER)
  const [homeDividerAfterProductLoading, setHomeDividerAfterProductLoading] = useState(true)
  const [homeDividerAfterProductSaving, setHomeDividerAfterProductSaving] = useState(false)
  const [homeDividerAfterProductStatus, setHomeDividerAfterProductStatus] = useState<
    'idle' | 'saved' | 'error'
  >('idle')

  const [homeDividerAfterRelatedProductsSaved, setHomeDividerAfterRelatedProductsSaved] =
    useState<HomeDividerConfig>(DEFAULT_HOME_DIVIDER)
  const [homeDividerAfterRelatedProductsDraft, setHomeDividerAfterRelatedProductsDraft] =
    useState<HomeDividerConfig>(DEFAULT_HOME_DIVIDER)
  const [homeDividerAfterRelatedProductsLoading, setHomeDividerAfterRelatedProductsLoading] =
    useState(true)
  const [homeDividerAfterRelatedProductsSaving, setHomeDividerAfterRelatedProductsSaving] =
    useState(false)
  const [homeDividerAfterRelatedProductsStatus, setHomeDividerAfterRelatedProductsStatus] =
    useState<'idle' | 'saved' | 'error'>('idle')

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

  const [collectionProductsSaved, setCollectionProductsSaved] =
    useState<CollectionProductsConfig>(DEFAULT_COLLECTION_PRODUCTS)
  const [collectionProductsDraft, setCollectionProductsDraft] =
    useState<CollectionProductsConfig>(DEFAULT_COLLECTION_PRODUCTS)
  const [collectionProductsLoading, setCollectionProductsLoading] = useState(true)
  const [collectionProductsSaving, setCollectionProductsSaving] = useState(false)
  const [collectionProductsStatus, setCollectionProductsStatus] = useState<
    'idle' | 'saved' | 'error'
  >('idle')
  const [collectionProductsErrorMessage, setCollectionProductsErrorMessage] = useState<string | null>(
    null
  )
  const collectionProductsDraftRef = useRef(collectionProductsDraft)
  collectionProductsDraftRef.current = collectionProductsDraft
  const collectionProductsSavedRef = useRef(collectionProductsSaved)
  collectionProductsSavedRef.current = collectionProductsSaved
  const saveCollectionProductsRef = useRef<() => Promise<boolean>>(async () => false)
  /** After a successful save, ignore late initial GETs that would flip toggles back. */
  const collectionProductsLocalAuthorityRef = useRef(false)

  const [productPageSaved, setProductPageSaved] = useState<ProductPageConfig>(DEFAULT_PRODUCT_PAGE)
  const [productPageDraft, setProductPageDraft] = useState<ProductPageConfig>(DEFAULT_PRODUCT_PAGE)
  const [productPageLoading, setProductPageLoading] = useState(true)
  const [productPageSaving, setProductPageSaving] = useState(false)
  const [productPageStatus, setProductPageStatus] = useState<'idle' | 'saved' | 'error'>('idle')
  const productPageDraftRef = useRef(productPageDraft)
  productPageDraftRef.current = productPageDraft
  const productPageSavedRef = useRef(productPageSaved)
  productPageSavedRef.current = productPageSaved
  const saveProductPageRef = useRef<() => Promise<boolean>>(async () => false)
  const productPageLocalAuthorityRef = useRef(false)

  const [relatedProductsSaved, setRelatedProductsSaved] =
    useState<RelatedProductsConfig>(DEFAULT_RELATED_PRODUCTS)
  const [relatedProductsDraft, setRelatedProductsDraft] =
    useState<RelatedProductsConfig>(DEFAULT_RELATED_PRODUCTS)
  const [relatedProductsLoading, setRelatedProductsLoading] = useState(true)
  const [relatedProductsSaving, setRelatedProductsSaving] = useState(false)
  const [relatedProductsStatus, setRelatedProductsStatus] = useState<'idle' | 'saved' | 'error'>(
    'idle'
  )
  const relatedProductsDraftRef = useRef(relatedProductsDraft)
  relatedProductsDraftRef.current = relatedProductsDraft
  const relatedProductsSavedRef = useRef(relatedProductsSaved)
  relatedProductsSavedRef.current = relatedProductsSaved
  const saveRelatedProductsRef = useRef<() => Promise<boolean>>(async () => false)
  const relatedProductsLocalAuthorityRef = useRef(false)

  const [recentProductsSaved, setRecentProductsSaved] =
    useState<RecentProductsConfig>(DEFAULT_RECENT_PRODUCTS)
  const [recentProductsDraft, setRecentProductsDraft] =
    useState<RecentProductsConfig>(DEFAULT_RECENT_PRODUCTS)
  const [recentProductsLoading, setRecentProductsLoading] = useState(true)
  const [recentProductsSaving, setRecentProductsSaving] = useState(false)
  const [recentProductsStatus, setRecentProductsStatus] = useState<'idle' | 'saved' | 'error'>(
    'idle'
  )
  const recentProductsDraftRef = useRef(recentProductsDraft)
  recentProductsDraftRef.current = recentProductsDraft
  const recentProductsSavedRef = useRef(recentProductsSaved)
  recentProductsSavedRef.current = recentProductsSaved
  const saveRecentProductsRef = useRef<() => Promise<boolean>>(async () => false)
  const recentProductsLocalAuthorityRef = useRef(false)

  const [searchSaved, setSearchSaved] = useState<SearchConfig>(DEFAULT_SEARCH)
  const [searchDraft, setSearchDraft] = useState<SearchConfig>(DEFAULT_SEARCH)
  const [searchLoading, setSearchLoading] = useState(true)
  const [searchSaving, setSearchSaving] = useState(false)
  const [searchStatus, setSearchStatus] = useState<'idle' | 'saved' | 'error'>('idle')
  const searchDraftRef = useRef(searchDraft)
  searchDraftRef.current = searchDraft
  const searchSavedRef = useRef(searchSaved)
  searchSavedRef.current = searchSaved
  const saveSearchRef = useRef<() => Promise<boolean>>(async () => false)
  const searchLocalAuthorityRef = useRef(false)

  const [cartSaved, setCartSaved] = useState<CartConfig>(DEFAULT_CART)
  const [cartDraft, setCartDraft] = useState<CartConfig>(DEFAULT_CART)
  const [cartLoading, setCartLoading] = useState(true)
  const [cartSaving, setCartSaving] = useState(false)
  const [cartStatus, setCartStatus] = useState<'idle' | 'saved' | 'error'>('idle')
  const cartDraftRef = useRef(cartDraft)
  cartDraftRef.current = cartDraft
  const cartSavedRef = useRef(cartSaved)
  cartSavedRef.current = cartSaved
  const saveCartRef = useRef<() => Promise<boolean>>(async () => false)
  const cartLocalAuthorityRef = useRef(false)

  const [checkoutSaved, setCheckoutSaved] = useState<CheckoutConfig>(DEFAULT_CHECKOUT)
  const [checkoutDraft, setCheckoutDraft] = useState<CheckoutConfig>(DEFAULT_CHECKOUT)
  const [checkoutLoading, setCheckoutLoading] = useState(true)
  const [checkoutSaving, setCheckoutSaving] = useState(false)
  const [checkoutStatus, setCheckoutStatus] = useState<'idle' | 'saved' | 'error'>('idle')
  const checkoutDraftRef = useRef(checkoutDraft)
  checkoutDraftRef.current = checkoutDraft
  const checkoutSavedRef = useRef(checkoutSaved)
  checkoutSavedRef.current = checkoutSaved
  const saveCheckoutRef = useRef<() => Promise<boolean>>(async () => false)
  const checkoutLocalAuthorityRef = useRef(false)

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

  const [badgesSaved, setBadgesSaved] = useState<BadgesConfig>(DEFAULT_BADGES)
  const [badgesDraft, setBadgesDraft] = useState<BadgesConfig>(DEFAULT_BADGES)
  const [badgesLoading, setBadgesLoading] = useState(true)
  const [badgesSaving, setBadgesSaving] = useState(false)
  const [badgesStatus, setBadgesStatus] = useState<'idle' | 'saved' | 'error'>('idle')
  const badgesDraftRef = useRef(badgesDraft)
  badgesDraftRef.current = badgesDraft
  const badgesSavedRef = useRef(badgesSaved)
  badgesSavedRef.current = badgesSaved
  const saveBadgesRef = useRef<() => Promise<boolean>>(async () => false)

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
    clearStoreSettingsBrowserCaches()
  }, [])

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
    void fetch('/api/admin/home-divider-after-product', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : DEFAULT_HOME_DIVIDER))
      .then((data: HomeDividerConfig) => {
        setHomeDividerAfterProductSaved(data)
        setHomeDividerAfterProductDraft(data)
      })
      .catch(() => {
        setHomeDividerAfterProductSaved(DEFAULT_HOME_DIVIDER)
        setHomeDividerAfterProductDraft(DEFAULT_HOME_DIVIDER)
      })
      .finally(() => setHomeDividerAfterProductLoading(false))
  }, [])

  useEffect(() => {
    void fetch('/api/admin/home-divider-after-related-products', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : DEFAULT_HOME_DIVIDER))
      .then((data: HomeDividerConfig) => {
        setHomeDividerAfterRelatedProductsSaved(data)
        setHomeDividerAfterRelatedProductsDraft(data)
      })
      .catch(() => {
        setHomeDividerAfterRelatedProductsSaved(DEFAULT_HOME_DIVIDER)
        setHomeDividerAfterRelatedProductsDraft(DEFAULT_HOME_DIVIDER)
      })
      .finally(() => setHomeDividerAfterRelatedProductsLoading(false))
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
    let cancelled = false

    void fetchCollectionProductsSettings()
      .then((data) => {
        if (cancelled) return
        if (collectionProductsLocalAuthorityRef.current) return
        const dirty = !collectionProductsConfigsEqual(
          collectionProductsDraftRef.current,
          collectionProductsSavedRef.current
        )
        if (dirty) return
        setCollectionProductsSaved(data)
        setCollectionProductsDraft(data)
      })
      .catch(() => {
        if (cancelled) return
        if (collectionProductsLocalAuthorityRef.current) return
        const dirty = !collectionProductsConfigsEqual(
          collectionProductsDraftRef.current,
          collectionProductsSavedRef.current
        )
        if (dirty) return
        setCollectionProductsSaved(DEFAULT_COLLECTION_PRODUCTS)
        setCollectionProductsDraft(DEFAULT_COLLECTION_PRODUCTS)
      })
      .finally(() => {
        if (!cancelled) setCollectionProductsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    void fetchProductPageSettings()
      .then((data) => {
        if (cancelled) return
        if (productPageLocalAuthorityRef.current) return
        const dirty = !productPageConfigsEqual(
          productPageDraftRef.current,
          productPageSavedRef.current
        )
        if (dirty) return
        setProductPageSaved(data)
        setProductPageDraft(data)
      })
      .catch(() => {
        if (cancelled) return
        if (productPageLocalAuthorityRef.current) return
        const dirty = !productPageConfigsEqual(
          productPageDraftRef.current,
          productPageSavedRef.current
        )
        if (dirty) return
        setProductPageSaved(DEFAULT_PRODUCT_PAGE)
        setProductPageDraft(DEFAULT_PRODUCT_PAGE)
      })
      .finally(() => {
        if (!cancelled) setProductPageLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    void fetchRelatedProductsSettings()
      .then((data) => {
        if (cancelled) return
        if (relatedProductsLocalAuthorityRef.current) return
        const dirty = !relatedProductsConfigsEqual(
          relatedProductsDraftRef.current,
          relatedProductsSavedRef.current
        )
        if (dirty) return
        setRelatedProductsSaved(data)
        setRelatedProductsDraft(data)
      })
      .catch(() => {
        if (cancelled) return
        if (relatedProductsLocalAuthorityRef.current) return
        const dirty = !relatedProductsConfigsEqual(
          relatedProductsDraftRef.current,
          relatedProductsSavedRef.current
        )
        if (dirty) return
        setRelatedProductsSaved(DEFAULT_RELATED_PRODUCTS)
        setRelatedProductsDraft(DEFAULT_RELATED_PRODUCTS)
      })
      .finally(() => {
        if (!cancelled) setRelatedProductsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    void fetchRecentProductsSettings()
      .then((data) => {
        if (cancelled) return
        if (recentProductsLocalAuthorityRef.current) return
        const dirty = !recentProductsConfigsEqual(
          recentProductsDraftRef.current,
          recentProductsSavedRef.current
        )
        if (dirty) return
        setRecentProductsSaved(data)
        setRecentProductsDraft(data)
      })
      .catch(() => {
        if (cancelled) return
        if (recentProductsLocalAuthorityRef.current) return
        const dirty = !recentProductsConfigsEqual(
          recentProductsDraftRef.current,
          recentProductsSavedRef.current
        )
        if (dirty) return
        setRecentProductsSaved(DEFAULT_RECENT_PRODUCTS)
        setRecentProductsDraft(DEFAULT_RECENT_PRODUCTS)
      })
      .finally(() => {
        if (!cancelled) setRecentProductsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    void fetchSearchSettings()
      .then((data) => {
        if (cancelled) return
        if (searchLocalAuthorityRef.current) return
        const dirty = !searchConfigsEqual(searchDraftRef.current, searchSavedRef.current)
        if (dirty) return
        setSearchSaved(data)
        setSearchDraft(data)
      })
      .catch(() => {
        if (cancelled) return
        if (searchLocalAuthorityRef.current) return
        const dirty = !searchConfigsEqual(searchDraftRef.current, searchSavedRef.current)
        if (dirty) return
        setSearchSaved(DEFAULT_SEARCH)
        setSearchDraft(DEFAULT_SEARCH)
      })
      .finally(() => {
        if (!cancelled) setSearchLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    void fetchCartSettings()
      .then((data) => {
        if (cancelled) return
        if (cartLocalAuthorityRef.current) return
        const dirty = !cartConfigsEqual(cartDraftRef.current, cartSavedRef.current)
        if (dirty) return
        setCartSaved(data)
        setCartDraft(data)
      })
      .catch(() => {
        if (cancelled) return
        if (cartLocalAuthorityRef.current) return
        const dirty = !cartConfigsEqual(cartDraftRef.current, cartSavedRef.current)
        if (dirty) return
        setCartSaved(DEFAULT_CART)
        setCartDraft(DEFAULT_CART)
      })
      .finally(() => {
        if (!cancelled) setCartLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    void fetchCheckoutSettings()
      .then((data) => {
        if (cancelled) return
        if (checkoutLocalAuthorityRef.current) return
        const dirty = !checkoutConfigsEqual(checkoutDraftRef.current, checkoutSavedRef.current)
        if (dirty) return
        setCheckoutSaved(data)
        setCheckoutDraft(data)
      })
      .catch(() => {
        if (cancelled) return
        if (checkoutLocalAuthorityRef.current) return
        const dirty = !checkoutConfigsEqual(checkoutDraftRef.current, checkoutSavedRef.current)
        if (dirty) return
        setCheckoutSaved(DEFAULT_CHECKOUT)
        setCheckoutDraft(DEFAULT_CHECKOUT)
      })
      .finally(() => {
        if (!cancelled) setCheckoutLoading(false)
      })

    return () => {
      cancelled = true
    }
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
    let cancelled = false

    void fetchBadgesSettings()
      .then((data) => {
        if (cancelled) return
        setBadgesSaved(data)
        setBadgesDraft((prev) =>
          badgesConfigsEqual(prev, badgesSavedRef.current) ? data : prev
        )
      })
      .catch(() => {
        if (cancelled) return
        setBadgesSaved(DEFAULT_BADGES)
        setBadgesDraft((prev) =>
          badgesConfigsEqual(prev, badgesSavedRef.current) ? DEFAULT_BADGES : prev
        )
      })
      .finally(() => {
        if (!cancelled) setBadgesLoading(false)
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

  const homeDividerAfterProductDirty = useMemo(
    () => !homeDividerConfigsEqual(homeDividerAfterProductSaved, homeDividerAfterProductDraft),
    [homeDividerAfterProductSaved, homeDividerAfterProductDraft]
  )

  const homeDividerAfterRelatedProductsDirty = useMemo(
    () =>
      !homeDividerConfigsEqual(
        homeDividerAfterRelatedProductsSaved,
        homeDividerAfterRelatedProductsDraft
      ),
    [homeDividerAfterRelatedProductsSaved, homeDividerAfterRelatedProductsDraft]
  )

  const storeFooterDirty = useMemo(
    () => !storeFooterConfigsEqual(storeFooterSaved, storeFooterDraft),
    [storeFooterSaved, storeFooterDraft]
  )

  const collectionsListDirty = useMemo(
    () => !collectionsListConfigsEqual(collectionsListSaved, collectionsListDraft),
    [collectionsListSaved, collectionsListDraft]
  )

  const collectionProductsDirty = useMemo(
    () => !collectionProductsConfigsEqual(collectionProductsSaved, collectionProductsDraft),
    [collectionProductsSaved, collectionProductsDraft]
  )

  const productPageDirty = useMemo(
    () => !productPageConfigsEqual(productPageSaved, productPageDraft),
    [productPageSaved, productPageDraft]
  )

  const relatedProductsDirty = useMemo(
    () => !relatedProductsConfigsEqual(relatedProductsSaved, relatedProductsDraft),
    [relatedProductsSaved, relatedProductsDraft]
  )

  const recentProductsDirty = useMemo(
    () => !recentProductsConfigsEqual(recentProductsSaved, recentProductsDraft),
    [recentProductsSaved, recentProductsDraft]
  )

  const searchDirty = useMemo(
    () => !searchConfigsEqual(searchSaved, searchDraft),
    [searchSaved, searchDraft]
  )

  const cartDirty = useMemo(
    () => !cartConfigsEqual(cartSaved, cartDraft),
    [cartSaved, cartDraft]
  )

  const checkoutDirty = useMemo(
    () => !checkoutConfigsEqual(checkoutSaved, checkoutDraft),
    [checkoutSaved, checkoutDraft]
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

  const badgesDirty = useMemo(
    () => !badgesConfigsEqual(badgesSaved, badgesDraft),
    [badgesSaved, badgesDraft]
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

    const homepageOnlySections: AdminSectionId[] = [
      'hero-banner',
      'home-divider',
      'collection-cards',
      'home-divider-after-cards',
      'collection-tabs',
      'home-divider-after-tabs',
      'trust-banner',
      'home-divider-after-trust-banner',
    ]

    if (id === 'collections-list') {
      const page = getThemePageById('collections-list')
      setActiveThemePageId(page.id)
      setPreviewPathState(page.path)
    } else if (id === 'collection-products') {
      const page = getThemePageById('collection')
      setActiveThemePageId(page.id)
      setPreviewPathState((current) => {
        const handle = parseCollectionHandleFromPath(current)
        return handle ? `/collections/${handle}` : page.path
      })
    } else if (
      id === 'product-page' ||
      id === 'related-products' ||
      id === 'recent-products' ||
      id === 'home-divider-after-product' ||
      id === 'home-divider-after-related-products'
    ) {
      const page = getThemePageById('product')
      setActiveThemePageId(page.id)
      setPreviewPathState((current) => {
        const handle = parseProductHandleFromPath(current)
        return handle ? `/products/${handle}` : page.path
      })
    } else if (id === 'search') {
      const page = getThemePageById('search')
      setActiveThemePageId(page.id)
      setPreviewPathState(page.path)
    } else if (id === 'cart') {
      const page = getThemePageById('cart')
      setActiveThemePageId(page.id)
      setPreviewPathState(page.path)
    } else if (id === 'checkout') {
      const page = getThemePageById('checkout')
      setActiveThemePageId(page.id)
      setPreviewPathState(page.path)
    } else if (homepageOnlySections.includes(id)) {
      const page = getThemePageById('home')
      setActiveThemePageId(page.id)
      setPreviewPathState(page.path)
    }
    // Shared chrome (announcement / header / footer): keep current preview page

    setAnnouncementStatus('idle')
    setHeroBannerStatus('idle')
    setLogoFaviconStatus('idle')
    setHeaderNavStatus('idle')
    setHeaderSectionStatus('idle')
    setCollectionProductsStatus('idle')
  }, [])

  const closeSection = useCallback(() => {
    if (
      activeSection === 'collection-products' &&
      !collectionProductsConfigsEqual(
        collectionProductsSavedRef.current,
        collectionProductsDraftRef.current
      )
    ) {
      void saveCollectionProductsRef.current()
    }
    if (
      activeSection === 'product-page' &&
      !productPageConfigsEqual(productPageSavedRef.current, productPageDraftRef.current)
    ) {
      void saveProductPageRef.current()
    }
    if (
      activeSection === 'related-products' &&
      !relatedProductsConfigsEqual(
        relatedProductsSavedRef.current,
        relatedProductsDraftRef.current
      )
    ) {
      void saveRelatedProductsRef.current()
    }
    if (
      activeSection === 'recent-products' &&
      !recentProductsConfigsEqual(
        recentProductsSavedRef.current,
        recentProductsDraftRef.current
      )
    ) {
      void saveRecentProductsRef.current()
    }
    if (
      activeSection === 'search' &&
      !searchConfigsEqual(searchSavedRef.current, searchDraftRef.current)
    ) {
      void saveSearchRef.current()
    }
    if (
      activeSection === 'cart' &&
      !cartConfigsEqual(cartSavedRef.current, cartDraftRef.current)
    ) {
      void saveCartRef.current()
    }
    if (
      activeSection === 'checkout' &&
      !checkoutConfigsEqual(checkoutSavedRef.current, checkoutDraftRef.current)
    ) {
      void saveCheckoutRef.current()
    }
    setActiveSection(null)
    setAnnouncementStatus('idle')
    setHeroBannerStatus('idle')
    setLogoFaviconStatus('idle')
    setHeaderNavStatus('idle')
    setHeaderSectionStatus('idle')
    setCollectionProductsStatus('idle')
    setProductPageStatus('idle')
    setRelatedProductsStatus('idle')
    setRecentProductsStatus('idle')
  }, [activeSection])

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
    if (
      activeGlobalSetting === 'badges' &&
      !badgesConfigsEqual(badgesSavedRef.current, badgesDraftRef.current)
    ) {
      void saveBadgesRef.current()
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

  const updateHomeDividerAfterProductDraft = useCallback((patch: Partial<HomeDividerConfig>) => {
    setHomeDividerAfterProductDraft((prev) => ({ ...prev, ...patch }))
    setHomeDividerAfterProductStatus('idle')
  }, [])

  const saveHomeDividerAfterProduct = useCallback(async () => {
    setHomeDividerAfterProductSaving(true)
    setHomeDividerAfterProductStatus('idle')
    try {
      const res = await fetch('/api/admin/home-divider-after-product', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(homeDividerAfterProductDraft),
      })
      if (!res.ok) throw new Error('Save failed')
      const data = (await res.json()) as HomeDividerConfig
      setHomeDividerAfterProductSaved(data)
      setHomeDividerAfterProductDraft(data)
      setHomeDividerAfterProductStatus('saved')
      return true
    } catch {
      setHomeDividerAfterProductStatus('error')
      return false
    } finally {
      setHomeDividerAfterProductSaving(false)
    }
  }, [homeDividerAfterProductDraft])

  const updateHomeDividerAfterRelatedProductsDraft = useCallback(
    (patch: Partial<HomeDividerConfig>) => {
      setHomeDividerAfterRelatedProductsDraft((prev) => ({ ...prev, ...patch }))
      setHomeDividerAfterRelatedProductsStatus('idle')
    },
    []
  )

  const saveHomeDividerAfterRelatedProducts = useCallback(async () => {
    setHomeDividerAfterRelatedProductsSaving(true)
    setHomeDividerAfterRelatedProductsStatus('idle')
    try {
      const res = await fetch('/api/admin/home-divider-after-related-products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(homeDividerAfterRelatedProductsDraft),
      })
      if (!res.ok) throw new Error('Save failed')
      const data = (await res.json()) as HomeDividerConfig
      setHomeDividerAfterRelatedProductsSaved(data)
      setHomeDividerAfterRelatedProductsDraft(data)
      setHomeDividerAfterRelatedProductsStatus('saved')
      return true
    } catch {
      setHomeDividerAfterRelatedProductsStatus('error')
      return false
    } finally {
      setHomeDividerAfterRelatedProductsSaving(false)
    }
  }, [homeDividerAfterRelatedProductsDraft])

  const updateStoreFooterDraft = useCallback((patch: Partial<StoreFooterConfig>) => {
    setStoreFooterDraft((prev) => ({ ...prev, ...patch }))
    setStoreFooterStatus('idle')
  }, [])

  const uploadStoreFooterLogo = useCallback(
    async (file: File) => {
      setStoreFooterLogoUploading(true)
      setStoreFooterStatus('idle')
      try {
        const data = await uploadAdminStoreAsset(file, 'logo')
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

  const updateCollectionProductsDraft = useCallback((patch: Partial<CollectionProductsConfig>) => {
    setCollectionProductsDraft((prev) => {
      const next = { ...prev, ...patch }
      collectionProductsDraftRef.current = next
      return next
    })
    setCollectionProductsStatus('idle')
    setCollectionProductsErrorMessage(null)
  }, [])

  const saveCollectionProducts = useCallback(async () => {
    setCollectionProductsSaving(true)
    setCollectionProductsStatus('idle')
    setCollectionProductsErrorMessage(null)
    try {
      const data = await persistCollectionProductsSettings(collectionProductsDraftRef.current)
      collectionProductsLocalAuthorityRef.current = true
      collectionProductsSavedRef.current = data
      collectionProductsDraftRef.current = data
      setCollectionProductsSaved(data)
      setCollectionProductsDraft(data)
      setCollectionProductsStatus('saved')
      return true
    } catch (e) {
      setCollectionProductsStatus('error')
      setCollectionProductsErrorMessage(e instanceof Error ? e.message : 'Could not save.')
      return false
    } finally {
      setCollectionProductsSaving(false)
    }
  }, [])

  saveCollectionProductsRef.current = saveCollectionProducts

  const updateProductPageDraft = useCallback((patch: Partial<ProductPageConfig>) => {
    setProductPageDraft((prev) => ({ ...prev, ...patch }))
    setProductPageStatus('idle')
  }, [])

  const saveProductPage = useCallback(async () => {
    setProductPageSaving(true)
    setProductPageStatus('idle')
    try {
      const data = await persistProductPageSettings(productPageDraftRef.current)
      productPageLocalAuthorityRef.current = true
      productPageSavedRef.current = data
      productPageDraftRef.current = data
      setProductPageSaved(data)
      setProductPageDraft(data)
      setProductPageStatus('saved')
      return true
    } catch {
      setProductPageStatus('error')
      return false
    } finally {
      setProductPageSaving(false)
    }
  }, [])

  saveProductPageRef.current = saveProductPage

  const updateRelatedProductsDraft = useCallback((patch: Partial<RelatedProductsConfig>) => {
    setRelatedProductsDraft((prev) => {
      const next = { ...prev, ...patch }
      relatedProductsDraftRef.current = next
      return next
    })
    setRelatedProductsStatus('idle')
  }, [])

  const saveRelatedProducts = useCallback(async () => {
    setRelatedProductsSaving(true)
    setRelatedProductsStatus('idle')
    try {
      const data = await persistRelatedProductsSettings(relatedProductsDraftRef.current)
      relatedProductsLocalAuthorityRef.current = true
      relatedProductsSavedRef.current = data
      relatedProductsDraftRef.current = data
      setRelatedProductsSaved(data)
      setRelatedProductsDraft(data)
      setRelatedProductsStatus('saved')
      return true
    } catch {
      setRelatedProductsStatus('error')
      return false
    } finally {
      setRelatedProductsSaving(false)
    }
  }, [])

  saveRelatedProductsRef.current = saveRelatedProducts

  const updateRecentProductsDraft = useCallback((patch: Partial<RecentProductsConfig>) => {
    setRecentProductsDraft((prev) => {
      const next = { ...prev, ...patch }
      recentProductsDraftRef.current = next
      return next
    })
    setRecentProductsStatus('idle')
  }, [])

  const saveRecentProducts = useCallback(async () => {
    setRecentProductsSaving(true)
    setRecentProductsStatus('idle')
    try {
      const data = await persistRecentProductsSettings(recentProductsDraftRef.current)
      recentProductsLocalAuthorityRef.current = true
      recentProductsSavedRef.current = data
      recentProductsDraftRef.current = data
      setRecentProductsSaved(data)
      setRecentProductsDraft(data)
      setRecentProductsStatus('saved')
      return true
    } catch {
      setRecentProductsStatus('error')
      return false
    } finally {
      setRecentProductsSaving(false)
    }
  }, [])

  saveRecentProductsRef.current = saveRecentProducts

  const updateSearchDraft = useCallback((patch: Partial<SearchConfig>) => {
    setSearchDraft((prev) => {
      const next = { ...prev, ...patch }
      searchDraftRef.current = next
      return next
    })
    setSearchStatus('idle')
  }, [])

  const saveSearch = useCallback(async () => {
    setSearchSaving(true)
    setSearchStatus('idle')
    try {
      const data = await persistSearchSettings(searchDraftRef.current)
      searchLocalAuthorityRef.current = true
      searchSavedRef.current = data
      searchDraftRef.current = data
      setSearchSaved(data)
      setSearchDraft(data)
      setSearchStatus('saved')
      return true
    } catch {
      setSearchStatus('error')
      return false
    } finally {
      setSearchSaving(false)
    }
  }, [])

  saveSearchRef.current = saveSearch

  const updateCartDraft = useCallback((patch: Partial<CartConfig>) => {
    setCartDraft((prev) => {
      const next = { ...prev, ...patch }
      cartDraftRef.current = next
      return next
    })
    setCartStatus('idle')
  }, [])

  const saveCart = useCallback(async () => {
    setCartSaving(true)
    setCartStatus('idle')
    try {
      const data = await persistCartSettings(cartDraftRef.current)
      cartLocalAuthorityRef.current = true
      cartSavedRef.current = data
      cartDraftRef.current = data
      setCartSaved(data)
      setCartDraft(data)
      setCartStatus('saved')
      return true
    } catch {
      setCartStatus('error')
      return false
    } finally {
      setCartSaving(false)
    }
  }, [])

  saveCartRef.current = saveCart

  const updateCheckoutDraft = useCallback((patch: Partial<CheckoutConfig>) => {
    setCheckoutDraft((prev) => {
      const next = { ...prev, ...patch }
      checkoutDraftRef.current = next
      return next
    })
    setCheckoutStatus('idle')
  }, [])

  const saveCheckout = useCallback(async () => {
    setCheckoutSaving(true)
    setCheckoutStatus('idle')
    try {
      const data = await persistCheckoutSettings(checkoutDraftRef.current)
      checkoutLocalAuthorityRef.current = true
      checkoutSavedRef.current = data
      checkoutDraftRef.current = data
      setCheckoutSaved(data)
      setCheckoutDraft(data)
      setCheckoutStatus('saved')
      return true
    } catch {
      setCheckoutStatus('error')
      return false
    } finally {
      setCheckoutSaving(false)
    }
  }, [])

  saveCheckoutRef.current = saveCheckout

  const updateLogoFaviconDraft = useCallback((patch: Partial<LogoFaviconConfig>) => {
    setLogoFaviconDraft((prev) => ({ ...prev, ...patch }))
    setLogoFaviconStatus('idle')
  }, [])

  const uploadLogoFaviconImage = useCallback(
    async (folder: LogoFaviconUploadFolder, file: File) => {
      setLogoFaviconUploading(folder)
      setLogoFaviconStatus('idle')
      try {
        const data = await uploadAdminStoreAsset(file, folder)

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
      const payload = (await res.json().catch(() => null)) as
        | (LogoFaviconConfig & { error?: string })
        | { error?: string }
        | null

      if (!res.ok) {
        throw new Error(
          payload && typeof payload === 'object' && 'error' in payload && payload.error
            ? String(payload.error)
            : 'Save failed'
        )
      }

      const data = payload as LogoFaviconConfig
      setLogoFaviconSaved(data)
      setLogoFaviconDraft(data)
      setLogoFaviconStatus('saved')
      dispatchStoreThemeRefresh({ keys: ['logo-favicon'] })
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

  const updateBadgesDraft = useCallback((patch: Partial<BadgesConfig>) => {
    setBadgesDraft((prev) => ({ ...prev, ...patch }))
    setBadgesStatus('idle')
  }, [])

  const saveBadges = useCallback(async () => {
    setBadgesSaving(true)
    setBadgesStatus('idle')
    try {
      const data = await persistBadgesSettings(badgesDraftRef.current)
      setBadgesSaved(data)
      setBadgesDraft(data)
      setBadgesStatus('saved')
      return true
    } catch {
      setBadgesStatus('error')
      return false
    } finally {
      setBadgesSaving(false)
    }
  }, [])

  saveBadgesRef.current = saveBadges

  useEffect(() => {
    if (activeGlobalSetting !== 'badges') return
    if (!badgesDirty) return

    const timer = window.setTimeout(() => {
      void saveBadgesRef.current()
    }, BADGES_AUTOSAVE_MS)

    return () => window.clearTimeout(timer)
  }, [activeGlobalSetting, badgesDraft, badgesDirty])

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
      homeDividerAfterProductLoading,
      homeDividerAfterProductSaving,
      homeDividerAfterProductSaved,
      homeDividerAfterProductDraft,
      homeDividerAfterProductDirty,
      homeDividerAfterProductStatus,
      updateHomeDividerAfterProductDraft,
      saveHomeDividerAfterProduct,
      homeDividerAfterRelatedProductsLoading,
      homeDividerAfterRelatedProductsSaving,
      homeDividerAfterRelatedProductsSaved,
      homeDividerAfterRelatedProductsDraft,
      homeDividerAfterRelatedProductsDirty,
      homeDividerAfterRelatedProductsStatus,
      updateHomeDividerAfterRelatedProductsDraft,
      saveHomeDividerAfterRelatedProducts,
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
      collectionProductsLoading,
      collectionProductsSaving,
      collectionProductsSaved,
      collectionProductsDraft,
      collectionProductsDirty,
      collectionProductsStatus,
      collectionProductsErrorMessage,
      updateCollectionProductsDraft,
      saveCollectionProducts,
      productPageLoading,
      productPageSaving,
      productPageSaved,
      productPageDraft,
      productPageDirty,
      productPageStatus,
      updateProductPageDraft,
      saveProductPage,
      relatedProductsLoading,
      relatedProductsSaving,
      relatedProductsSaved,
      relatedProductsDraft,
      relatedProductsDirty,
      relatedProductsStatus,
      updateRelatedProductsDraft,
      saveRelatedProducts,
      recentProductsLoading,
      recentProductsSaving,
      recentProductsSaved,
      recentProductsDraft,
      recentProductsDirty,
      recentProductsStatus,
      updateRecentProductsDraft,
      saveRecentProducts,
      searchLoading,
      searchSaving,
      searchSaved,
      searchDraft,
      searchDirty,
      searchStatus,
      updateSearchDraft,
      saveSearch,
      cartLoading,
      cartSaving,
      cartSaved,
      cartDraft,
      cartDirty,
      cartStatus,
      updateCartDraft,
      saveCart,
      checkoutLoading,
      checkoutSaving,
      checkoutSaved,
      checkoutDraft,
      checkoutDirty,
      checkoutStatus,
      updateCheckoutDraft,
      saveCheckout,
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
      badgesLoading,
      badgesSaving,
      badgesSaved,
      badgesDraft,
      badgesDirty,
      badgesStatus,
      updateBadgesDraft,
      saveBadges,
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
      homeDividerAfterProductLoading,
      homeDividerAfterProductSaving,
      homeDividerAfterProductSaved,
      homeDividerAfterProductDraft,
      homeDividerAfterProductDirty,
      homeDividerAfterProductStatus,
      updateHomeDividerAfterProductDraft,
      saveHomeDividerAfterProduct,
      homeDividerAfterRelatedProductsLoading,
      homeDividerAfterRelatedProductsSaving,
      homeDividerAfterRelatedProductsSaved,
      homeDividerAfterRelatedProductsDraft,
      homeDividerAfterRelatedProductsDirty,
      homeDividerAfterRelatedProductsStatus,
      updateHomeDividerAfterRelatedProductsDraft,
      saveHomeDividerAfterRelatedProducts,
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
      collectionProductsLoading,
      collectionProductsSaving,
      collectionProductsSaved,
      collectionProductsDraft,
      collectionProductsDirty,
      collectionProductsStatus,
      collectionProductsErrorMessage,
      updateCollectionProductsDraft,
      saveCollectionProducts,
      productPageLoading,
      productPageSaving,
      productPageSaved,
      productPageDraft,
      productPageDirty,
      productPageStatus,
      updateProductPageDraft,
      saveProductPage,
      relatedProductsLoading,
      relatedProductsSaving,
      relatedProductsSaved,
      relatedProductsDraft,
      relatedProductsDirty,
      relatedProductsStatus,
      updateRelatedProductsDraft,
      saveRelatedProducts,
      recentProductsLoading,
      recentProductsSaving,
      recentProductsSaved,
      recentProductsDraft,
      recentProductsDirty,
      recentProductsStatus,
      updateRecentProductsDraft,
      saveRecentProducts,
      searchLoading,
      searchSaving,
      searchSaved,
      searchDraft,
      searchDirty,
      searchStatus,
      updateSearchDraft,
      saveSearch,
      cartLoading,
      cartSaving,
      cartSaved,
      cartDraft,
      cartDirty,
      cartStatus,
      updateCartDraft,
      saveCart,
      checkoutLoading,
      checkoutSaving,
      checkoutSaved,
      checkoutDraft,
      checkoutDirty,
      checkoutStatus,
      updateCheckoutDraft,
      saveCheckout,
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
      badgesLoading,
      badgesSaving,
      badgesSaved,
      badgesDraft,
      badgesDirty,
      badgesStatus,
      updateBadgesDraft,
      saveBadges,
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
