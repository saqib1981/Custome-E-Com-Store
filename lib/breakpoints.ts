/**
 * Bootstrap 5–aligned breakpoints, media queries, and container max-widths.
 * Keep in sync with `.cursor/rules/screen-breakpoints.mdc` and `tailwind.config.js` screens.
 *
 * // X-Small devices (portrait phones, less than 576px)
 * // No media query for `xs` since this is the default in Bootstrap
 *
 * // Small devices (landscape phones, 576px and up)
 * @media (min-width: 576px) { ... }
 *
 * // Medium devices (tablets, 768px and up)
 * @media (min-width: 768px) { ... }
 *
 * // Large devices (desktops, 992px and up)
 * @media (min-width: 992px) { ... }
 *
 * // X-Large devices (large desktops, 1200px and up)
 * @media (min-width: 1200px) { ... }
 *
 * // XX-Large devices (larger desktops, 1400px and up)
 * @media (min-width: 1400px) { ... }
 */

export type BreakpointName = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl'

/** Min-width (px) where each breakpoint becomes active. `xs` is the default base. */
export const BREAKPOINT_MIN_WIDTH: Record<BreakpointName, number> = {
  xs: 0,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
  xxl: 1400,
}

/**
 * Bootstrap `.container` max-widths at each breakpoint.
 * `xs` has no fixed max (fluid / auto).
 */
export const CONTAINER_MAX_WIDTH: Record<BreakpointName, number | null> = {
  xs: null,
  sm: 540,
  md: 720,
  lg: 960,
  xl: 1140,
  xxl: 1320,
}

/**
 * Mobile-first `min-width` media queries.
 * `xs` is null — no query; styles apply by default.
 */
export const BREAKPOINT_MEDIA_MIN: Record<BreakpointName, string | null> = {
  xs: null,
  sm: `(min-width: ${BREAKPOINT_MIN_WIDTH.sm}px)`,
  md: `(min-width: ${BREAKPOINT_MIN_WIDTH.md}px)`,
  lg: `(min-width: ${BREAKPOINT_MIN_WIDTH.lg}px)`,
  xl: `(min-width: ${BREAKPOINT_MIN_WIDTH.xl}px)`,
  xxl: `(min-width: ${BREAKPOINT_MIN_WIDTH.xxl}px)`,
}

/** Admin preview frame widths mapped onto the breakpoint scale. */
export const PREVIEW_FRAME_WIDTH = {
  /** Typical phone; still within `xs` (<576). */
  mobile: 390,
  /** `md` floor. */
  tablet: BREAKPOINT_MIN_WIDTH.md,
  /** Full pane — behaves as `lg`+. */
  desktop: null as number | null,
} as const

/** Human-readable device labels (Bootstrap docs wording). */
export const BREAKPOINT_DEVICE_LABEL: Record<BreakpointName, string> = {
  xs: 'portrait phones',
  sm: 'landscape phones',
  md: 'tablets',
  lg: 'desktops',
  xl: 'large desktops',
  xxl: 'larger desktops',
}

/**
 * Equal left + right inset for store content sections (cards, tabs, collections list, pagination, footer).
 * Always mirrored — never pad only one side. Same rhythm as header / announcement `px-4 sm:px-6`.
 */
export const STORE_SECTION_EDGE_X_CLASS = 'px-4 sm:px-6'

/** Same L/R as above, plus matching vertical padding (collections list page, etc.). */
export const STORE_SECTION_EDGE_CLASS = 'px-4 py-2.5 sm:px-6 sm:py-4'
