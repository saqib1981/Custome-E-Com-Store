'use client'

import { useEffect, useState } from 'react'
import { ChevronDown, ChevronUp, Loader2, Trash2 } from 'lucide-react'
import AdminPanelShell from '@/components/admin/AdminPanelShell'
import {
  ImageUploadField,
  SettingsCollapsibleSection,
} from '@/components/admin/LogoFaviconFields'
import { useAdminEditor } from '@/context/AdminEditorContext'
import {
  createHeroSlide,
  HERO_BANNER_IMAGE_SIZE_HINT,
  parseHeroHeightPx,
  type HeroSlide,
} from '@/lib/hero-banner'
import {
  parseCollectionHandleFromLink,
  shopifyCollectionPath,
  type ShopifyCollectionSummary,
} from '@/lib/shopify-collections'
import { isShopifyFilesUrl } from '@/lib/store-media'

const inputClass =
  'w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100'

const HEIGHT_DESKTOP_PRESETS = [480, 560, 640, 720, 800] as const
const HEIGHT_MOBILE_PRESETS = [320, 400, 480, 560] as const

function parseHeightPx(value: string, fallback: number): number {
  return parseHeroHeightPx(value, fallback)
}

const CUSTOM_LINK_VALUE = '__custom__'

type HeroSlideEditorProps = {
  slide: HeroSlide
  index: number
  uploadingDesktop: boolean
  uploadingMobile: boolean
  collections: ShopifyCollectionSummary[]
  collectionsLoading: boolean
  collectionsError: string | null
  onChange: (patch: Partial<HeroSlide>) => void
  onRemove: () => void
  onUpload: (file: File, target: 'desktop' | 'mobile') => Promise<void>
}

function HeroSlideEditor({
  slide,
  index,
  uploadingDesktop,
  uploadingMobile,
  collections,
  collectionsLoading,
  collectionsError,
  onChange,
  onRemove,
  onUpload,
}: HeroSlideEditorProps) {
  const [open, setOpen] = useState(index === 0)

  const linkUrl = slide.linkUrl.trim()
  const collectionHandle = parseCollectionHandleFromLink(linkUrl)
  const matchedCollection = collectionHandle
    ? collections.find((collection) => collection.handle === collectionHandle)
    : null
  const useCustomLink = Boolean(linkUrl && !matchedCollection)

  const linkSelectValue = useCustomLink
    ? CUSTOM_LINK_VALUE
    : collectionHandle
      ? shopifyCollectionPath(collectionHandle)
      : ''

  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-2 px-3 py-2">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex min-w-0 flex-1 items-center gap-2 text-left text-sm font-medium text-gray-800 dark:text-gray-200"
        >
          {open ? <ChevronUp className="h-4 w-4 shrink-0" /> : <ChevronDown className="h-4 w-4 shrink-0" />}
          <span className="truncate">Slide {index + 1}{slide.alt ? ` · ${slide.alt}` : ''}</span>
        </button>
        <button
          type="button"
          onClick={onRemove}
          className="rounded p-1.5 text-gray-500 hover:bg-red-50 hover:text-red-600"
          aria-label={`Remove slide ${index + 1}`}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
      {open ? (
        <div className="space-y-1 border-t border-gray-100 px-1 pb-2 pt-1 dark:border-gray-800">
          <ImageUploadField
            id={`hero-slide-${slide.id}-desktop`}
            label="Desktop image"
            imageUrl={slide.imageUrl}
            fileName={slide.imageFileName}
            helperText={`Recommended ${HERO_BANNER_IMAGE_SIZE_HINT.desktop}. Stored in Shopify Files.`}
            uploading={uploadingDesktop}
            onUpload={(file) => onUpload(file, 'desktop')}
          />
          <ImageUploadField
            id={`hero-slide-${slide.id}-mobile`}
            label="Mobile image"
            imageUrl={slide.imageUrlMobile}
            fileName={slide.imageFileNameMobile}
            helperText={`Recommended ${HERO_BANNER_IMAGE_SIZE_HINT.mobile}. Optional — uses desktop if empty.`}
            uploading={uploadingMobile}
            onUpload={(file) => onUpload(file, 'mobile')}
          />
          <div className="px-3 py-2">
            <label
              htmlFor={`hero-slide-link-${slide.id}`}
              className="mb-1 block text-sm font-medium text-gray-800 dark:text-gray-200"
            >
              Slide link (optional)
            </label>
            <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
              Choose a collection — clicking the slide opens that collection page.
            </p>
            {collectionsLoading ? (
              <div className="flex items-center gap-2 rounded-md border border-gray-200 px-3 py-2.5 text-sm text-gray-500 dark:border-gray-600">
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                Loading collections…
              </div>
            ) : collectionsError ? (
              <div className="space-y-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-3 text-xs text-amber-950 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-100">
                <p>{collectionsError}</p>
                <p>
                  Enable{' '}
                  <code className="rounded bg-amber-100 px-1 py-0.5 dark:bg-amber-900/50">read_products</code>{' '}
                  scope on your Shopify app, or enter a custom path below.
                </p>
                <input
                  id={`hero-slide-link-${slide.id}`}
                  type="text"
                  value={slide.linkUrl}
                  onChange={(e) => onChange({ linkUrl: e.target.value })}
                  className={inputClass}
                  placeholder="/collections/all"
                />
              </div>
            ) : (
              <>
                <select
                  id={`hero-slide-link-${slide.id}`}
                  value={linkSelectValue}
                  onChange={(e) => {
                    const value = e.target.value
                    if (value === '') {
                      onChange({ linkUrl: '' })
                      return
                    }
                    if (value === CUSTOM_LINK_VALUE) {
                      onChange({ linkUrl: linkUrl || '/collections/all' })
                      return
                    }
                    onChange({ linkUrl: value })
                  }}
                  className={inputClass}
                >
                  <option value="">No link</option>
                  {collections.map((collection) => (
                    <option key={collection.id} value={shopifyCollectionPath(collection.handle)}>
                      {collection.title}
                    </option>
                  ))}
                  <option value={CUSTOM_LINK_VALUE}>Custom URL…</option>
                </select>
                {useCustomLink ? (
                  <input
                    id={`hero-slide-link-custom-${slide.id}`}
                    type="text"
                    value={slide.linkUrl}
                    onChange={(e) => onChange({ linkUrl: e.target.value })}
                    className={`${inputClass} mt-2`}
                    placeholder="/collections/all"
                  />
                ) : null}
              </>
            )}
          </div>
          <div className="px-3 pb-2">
            <label htmlFor={`hero-slide-alt-${slide.id}`} className="mb-1 block text-sm font-medium text-gray-800 dark:text-gray-200">
              Alt text
            </label>
            <input
              id={`hero-slide-alt-${slide.id}`}
              type="text"
              value={slide.alt}
              onChange={(e) => onChange({ alt: e.target.value })}
              className={inputClass}
              maxLength={120}
            />
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default function HeroBannerSettingsPanel() {
  const {
    closeSection,
    heroBannerDraft,
    heroBannerDirty,
    heroBannerSaving,
    heroBannerStatus,
    updateHeroBannerDraft,
    saveHeroBanner,
  } = useAdminEditor()

  const [uploadingKey, setUploadingKey] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [collections, setCollections] = useState<ShopifyCollectionSummary[]>([])
  const [collectionsLoading, setCollectionsLoading] = useState(true)
  const [collectionsError, setCollectionsError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setCollectionsLoading(true)

    void fetch('/api/admin/shopify-collections', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error('Failed to load collections'))))
      .then((data: { collections?: ShopifyCollectionSummary[]; error?: string | null }) => {
        if (cancelled) return
        setCollections(Array.isArray(data.collections) ? data.collections : [])
        setCollectionsError(data.error ?? null)
      })
      .catch(() => {
        if (cancelled) return
        setCollections([])
        setCollectionsError('Could not load collections from Shopify.')
      })
      .finally(() => {
        if (!cancelled) setCollectionsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const updateSlide = (id: string, patch: Partial<HeroSlide>) => {
    updateHeroBannerDraft((prev) => ({
      slides: prev.slides.map((slide) => (slide.id === id ? { ...slide, ...patch } : slide)),
    }))
  }

  const removeSlide = (id: string) => {
    updateHeroBannerDraft((prev) => ({
      slides: prev.slides.filter((slide) => slide.id !== id),
    }))
  }

  const addSlide = () => {
    updateHeroBannerDraft((prev) => ({
      slides: [...prev.slides, createHeroSlide()],
    }))
  }

  const uploadSlideImage = async (slideId: string, file: File, target: 'desktop' | 'mobile') => {
    const key = `${slideId}:${target}`
    setUploadingKey(key)
    setUploadError(null)
    try {
      const form = new FormData()
      form.append('file', file)
      form.append('folder', 'hero')

      const res = await fetch('/api/admin/upload', { method: 'POST', body: form })
      const data = (await res.json()) as { url?: string; fileName?: string; error?: string }

      if (!res.ok) {
        throw new Error(data.error || 'Upload failed')
      }
      if (!data.url?.trim() || !data.fileName?.trim()) {
        throw new Error('Upload did not return a file URL')
      }
      if (!isShopifyFilesUrl(data.url)) {
        throw new Error('Upload must return a Shopify CDN URL — try again in a moment')
      }

      updateHeroBannerDraft((prev) => ({
        slides: prev.slides.map((slide) =>
          slide.id === slideId
            ? target === 'desktop'
              ? { ...slide, imageUrl: data.url!, imageFileName: data.fileName! }
              : { ...slide, imageUrlMobile: data.url!, imageFileNameMobile: data.fileName! }
            : slide
        ),
      }))
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : 'Upload failed')
    } finally {
      setUploadingKey(null)
    }
  }

  const desktopHeight = parseHeightPx(heroBannerDraft.heightDesktop, 800)
  const mobileHeight = parseHeightPx(heroBannerDraft.heightMobile, 480)

  return (
    <AdminPanelShell
      title="Hero slider"
      subtitle="Homepage image slider below the header"
      onBack={closeSection}
      onSave={() => void saveHeroBanner()}
      saveDisabled={!heroBannerDirty}
      saving={heroBannerSaving}
      status={heroBannerStatus}
    >
      <SettingsCollapsibleSection title="Visibility" defaultOpen>
        <label className="flex cursor-pointer items-center justify-between gap-3 py-2">
          <span className="text-sm font-medium text-gray-800 dark:text-gray-200">Show hero slider</span>
          <input
            type="checkbox"
            checked={heroBannerDraft.enabled}
            onChange={(e) => updateHeroBannerDraft({ enabled: e.target.checked })}
            className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
        </label>
      </SettingsCollapsibleSection>

      <SettingsCollapsibleSection title="Slides" defaultOpen>
        <p className="mb-3 text-xs text-gray-500 dark:text-gray-400">
          All images and videos upload to <strong>Shopify Files</strong> only (
          {HERO_BANNER_IMAGE_SIZE_HINT.desktop} desktop · {HERO_BANNER_IMAGE_SIZE_HINT.mobile} mobile).
        </p>
        {uploadError ? (
          <p className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
            {uploadError}
          </p>
        ) : null}
        <div className="space-y-3 pb-2">
          {heroBannerDraft.slides.map((slide, index) => (
            <HeroSlideEditor
              key={slide.id}
              slide={slide}
              index={index}
              uploadingDesktop={uploadingKey === `${slide.id}:desktop`}
              uploadingMobile={uploadingKey === `${slide.id}:mobile`}
              collections={collections}
              collectionsLoading={collectionsLoading}
              collectionsError={collectionsError}
              onChange={(patch) => updateSlide(slide.id, patch)}
              onRemove={() => removeSlide(slide.id)}
              onUpload={(file, target) => uploadSlideImage(slide.id, file, target)}
            />
          ))}
          <button
            type="button"
            onClick={addSlide}
            className="w-full rounded-md border border-dashed border-gray-300 px-3 py-2.5 text-sm font-medium text-gray-700 hover:border-primary-400 hover:bg-primary-50 hover:text-primary-700 dark:border-gray-600 dark:text-gray-300"
          >
            + Add slide
          </button>
        </div>
      </SettingsCollapsibleSection>

      <SettingsCollapsibleSection title="Slider settings">
        <div className="space-y-4 pb-2">
          <label className="flex cursor-pointer items-center justify-between gap-3 py-2">
            <span className="text-sm font-medium text-gray-800 dark:text-gray-200">Autoplay</span>
            <input
              type="checkbox"
              checked={heroBannerDraft.autoplay}
              onChange={(e) => updateHeroBannerDraft({ autoplay: e.target.checked })}
              className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
          </label>
          <div>
            <label htmlFor="hero-autoplay-seconds" className="mb-1 block text-sm font-medium text-gray-800 dark:text-gray-200">
              Autoplay interval ({heroBannerDraft.autoplaySeconds}s)
            </label>
            <input
              id="hero-autoplay-seconds"
              type="range"
              min={3}
              max={30}
              value={heroBannerDraft.autoplaySeconds}
              onChange={(e) => updateHeroBannerDraft({ autoplaySeconds: Number(e.target.value) })}
              className="w-full accent-primary-600"
            />
          </div>
        </div>
      </SettingsCollapsibleSection>

      <SettingsCollapsibleSection title="Layout">
        <p className="mb-3 px-3 text-xs text-gray-500 dark:text-gray-400">
          Heights set the slider proportions at the recommended design widths (
          {HERO_BANNER_IMAGE_SIZE_HINT.desktop} desktop · {HERO_BANNER_IMAGE_SIZE_HINT.mobile} mobile).
          The slider scales with screen width like a responsive image — nothing is cropped.
        </p>
        <div className="space-y-4 pb-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-800 dark:text-gray-200">
              Desktop height ({desktopHeight}px)
            </label>
            <div className="flex flex-wrap gap-2">
              {HEIGHT_DESKTOP_PRESETS.map((px) => (
                <button
                  key={px}
                  type="button"
                  onClick={() => updateHeroBannerDraft({ heightDesktop: `${px}px` })}
                  className={`rounded-md border px-2.5 py-1.5 text-xs font-medium ${
                    desktopHeight === px
                      ? 'border-primary-600 bg-primary-50 text-primary-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {px}px
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-800 dark:text-gray-200">
              Mobile height ({mobileHeight}px)
            </label>
            <div className="flex flex-wrap gap-2">
              {HEIGHT_MOBILE_PRESETS.map((px) => (
                <button
                  key={px}
                  type="button"
                  onClick={() => updateHeroBannerDraft({ heightMobile: `${px}px` })}
                  className={`rounded-md border px-2.5 py-1.5 text-xs font-medium ${
                    mobileHeight === px
                      ? 'border-primary-600 bg-primary-50 text-primary-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {px}px
                </button>
              ))}
            </div>
          </div>
        </div>
      </SettingsCollapsibleSection>
    </AdminPanelShell>
  )
}
