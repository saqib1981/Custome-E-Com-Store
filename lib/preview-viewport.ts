export type PreviewViewport = 'mobile' | 'tablet' | 'desktop'

export const PREVIEW_VIEWPORT_WIDTHS: Record<PreviewViewport, number | null> = {
  mobile: 390,
  tablet: 768,
  desktop: null,
}

/** True when preview should mimic desktop layout (horizontal nav, no hamburger). */
export function isPreviewDesktopLayout(viewport?: PreviewViewport): boolean {
  if (!viewport) return false
  return viewport === 'desktop'
}

/** True when preview should mimic compact/mobile header actions. */
export function isPreviewCompactActions(viewport?: PreviewViewport): boolean {
  if (!viewport) return false
  return viewport === 'mobile'
}
