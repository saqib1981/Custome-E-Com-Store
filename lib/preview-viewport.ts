import { PREVIEW_FRAME_WIDTH } from '@/lib/breakpoints'

export type PreviewViewport = 'mobile' | 'tablet' | 'desktop'

export const PREVIEW_VIEWPORT_WIDTHS: Record<PreviewViewport, number | null> = {
  mobile: PREVIEW_FRAME_WIDTH.mobile,
  tablet: PREVIEW_FRAME_WIDTH.tablet,
  desktop: PREVIEW_FRAME_WIDTH.desktop,
}

/** True when preview should mimic desktop header (horizontal nav, no hamburger). */
export function isPreviewDesktopLayout(viewport?: PreviewViewport): boolean {
  if (!viewport) return false
  return viewport === 'desktop'
}

/** True when preview should use wide/multi-column content (tablet + desktop). */
export function isPreviewWideLayout(viewport?: PreviewViewport): boolean {
  if (!viewport) return false
  return viewport === 'tablet' || viewport === 'desktop'
}

/** True when preview should mimic phone layout. */
export function isPreviewMobileLayout(viewport?: PreviewViewport): boolean {
  if (!viewport) return false
  return viewport === 'mobile'
}

/** True when preview should mimic compact/mobile header actions. */
export function isPreviewCompactActions(viewport?: PreviewViewport): boolean {
  if (!viewport) return false
  return viewport === 'mobile'
}

/**
 * Explicit grid class for admin preview frames.
 * Never use Tailwind sm:/md:/lg: here — those follow the browser window, not the preview frame.
 */
export function previewCollectionColsClass(
  viewport: PreviewViewport,
  columnsDesktop: 2 | 3 | 4 = 4
): string {
  if (viewport === 'mobile') return 'grid-cols-2'
  if (viewport === 'tablet') {
    return Math.min(3, columnsDesktop) === 2 ? 'grid-cols-2' : 'grid-cols-3'
  }
  if (columnsDesktop === 2) return 'grid-cols-2'
  if (columnsDesktop === 3) return 'grid-cols-3'
  return 'grid-cols-4'
}

/** Bootstrap row classes for /collections preview — no row-cols-sm-* (browser breakpoints). */
export function previewCollectionsBootstrapRowClass(
  viewport: PreviewViewport,
  columnsDesktop: 2 | 3 | 4 = 4
): string {
  if (viewport === 'mobile') return 'row row-cols-2 g-2'
  if (viewport === 'tablet') {
    const cols = Math.min(3, columnsDesktop)
    return cols === 2 ? 'row row-cols-2 g-2' : 'row row-cols-3 g-2'
  }
  if (columnsDesktop === 2) return 'row row-cols-2 g-2'
  if (columnsDesktop === 3) return 'row row-cols-3 g-2'
  return 'row row-cols-4 g-2'
}

/**
 * Product PDP layout for admin preview — never use lg: here (follows window, not frame).
 * Mobile/tablet: image stacked above details. Desktop: two columns.
 */
export function previewProductPageGridClass(viewport?: PreviewViewport): string {
  if (viewport === 'desktop') {
    return 'grid grid-cols-2 items-start gap-6 min-w-0 max-w-full'
  }
  return 'grid grid-cols-1 gap-6 min-w-0 max-w-full'
}

/** Storefront PDP grid (browser breakpoints). */
export function storefrontProductPageGridClass(): string {
  return 'grid grid-cols-1 gap-6 min-w-0 max-w-full lg:grid-cols-2 lg:items-start lg:gap-10'
}
