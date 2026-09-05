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
  accountConfigsEqual,
  DEFAULT_ACCOUNT,
  type AccountConfig,
} from '@/lib/account'
import { fetchAccountSettings, persistAccountSettings } from '@/lib/account-client'
import {
  DEFAULT_CHECKOUT,
  checkoutConfigsEqual,
  type CheckoutConfig,
} from '@/lib/checkout'
import { fetchCheckoutSettings, persistCheckoutSettings } from '@/lib/checkout-client'
import { clearStoreSettingsBrowserCaches } from '@/lib/store-settings-cache'
import {
  putAdminSettingsJson,
  runOptimisticSettingsSave,
} from '@/lib/admin-optimistic-save'
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
  | 'account'
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
  accountLoading: boolean
  accountSaving: boolean
  accountSaved: AccountConfig
  accountDraft: AccountConfig
  accountDirty: boolean
  accountStatus: 'idle' | 'saved' | 'error'
  accountPreviewLoggedIn: boolean
  setAccountPreviewLoggedIn: (value: boolean) => void
  updateAccountDraft: (patch: Partial<AccountConfig>) => void
  saveAccount: () => Promise<boolean>
  checkoutLoading: boolean
  checkoutSaving: boolean
  checkoutSaved: CheckoutConfig
  checkoutDraft: CheckoutConfig
  checkoutDirty: boolean
  checkoutStatus: 'idle' | 'saved' | 'error'
  checkoutErrorMessage: string | null
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

  const [accountSaved, setAccountSaved] = useState<AccountConfig>(DEFAULT_ACCOUNT)
  const [accountDraft, setAccountDraft] = useState<AccountConfig>(DEFAULT_ACCOUNT)
  const [accountLoading, setAccountLoading] = useState(true)
  const [accountSaving, setAccountSaving] = useState(false)
  const [accountStatus, setAccountStatus] = useState<'idle' | 'saved' | 'error'>('idle')
  const [accountPreviewLoggedIn, setAccountPreviewLoggedIn] = useState(false)
  const accountDraftRef = useRef(accountDraft)
  accountDraftRef.current = accountDraft
  const accountSavedRef = useRef(accountSaved)
  accountSavedRef.current = accountSaved
  const saveAccountRef = useRef<() => Promise<boolean>>(async () => false)
  const accountLocalAuthorityRef = useRef(false)

  const [checkoutSaved, setCheckoutSaved] = useState<CheckoutConfig>(DEFAULT_CHECKOUT)
  const [checkoutDraft, setCheckoutDraft] = useState<CheckoutConfig>(DEFAULT_CHECKOUT)
  const [checkoutLoading, setCheckoutLoading] = useState(true)
  const [checkoutSaving, setCheckoutSaving] = useState(false)
  const [checkoutStatus, setCheckoutStatus] = useState<'idle' | 'saved' | 'error'>('idle')
  const [checkoutErrorMessage, setCheckoutErrorMessage] = useState<string | null>(null)
  const checkoutDraftRef = useRef(checkoutDraft)
  checkoutDraftRef.current = checkoutDraft
  const checkoutSavedRef = useRef(checkoutSaved)
  checkoutSavedRef.current = checkoutSaved
  const saveCheckoutRef = useRef<() => Promise<boolean>>(async () => false)
  const checkoutLocalAuthorityRef = useRef(false)
  /** After any successful settings save, ignore late mount GETs that could overwrite with stale data. */
  const blockRemoteSettingsHydrationRef = useRef(false)
  const noteSettingsWriteSuccess = () => {
    blockRemoteSettingsHydrationRef.current = true
    clearStoreSettingsBrowserCaches()
  }

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
        if (blockRemoteSettingsHydrationRef.current) return
        setAnnouncementSaved(data)
        setAnnouncementDraft(data)
      })
      .catch(() => {
        if (blockRemoteSettingsHydrationRef.current) return
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
        if (blockRemoteSettingsHydrationRef.current) return
        setHeroBannerSaved(data)
        setHeroBannerDraft((prev) =>
          heroBannerConfigsEqual(prev, heroBannerSavedRef.current) ? data : prev
        )
      })
      .catch(() => {
        if (cancelled) return
        if (blockRemoteSettingsHydrationRef.current) return
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
        if (blockRemoteSettingsHydrationRef.current) return
        setHomeDividerSaved(data)
        setHomeDividerDraft(data)
      })
      .catch(() => {
        if (blockRemoteSettingsHydrationRef.current) return
        setHomeDividerSaved(DEFAULT_HOME_DIVIDER)
        setHomeDividerDraft(DEFAULT_HOME_DIVIDER)
      })
      .finally(() => setHomeDividerLoading(false))
  }, [])

  useEffect(() => {
    void fetch('/api/admin/home-divider-after-cards', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : DEFAULT_HOME_DIVIDER))
      .then((data: HomeDividerConfig) => {
        if (blockRemoteSettingsHydrationRef.current) return
        setHomeDividerAfterCardsSaved(data)
        setHomeDividerAfterCardsDraft(data)
      })
      .catch(() => {
        if (blockRemoteSettingsHydrationRef.current) return
        setHomeDividerAfterCardsSaved(DEFAULT_HOME_DIVIDER)
        setHomeDividerAfterCardsDraft(DEFAULT_HOME_DIVIDER)
      })
      .finally(() => setHomeDividerAfterCardsLoading(false))
  }, [])

  useEffect(() => {
    void fetch('/api/admin/home-divider-after-tabs', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : DEFAULT_HOME_DIVIDER))
      .then((data: HomeDividerConfig) => {
        if (blockRemoteSettingsHydrationRef.current) return
        setHomeDividerAfterTabsSaved(data)
        setHomeDividerAfterTabsDraft(data)
      })
      .catch(() => {
        if (blockRemoteSettingsHydrationRef.current) return
        setHomeDividerAfterTabsSaved(DEFAULT_HOME_DIVIDER)
        setHomeDividerAfterTabsDraft(DEFAULT_HOME_DIVIDER)
      })
      .finally(() => setHomeDividerAfterTabsLoading(false))
  }, [])

  useEffect(() => {
    void fetch('/api/admin/collection-cards', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : DEFAULT_COLLECTION_CARDS))
      .then((data: CollectionCardsConfig) => {
        if (blockRemoteSettingsHydrationRef.current) return
        setCollectionCardsSaved(data)
        setCollectionCardsDraft(data)
      })
      .catch(() => {
        if (blockRemoteSettingsHydrationRef.current) return
        setCollectionCardsSaved(DEFAULT_COLLECTION_CARDS)
        setCollectionCardsDraft(DEFAULT_COLLECTION_CARDS)
      })
      .finally(() => setCollectionCardsLoading(false))
  }, [])

  useEffect(() => {
    void fetch('/api/admin/collection-tabs', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : DEFAULT_COLLECTION_TABS))
      .then((data: CollectionTabsConfig) => {
        if (blockRemoteSettingsHydrationRef.current) return
        setCollectionTabsSaved(data)
        setCollectionTabsDraft(data)
      })
      .catch(() => {
        if (blockRemoteSettingsHydrationRef.current) return
        setCollectionTabsSaved(DEFAULT_COLLECTION_TABS)
        setCollectionTabsDraft(DEFAULT_COLLECTION_TABS)
      })
      .finally(() => setCollectionTabsLoading(false))
  }, [])

  useEffect(() => {
    void fetch('/api/admin/trust-banner', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : DEFAULT_TRUST_BANNER))
      .then((data: TrustBannerConfig) => {
        if (blockRemoteSettingsHydrationRef.current) return
        setTrustBannerSaved(data)
        setTrustBannerDraft(data)
      })
      .catch(() => {
        if (blockRemoteSettingsHydrationRef.current) return
        setTrustBannerSaved(DEFAULT_TRUST_BANNER)
        setTrustBannerDraft(DEFAULT_TRUST_BANNER)
      })
      .finally(() => setTrustBannerLoading(false))
  }, [])

  useEffect(() => {
    void fetch('/api/admin/home-divider-after-trust-banner', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : DEFAULT_HOME_DIVIDER))
      .then((data: HomeDividerConfig) => {
        if (blockRemoteSettingsHydrationRef.current) return
        setHomeDividerAfterTrustBannerSaved(data)
        setHomeDividerAfterTrustBannerDraft(data)
      })
      .catch(() => {
        if (blockRemoteSettingsHydrationRef.current) return
        setHomeDividerAfterTrustBannerSaved(DEFAULT_HOME_DIVIDER)
        setHomeDividerAfterTrustBannerDraft(DEFAULT_HOME_DIVIDER)
      })
      .finally(() => setHomeDividerAfterTrustBannerLoading(false))
  }, [])

  useEffect(() => {
    void fetch('/api/admin/home-divider-after-product', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : DEFAULT_HOME_DIVIDER))
      .then((data: HomeDividerConfig) => {
        if (blockRemoteSettingsHydrationRef.current) return
        setHomeDividerAfterProductSaved(data)
        setHomeDividerAfterProductDraft(data)
      })
      .catch(() => {
        if (blockRemoteSettingsHydrationRef.current) return
        setHomeDividerAfterProductSaved(DEFAULT_HOME_DIVIDER)
        setHomeDividerAfterProductDraft(DEFAULT_HOME_DIVIDER)
      })
      .finally(() => setHomeDividerAfterProductLoading(false))
  }, [])

  useEffect(() => {
    void fetch('/api/admin/home-divider-after-related-products', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : DEFAULT_HOME_DIVIDER))
      .then((data: HomeDividerConfig) => {
        if (blockRemoteSettingsHydrationRef.current) return
        setHomeDividerAfterRelatedProductsSaved(data)
        setHomeDividerAfterRelatedProductsDraft(data)
      })
      .catch(() => {
        if (blockRemoteSettingsHydrationRef.current) return
        setHomeDividerAfterRelatedProductsSaved(DEFAULT_HOME_DIVIDER)
        setHomeDividerAfterRelatedProductsDraft(DEFAULT_HOME_DIVIDER)
      })
      .finally(() => setHomeDividerAfterRelatedProductsLoading(false))
  }, [])

  useEffect(() => {
    void fetch('/api/admin/store-footer', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : DEFAULT_STORE_FOOTER))
      .then((data: StoreFooterConfig) => {
        if (blockRemoteSettingsHydrationRef.current) return
        setStoreFooterSaved(data)
        setStoreFooterDraft(data)
      })
      .catch(() => {
        if (blockRemoteSettingsHydrationRef.current) return
        setStoreFooterSaved(DEFAULT_STORE_FOOTER)
        setStoreFooterDraft(DEFAULT_STORE_FOOTER)
      })
      .finally(() => setStoreFooterLoading(false))
  }, [])

  useEffect(() => {
    void fetch('/api/admin/collections-list', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : DEFAULT_COLLECTIONS_LIST))
      .then((data: CollectionsListConfig) => {
        if (blockRemoteSettingsHydrationRef.current) return
        setCollectionsListSaved(data)
        setCollectionsListDraft(data)
      })
      .catch(() => {
        if (blockRemoteSettingsHydrationRef.current) return
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
        if (blockRemoteSettingsHydrationRef.current) return
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
        if (blockRemoteSettingsHydrationRef.current) return
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
        if (blockRemoteSettingsHydrationRef.current) return
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
        if (blockRemoteSettingsHydrationRef.current) return
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
        if (blockRemoteSettingsHydrationRef.current) return
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
        if (blockRemoteSettingsHydrationRef.current) return
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
        if (blockRemoteSettingsHydrationRef.current) return
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
        if (blockRemoteSettingsHydrationRef.current) return
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
        if (blockRemoteSettingsHydrationRef.current) return
        if (searchLocalAuthorityRef.current) return
        const dirty = !searchConfigsEqual(searchDraftRef.current, searchSavedRef.current)
        if (dirty) return
        setSearchSaved(data)
        setSearchDraft(data)
      })
      .catch(() => {
        if (cancelled) return
        if (blockRemoteSettingsHydrationRef.current) return
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
        if (blockRemoteSettingsHydrationRef.current) return
        if (cartLocalAuthorityRef.current) return
        const dirty = !cartConfigsEqual(cartDraftRef.current, cartSavedRef.current)
        if (dirty) return
        setCartSaved(data)
        setCartDraft(data)
      })
      .catch(() => {
        if (cancelled) return
        if (blockRemoteSettingsHydrationRef.current) return
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

    void fetchAccountSettings()
      .then((data) => {
        if (cancelled) return
        if (blockRemoteSettingsHydrationRef.current) return
        if (accountLocalAuthorityRef.current) return
        const dirty = !accountConfigsEqual(accountDraftRef.current, accountSavedRef.current)
        if (dirty) return
        setAccountSaved(data)
        setAccountDraft(data)
      })
      .catch(() => {
        if (cancelled) return
        if (blockRemoteSettingsHydrationRef.current) return
        if (accountLocalAuthorityRef.current) return
        const dirty = !accountConfigsEqual(accountDraftRef.current, accountSavedRef.current)
        if (dirty) return
        setAccountSaved(DEFAULT_ACCOUNT)
        setAccountDraft(DEFAULT_ACCOUNT)
      })
      .finally(() => {
        if (!cancelled) setAccountLoading(false)
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
        if (blockRemoteSettingsHydrationRef.current) return
        if (checkoutLocalAuthorityRef.current) return
        const dirty = !checkoutConfigsEqual(checkoutDraftRef.current, checkoutSavedRef.current)
        if (dirty) return
        setCheckoutSaved(data)
        setCheckoutDraft(data)
      })
      .catch(() => {
        if (cancelled) return
        if (blockRemoteSettingsHydrationRef.current) return
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
        if (blockRemoteSettingsHydrationRef.current) return
        setLogoFaviconSaved(data)
        setLogoFaviconDraft(data)
      })
      .catch(() => {
        if (blockRemoteSettingsHydrationRef.current) return
        setLogoFaviconSaved(DEFAULT_LOGO_FAVICON)
        setLogoFaviconDraft(DEFAULT_LOGO_FAVICON)
      })
      .finally(() => setLogoFaviconLoading(false))
  }, [])

  useEffect(() => {
    void fetch('/api/admin/general-settings', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : DEFAULT_GENERAL_SETTINGS))
      .then((data: GeneralSettingsConfig) => {
        if (blockRemoteSettingsHydrationRef.current) return
        setGeneralSettingsSaved(data)
        setGeneralSettingsDraft(data)
      })
      .catch(() => {
        if (blockRemoteSettingsHydrationRef.current) return
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
        if (blockRemoteSettingsHydrationRef.current) return
        setFloatingButtonsSaved(data)
        setFloatingButtonsDraft((prev) =>
          floatingButtonsConfigsEqual(prev, floatingButtonsSavedRef.current) ? data : prev
        )
      })
      .catch(() => {
        if (cancelled) return
        if (blockRemoteSettingsHydrationRef.current) return
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
        if (blockRemoteSettingsHydrationRef.current) return
        setBadgesSaved(data)
        setBadgesDraft((prev) =>
          badgesConfigsEqual(prev, badgesSavedRef.current) ? data : prev
        )
      })
      .catch(() => {
        if (cancelled) return
        if (blockRemoteSettingsHydrationRef.current) return
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
        if (blockRemoteSettingsHydrationRef.current) return
        setHeaderNavSaved(data)
        setHeaderNavDraft(data)
      })
      .catch(() => {
        if (blockRemoteSettingsHydrationRef.current) return
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

  const accountDirty = useMemo(
    () => !accountConfigsEqual(accountSaved, accountDraft),
    [accountSaved, accountDraft]
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
    } else if (id === 'account') {
      const page = getThemePageById('account')
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
      activeSection === 'account' &&
      !accountConfigsEqual(accountSavedRef.current, accountDraftRef.current)
    ) {
      void saveAccountRef.current()
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
    return runOptimisticSettingsSave<AnnouncementConfig>({
      getSnapshot: () => announcementSaved,
      getOptimistic: () => announcementDraft,
      applyLocal: (v) => {
        setAnnouncementSaved(v)
        setAnnouncementDraft(v)
      },
      persist: (v) => putAdminSettingsJson<AnnouncementConfig>('/api/admin/announcement', v),
      setSaving: setAnnouncementSaving,
      setStatus: setAnnouncementStatus,
      onWriteSuccess: noteSettingsWriteSuccess,
    })
  }, [announcementDraft, announcementSaved])

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
    return runOptimisticSettingsSave<HeroBannerConfig>({
      getSnapshot: () => heroBannerSavedRef.current,
      getOptimistic: () => heroBannerDraftRef.current,
      applyLocal: (v) => {
        heroBannerSavedRef.current = v
        heroBannerDraftRef.current = v
        setHeroBannerSaved(v)
        setHeroBannerDraft(v)
      },
      persist: (v) => putAdminSettingsJson<HeroBannerConfig>('/api/admin/hero-banner', v),
      setSaving: setHeroBannerSaving,
      setStatus: setHeroBannerStatus,
      onWriteSuccess: noteSettingsWriteSuccess,
    })
  }, [])

  const updateHomeDividerDraft = useCallback((patch: Partial<HomeDividerConfig>) => {
    setHomeDividerDraft((prev) => ({ ...prev, ...patch }))
    setHomeDividerStatus('idle')
  }, [])

  const saveHomeDivider = useCallback(async () => {
    return runOptimisticSettingsSave<HomeDividerConfig>({
      getSnapshot: () => homeDividerSaved,
      getOptimistic: () => homeDividerDraft,
      applyLocal: (v) => {
        setHomeDividerSaved(v)
        setHomeDividerDraft(v)
      },
      persist: (v) => putAdminSettingsJson<HomeDividerConfig>('/api/admin/home-divider', v),
      setSaving: setHomeDividerSaving,
      setStatus: setHomeDividerStatus,
      onWriteSuccess: noteSettingsWriteSuccess,
    })
  }, [homeDividerDraft, homeDividerSaved])

  const updateHomeDividerAfterCardsDraft = useCallback((patch: Partial<HomeDividerConfig>) => {
    setHomeDividerAfterCardsDraft((prev) => ({ ...prev, ...patch }))
    setHomeDividerAfterCardsStatus('idle')
  }, [])

  const saveHomeDividerAfterCards = useCallback(async () => {
    return runOptimisticSettingsSave<HomeDividerConfig>({
      getSnapshot: () => homeDividerAfterCardsSaved,
      getOptimistic: () => homeDividerAfterCardsDraft,
      applyLocal: (v) => {
        setHomeDividerAfterCardsSaved(v)
        setHomeDividerAfterCardsDraft(v)
      },
      persist: (v) => putAdminSettingsJson<HomeDividerConfig>('/api/admin/home-divider-after-cards', v),
      setSaving: setHomeDividerAfterCardsSaving,
      setStatus: setHomeDividerAfterCardsStatus,
      onWriteSuccess: noteSettingsWriteSuccess,
    })
  }, [homeDividerAfterCardsDraft, homeDividerAfterCardsSaved])

  const updateHomeDividerAfterTabsDraft = useCallback((patch: Partial<HomeDividerConfig>) => {
    setHomeDividerAfterTabsDraft((prev) => ({ ...prev, ...patch }))
    setHomeDividerAfterTabsStatus('idle')
  }, [])

  const saveHomeDividerAfterTabs = useCallback(async () => {
    return runOptimisticSettingsSave<HomeDividerConfig>({
      getSnapshot: () => homeDividerAfterTabsSaved,
      getOptimistic: () => homeDividerAfterTabsDraft,
      applyLocal: (v) => {
        setHomeDividerAfterTabsSaved(v)
        setHomeDividerAfterTabsDraft(v)
      },
      persist: (v) => putAdminSettingsJson<HomeDividerConfig>('/api/admin/home-divider-after-tabs', v),
      setSaving: setHomeDividerAfterTabsSaving,
      setStatus: setHomeDividerAfterTabsStatus,
      onWriteSuccess: noteSettingsWriteSuccess,
    })
  }, [homeDividerAfterTabsDraft, homeDividerAfterTabsSaved])

  const updateCollectionCardsDraft = useCallback((patch: Partial<CollectionCardsConfig>) => {
    setCollectionCardsDraft((prev) => ({ ...prev, ...patch }))
    setCollectionCardsStatus('idle')
  }, [])

  const saveCollectionCards = useCallback(async () => {
    return runOptimisticSettingsSave<CollectionCardsConfig>({
      getSnapshot: () => collectionCardsSaved,
      getOptimistic: () => collectionCardsDraft,
      applyLocal: (v) => {
        setCollectionCardsSaved(v)
        setCollectionCardsDraft(v)
      },
      persist: (v) => putAdminSettingsJson<CollectionCardsConfig>('/api/admin/collection-cards', v),
      setSaving: setCollectionCardsSaving,
      setStatus: setCollectionCardsStatus,
      onWriteSuccess: noteSettingsWriteSuccess,
    })
  }, [collectionCardsDraft, collectionCardsSaved])

  const updateCollectionTabsDraft = useCallback((patch: Partial<CollectionTabsConfig>) => {
    setCollectionTabsDraft((prev) => ({ ...prev, ...patch }))
    setCollectionTabsStatus('idle')
  }, [])

  const saveCollectionTabs = useCallback(async () => {
    return runOptimisticSettingsSave<CollectionTabsConfig>({
      getSnapshot: () => collectionTabsSaved,
      getOptimistic: () => collectionTabsDraft,
      applyLocal: (v) => {
        setCollectionTabsSaved(v)
        setCollectionTabsDraft(v)
      },
      persist: (v) => putAdminSettingsJson<CollectionTabsConfig>('/api/admin/collection-tabs', v),
      setSaving: setCollectionTabsSaving,
      setStatus: setCollectionTabsStatus,
      onWriteSuccess: noteSettingsWriteSuccess,
    })
  }, [collectionTabsDraft, collectionTabsSaved])

  const updateTrustBannerDraft = useCallback((patch: Partial<TrustBannerConfig>) => {
    setTrustBannerDraft((prev) => ({ ...prev, ...patch }))
    setTrustBannerStatus('idle')
  }, [])

  const saveTrustBanner = useCallback(async () => {
    return runOptimisticSettingsSave<TrustBannerConfig>({
      getSnapshot: () => trustBannerSaved,
      getOptimistic: () => trustBannerDraft,
      applyLocal: (v) => {
        setTrustBannerSaved(v)
        setTrustBannerDraft(v)
      },
      persist: (v) => putAdminSettingsJson<TrustBannerConfig>('/api/admin/trust-banner', v),
      setSaving: setTrustBannerSaving,
      setStatus: setTrustBannerStatus,
      onWriteSuccess: noteSettingsWriteSuccess,
    })
  }, [trustBannerDraft, trustBannerSaved])

  const updateHomeDividerAfterTrustBannerDraft = useCallback((patch: Partial<HomeDividerConfig>) => {
    setHomeDividerAfterTrustBannerDraft((prev) => ({ ...prev, ...patch }))
    setHomeDividerAfterTrustBannerStatus('idle')
  }, [])

  const saveHomeDividerAfterTrustBanner = useCallback(async () => {
    return runOptimisticSettingsSave<HomeDividerConfig>({
      getSnapshot: () => homeDividerAfterTrustBannerSaved,
      getOptimistic: () => homeDividerAfterTrustBannerDraft,
      applyLocal: (v) => {
        setHomeDividerAfterTrustBannerSaved(v)
        setHomeDividerAfterTrustBannerDraft(v)
      },
      persist: (v) => putAdminSettingsJson<HomeDividerConfig>('/api/admin/home-divider-after-trust-banner', v),
      setSaving: setHomeDividerAfterTrustBannerSaving,
      setStatus: setHomeDividerAfterTrustBannerStatus,
      onWriteSuccess: noteSettingsWriteSuccess,
    })
  }, [homeDividerAfterTrustBannerDraft, homeDividerAfterTrustBannerSaved])

  const updateHomeDividerAfterProductDraft = useCallback((patch: Partial<HomeDividerConfig>) => {
    setHomeDividerAfterProductDraft((prev) => ({ ...prev, ...patch }))
    setHomeDividerAfterProductStatus('idle')
  }, [])

  const saveHomeDividerAfterProduct = useCallback(async () => {
    return runOptimisticSettingsSave<HomeDividerConfig>({
      getSnapshot: () => homeDividerAfterProductSaved,
      getOptimistic: () => homeDividerAfterProductDraft,
      applyLocal: (v) => {
        setHomeDividerAfterProductSaved(v)
        setHomeDividerAfterProductDraft(v)
      },
      persist: (v) => putAdminSettingsJson<HomeDividerConfig>('/api/admin/home-divider-after-product', v),
      setSaving: setHomeDividerAfterProductSaving,
      setStatus: setHomeDividerAfterProductStatus,
      onWriteSuccess: noteSettingsWriteSuccess,
    })
  }, [homeDividerAfterProductDraft, homeDividerAfterProductSaved])

  const updateHomeDividerAfterRelatedProductsDraft = useCallback(
    (patch: Partial<HomeDividerConfig>) => {
      setHomeDividerAfterRelatedProductsDraft((prev) => ({ ...prev, ...patch }))
      setHomeDividerAfterRelatedProductsStatus('idle')
    },
    []
  )

  const saveHomeDividerAfterRelatedProducts = useCallback(async () => {
    return runOptimisticSettingsSave<HomeDividerConfig>({
      getSnapshot: () => homeDividerAfterRelatedProductsSaved,
      getOptimistic: () => homeDividerAfterRelatedProductsDraft,
      applyLocal: (v) => {
        setHomeDividerAfterRelatedProductsSaved(v)
        setHomeDividerAfterRelatedProductsDraft(v)
      },
      persist: (v) => putAdminSettingsJson<HomeDividerConfig>('/api/admin/home-divider-after-related-products', v),
      setSaving: setHomeDividerAfterRelatedProductsSaving,
      setStatus: setHomeDividerAfterRelatedProductsStatus,
      onWriteSuccess: noteSettingsWriteSuccess,
    })
  }, [homeDividerAfterRelatedProductsDraft, homeDividerAfterRelatedProductsSaved])

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
    return runOptimisticSettingsSave<StoreFooterConfig>({
      getSnapshot: () => storeFooterSaved,
      getOptimistic: () => storeFooterDraft,
      applyLocal: (v) => {
        setStoreFooterSaved(v)
        setStoreFooterDraft(v)
      },
      persist: (v) => putAdminSettingsJson<StoreFooterConfig>('/api/admin/store-footer', v),
      setSaving: setStoreFooterSaving,
      setStatus: setStoreFooterStatus,
      onWriteSuccess: noteSettingsWriteSuccess,
    })
  }, [storeFooterDraft, storeFooterSaved])

  const updateCollectionsListDraft = useCallback((patch: Partial<CollectionsListConfig>) => {
    setCollectionsListDraft((prev) => ({ ...prev, ...patch }))
    setCollectionsListStatus('idle')
  }, [])

  const saveCollectionsList = useCallback(async () => {
    return runOptimisticSettingsSave<CollectionsListConfig>({
      getSnapshot: () => collectionsListSaved,
      getOptimistic: () => collectionsListDraft,
      applyLocal: (v) => {
        setCollectionsListSaved(v)
        setCollectionsListDraft(v)
      },
      persist: (v) => putAdminSettingsJson<CollectionsListConfig>('/api/admin/collections-list', v),
      setSaving: setCollectionsListSaving,
      setStatus: setCollectionsListStatus,
      onWriteSuccess: noteSettingsWriteSuccess,
    })
  }, [collectionsListDraft, collectionsListSaved])

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
    return runOptimisticSettingsSave<CollectionProductsConfig>({
      getSnapshot: () => collectionProductsSavedRef.current,
      getOptimistic: () => collectionProductsDraftRef.current,
      applyLocal: (v) => {
        collectionProductsLocalAuthorityRef.current = true
        collectionProductsSavedRef.current = v
        collectionProductsDraftRef.current = v
        setCollectionProductsSaved(v)
        setCollectionProductsDraft(v)
      },
      persist: (v) => persistCollectionProductsSettings(v),
      setSaving: setCollectionProductsSaving,
      setStatus: setCollectionProductsStatus,
      setErrorMessage: setCollectionProductsErrorMessage,
      onWriteSuccess: noteSettingsWriteSuccess,
    })
  }, [])

  saveCollectionProductsRef.current = saveCollectionProducts

  const updateProductPageDraft = useCallback((patch: Partial<ProductPageConfig>) => {
    setProductPageDraft((prev) => ({ ...prev, ...patch }))
    setProductPageStatus('idle')
  }, [])

  const saveProductPage = useCallback(async () => {
    return runOptimisticSettingsSave<ProductPageConfig>({
      getSnapshot: () => productPageSavedRef.current,
      getOptimistic: () => productPageDraftRef.current,
      applyLocal: (v) => {
        productPageLocalAuthorityRef.current = true
        productPageSavedRef.current = v
        productPageDraftRef.current = v
        setProductPageSaved(v)
        setProductPageDraft(v)
      },
      persist: (v) => persistProductPageSettings(v),
      setSaving: setProductPageSaving,
      setStatus: setProductPageStatus,
      onWriteSuccess: noteSettingsWriteSuccess,
    })
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
    return runOptimisticSettingsSave<RelatedProductsConfig>({
      getSnapshot: () => relatedProductsSavedRef.current,
      getOptimistic: () => relatedProductsDraftRef.current,
      applyLocal: (v) => {
        relatedProductsLocalAuthorityRef.current = true
        relatedProductsSavedRef.current = v
        relatedProductsDraftRef.current = v
        setRelatedProductsSaved(v)
        setRelatedProductsDraft(v)
      },
      persist: (v) => persistRelatedProductsSettings(v),
      setSaving: setRelatedProductsSaving,
      setStatus: setRelatedProductsStatus,
      onWriteSuccess: noteSettingsWriteSuccess,
    })
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
    return runOptimisticSettingsSave<RecentProductsConfig>({
      getSnapshot: () => recentProductsSavedRef.current,
      getOptimistic: () => recentProductsDraftRef.current,
      applyLocal: (v) => {
        recentProductsLocalAuthorityRef.current = true
        recentProductsSavedRef.current = v
        recentProductsDraftRef.current = v
        setRecentProductsSaved(v)
        setRecentProductsDraft(v)
      },
      persist: (v) => persistRecentProductsSettings(v),
      setSaving: setRecentProductsSaving,
      setStatus: setRecentProductsStatus,
      onWriteSuccess: noteSettingsWriteSuccess,
    })
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
    return runOptimisticSettingsSave<SearchConfig>({
      getSnapshot: () => searchSavedRef.current,
      getOptimistic: () => searchDraftRef.current,
      applyLocal: (v) => {
        searchLocalAuthorityRef.current = true
        searchSavedRef.current = v
        searchDraftRef.current = v
        setSearchSaved(v)
        setSearchDraft(v)
      },
      persist: (v) => persistSearchSettings(v),
      setSaving: setSearchSaving,
      setStatus: setSearchStatus,
      onWriteSuccess: noteSettingsWriteSuccess,
    })
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
    return runOptimisticSettingsSave<CartConfig>({
      getSnapshot: () => cartSavedRef.current,
      getOptimistic: () => cartDraftRef.current,
      applyLocal: (v) => {
        cartLocalAuthorityRef.current = true
        cartSavedRef.current = v
        cartDraftRef.current = v
        setCartSaved(v)
        setCartDraft(v)
      },
      persist: (v) => persistCartSettings(v),
      setSaving: setCartSaving,
      setStatus: setCartStatus,
      onWriteSuccess: noteSettingsWriteSuccess,
    })
  }, [])

  saveCartRef.current = saveCart

  const updateAccountDraft = useCallback((patch: Partial<AccountConfig>) => {
    setAccountDraft((prev) => {
      const next = { ...prev, ...patch }
      accountDraftRef.current = next
      return next
    })
    setAccountStatus('idle')
  }, [])

  const saveAccount = useCallback(async () => {
    return runOptimisticSettingsSave<AccountConfig>({
      getSnapshot: () => accountSavedRef.current,
      getOptimistic: () => accountDraftRef.current,
      applyLocal: (v) => {
        accountLocalAuthorityRef.current = true
        accountSavedRef.current = v
        accountDraftRef.current = v
        setAccountSaved(v)
        setAccountDraft(v)
      },
      persist: (v) => persistAccountSettings(v),
      setSaving: setAccountSaving,
      setStatus: setAccountStatus,
      onWriteSuccess: noteSettingsWriteSuccess,
    })
  }, [])

  saveAccountRef.current = saveAccount

  const updateCheckoutDraft = useCallback((patch: Partial<CheckoutConfig>) => {
    setCheckoutDraft((prev) => {
      const next = { ...prev, ...patch }
      checkoutDraftRef.current = next
      return next
    })
    setCheckoutStatus('idle')
    setCheckoutErrorMessage(null)
  }, [])

  const saveCheckout = useCallback(async () => {
    return runOptimisticSettingsSave<CheckoutConfig>({
      getSnapshot: () => checkoutSavedRef.current,
      getOptimistic: () => checkoutDraftRef.current,
      applyLocal: (v) => {
        checkoutLocalAuthorityRef.current = true
        checkoutSavedRef.current = v
        checkoutDraftRef.current = v
        setCheckoutSaved(v)
        setCheckoutDraft(v)
      },
      persist: (v) => persistCheckoutSettings(v),
      setSaving: setCheckoutSaving,
      setStatus: setCheckoutStatus,
      setErrorMessage: setCheckoutErrorMessage,
      onWriteSuccess: noteSettingsWriteSuccess,
    })
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
    return runOptimisticSettingsSave<LogoFaviconConfig>({
      getSnapshot: () => logoFaviconSaved,
      getOptimistic: () => logoFaviconDraft,
      applyLocal: (v) => {
        setLogoFaviconSaved(v)
        setLogoFaviconDraft(v)
      },
      persist: (v) => putAdminSettingsJson<LogoFaviconConfig>('/api/admin/logo-favicon', v),
      setSaving: setLogoFaviconSaving,
      setStatus: setLogoFaviconStatus,
      onWriteSuccess: () => {
        noteSettingsWriteSuccess()
        dispatchStoreThemeRefresh({ keys: ['logo-favicon'] })
      },
    })
  }, [logoFaviconDraft, logoFaviconSaved])

  const updateGeneralSettingsDraft = useCallback((patch: Partial<GeneralSettingsConfig>) => {
    setGeneralSettingsDraft((prev) => ({ ...prev, ...patch }))
    setGeneralSettingsStatus('idle')
  }, [])

  const saveGeneralSettings = useCallback(async () => {
    return runOptimisticSettingsSave<GeneralSettingsConfig>({
      getSnapshot: () => generalSettingsSaved,
      getOptimistic: () => generalSettingsDraft,
      applyLocal: (v) => {
        setGeneralSettingsSaved(v)
        setGeneralSettingsDraft(v)
      },
      persist: (v) => putAdminSettingsJson<GeneralSettingsConfig>('/api/admin/general-settings', v),
      setSaving: setGeneralSettingsSaving,
      setStatus: setGeneralSettingsStatus,
      onWriteSuccess: () => {
        noteSettingsWriteSuccess()
        dispatchStoreThemeRefresh({ keys: ['general'] })
      },
    })
  }, [generalSettingsDraft, generalSettingsSaved])

  const updateFloatingButtonsDraft = useCallback((patch: Partial<FloatingButtonsConfig>) => {
    setFloatingButtonsDraft((prev) => ({ ...prev, ...patch }))
    setFloatingButtonsStatus('idle')
  }, [])

  const saveFloatingButtons = useCallback(async () => {
    return runOptimisticSettingsSave<FloatingButtonsConfig>({
      getSnapshot: () => floatingButtonsSavedRef.current,
      getOptimistic: () => floatingButtonsDraftRef.current,
      applyLocal: (v) => {
        floatingButtonsSavedRef.current = v
        floatingButtonsDraftRef.current = v
        setFloatingButtonsSaved(v)
        setFloatingButtonsDraft(v)
      },
      persist: (v) => persistFloatingButtons(v),
      setSaving: setFloatingButtonsSaving,
      setStatus: setFloatingButtonsStatus,
      onWriteSuccess: noteSettingsWriteSuccess,
    })
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
    return runOptimisticSettingsSave<BadgesConfig>({
      getSnapshot: () => badgesSavedRef.current,
      getOptimistic: () => badgesDraftRef.current,
      applyLocal: (v) => {
        badgesSavedRef.current = v
        badgesDraftRef.current = v
        setBadgesSaved(v)
        setBadgesDraft(v)
      },
      persist: (v) => persistBadgesSettings(v),
      setSaving: setBadgesSaving,
      setStatus: setBadgesStatus,
      onWriteSuccess: noteSettingsWriteSuccess,
    })
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
    return runOptimisticSettingsSave<HeaderNavSettingsConfig>({
      getSnapshot: () => headerNavSaved,
      getOptimistic: () => headerNavDraft,
      applyLocal: (v) => {
        setHeaderNavSaved(v)
        setHeaderNavDraft(v)
      },
      persist: (v) => putAdminSettingsJson<HeaderNavSettingsConfig>('/api/admin/header-settings', v),
      setSaving: setHeaderNavSaving,
      setStatus: setHeaderNavStatus,
      onWriteSuccess: () => {
        noteSettingsWriteSuccess()
        dispatchStoreThemeRefresh({ keys: ['header-nav'] })
      },
    })
  }, [headerNavDraft, headerNavSaved])

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
      accountLoading,
      accountSaving,
      accountSaved,
      accountDraft,
      accountDirty,
      accountStatus,
      accountPreviewLoggedIn,
      setAccountPreviewLoggedIn,
      updateAccountDraft,
      saveAccount,
      checkoutLoading,
      checkoutSaving,
      checkoutSaved,
      checkoutDraft,
      checkoutDirty,
      checkoutStatus,
      checkoutErrorMessage,
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
      accountLoading,
      accountSaving,
      accountSaved,
      accountDraft,
      accountDirty,
      accountStatus,
      accountPreviewLoggedIn,
      setAccountPreviewLoggedIn,
      updateAccountDraft,
      saveAccount,
      checkoutLoading,
      checkoutSaving,
      checkoutSaved,
      checkoutDraft,
      checkoutDirty,
      checkoutStatus,
      checkoutErrorMessage,
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
