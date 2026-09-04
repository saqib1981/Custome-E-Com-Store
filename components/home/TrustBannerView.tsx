'use client'

import { BadgeCheck, MessagesSquare, Package, type LucideIcon } from 'lucide-react'
import type { TrustBannerConfig, TrustBannerIcon, TrustBannerItem } from '@/lib/trust-banner'
import type { PreviewViewport } from '@/lib/preview-viewport'

type TrustBannerViewProps = {
  config: TrustBannerConfig
  preview?: boolean
  previewViewport?: PreviewViewport
}

const ICONS: Record<TrustBannerIcon, LucideIcon> = {
  shipping: Package,
  returns: BadgeCheck,
  support: MessagesSquare,
}

function resolveGridClass(preview: boolean, previewViewport?: PreviewViewport): string {
  if (preview && previewViewport) {
    return previewViewport === 'mobile'
      ? 'grid w-full grid-cols-1'
      : 'grid w-full grid-cols-3'
  }
  return 'grid w-full grid-cols-1 md:grid-cols-3'
}

function resolveColumnClass(preview: boolean, previewViewport?: PreviewViewport): string {
  if (preview && previewViewport) {
    return previewViewport === 'mobile'
      ? 'flex w-full min-w-0 flex-col items-center justify-center px-5 py-8 text-center'
      : 'flex w-full min-w-0 flex-col items-center justify-center px-8 py-10 text-center'
  }
  return 'flex w-full min-w-0 flex-col items-center justify-center px-5 py-8 text-center md:px-8 md:py-10'
}

function TrustBannerColumn({
  item,
  textColor,
  preview = false,
  previewViewport,
}: {
  item: TrustBannerItem
  textColor: string
  preview?: boolean
  previewViewport?: PreviewViewport
}) {
  const Icon = ICONS[item.icon] ?? Package
  const isPreviewMobile = preview && previewViewport === 'mobile'
  const iconClass =
    preview && previewViewport
      ? isPreviewMobile
        ? 'mb-4 h-12 w-12 shrink-0'
        : 'mb-4 h-14 w-14 shrink-0'
      : 'mb-4 h-12 w-12 shrink-0 md:h-14 md:w-14'
  const titleClass =
    preview && previewViewport
      ? isPreviewMobile
        ? 'mb-2 text-base font-semibold'
        : 'mb-2 text-lg font-semibold'
      : 'mb-2 text-base font-semibold md:text-lg'
  const bodyClass =
    preview && previewViewport
      ? isPreviewMobile
        ? 'w-full max-w-md text-sm leading-relaxed opacity-95'
        : 'w-full max-w-md text-[15px] leading-relaxed opacity-95'
      : 'w-full max-w-md text-sm leading-relaxed opacity-95 md:text-[15px]'

  return (
    <div className={resolveColumnClass(preview, previewViewport)}>
      <Icon className={iconClass} style={{ color: textColor }} strokeWidth={1.25} aria-hidden />
      <h3 className={titleClass} style={{ color: textColor }}>
        {item.title}
      </h3>
      <p className={bodyClass} style={{ color: textColor }}>
        {item.description}
      </p>
    </div>
  )
}

export default function TrustBannerView({
  config,
  preview = false,
  previewViewport,
}: TrustBannerViewProps) {
  if (!config.enabled) return null

  const visibleItems = config.items.filter((item) => item.title.trim() || item.description.trim())
  if (!visibleItems.length) return null

  return (
    <section
      className="w-full max-w-none shrink-0"
      style={{ backgroundColor: config.backgroundColor }}
      aria-label="Store benefits"
    >
      <div className={resolveGridClass(preview, previewViewport)}>
        {visibleItems.map((item) => (
          <TrustBannerColumn
            key={item.id}
            item={item}
            textColor={config.textColor}
            preview={preview}
            previewViewport={previewViewport}
          />
        ))}
      </div>
    </section>
  )
}
