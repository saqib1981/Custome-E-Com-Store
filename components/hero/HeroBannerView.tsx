'use client'

import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'
import {
  HERO_BANNER_DESIGN_WIDTH,
  heroBannerAspectRatio,
  type HeroBannerConfig,
  type HeroSlide,
} from '@/lib/hero-banner'
import type { PreviewViewport } from '@/lib/preview-viewport'
import { isPreviewMobileLayout, isPreviewWideLayout } from '@/lib/preview-viewport'

const SWIPE_MIN_PX = 48

type HeroBannerViewProps = {
  config: HeroBannerConfig
  preview?: boolean
  /** Admin preview: force desktop/mobile image + aspect ratio for the viewport switcher. */
  previewViewport?: PreviewViewport
  onPreviewNavigate?: (path: string) => void
}

type ImageLayout = 'responsive' | 'desktop' | 'mobile'

function slideMobileSrc(slide: HeroSlide): string {
  return slide.imageUrlMobile.trim() || slide.imageUrl.trim()
}

function slideDesktopSrc(slide: HeroSlide): string {
  return slide.imageUrl.trim() || slide.imageUrlMobile.trim()
}

function SlidePicture({
  slide,
  layout,
}: {
  slide: HeroSlide
  layout: ImageLayout
}) {
  const desktop = slideDesktopSrc(slide)
  const mobile = slideMobileSrc(slide)

  if (!desktop && !mobile) return null

  if (layout === 'mobile') {
    const src = mobile || desktop
    return (
      /* eslint-disable-next-line @next/next/no-img-element */
      <img src={src} alt={slide.alt} className="hero-banner__slide-media" loading="eager" draggable={false} />
    )
  }

  if (layout === 'desktop') {
    const src = desktop || mobile
    return (
      /* eslint-disable-next-line @next/next/no-img-element */
      <img src={src} alt={slide.alt} className="hero-banner__slide-media" loading="eager" draggable={false} />
    )
  }

  const same = desktop === mobile
  if (same) {
    return (
      /* eslint-disable-next-line @next/next/no-img-element */
      <img src={desktop} alt={slide.alt} className="hero-banner__slide-media" loading="eager" draggable={false} />
    )
  }

  return (
    <picture className="block h-full w-full leading-none max-md:h-auto max-md:w-full">
      {desktop ? <source media="(min-width: 768px)" srcSet={desktop} /> : null}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={mobile || desktop}
        alt={slide.alt}
        className="hero-banner__slide-media"
        loading="eager"
        draggable={false}
      />
    </picture>
  )
}

function SlideLink({
  slide,
  preview,
  onPreviewNavigate,
  children,
}: {
  slide: HeroSlide
  preview: boolean
  onPreviewNavigate?: (path: string) => void
  children: React.ReactNode
}) {
  const href = slide.linkUrl.trim()
  if (!href) return <>{children}</>

  const isExternal = href.startsWith('http://') || href.startsWith('https://')

  if (preview && onPreviewNavigate && !isExternal) {
    return (
      <button
        type="button"
        onClick={() => onPreviewNavigate(href)}
        className="block h-full w-full text-left"
        aria-label={slide.alt}
      >
        {children}
      </button>
    )
  }

  if (isExternal) {
    return (
      <a href={href} className="block h-full w-full" aria-label={slide.alt} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    )
  }

  return (
    <Link href={href} className="block h-full w-full" aria-label={slide.alt}>
      {children}
    </Link>
  )
}

function resolveImageLayout(preview: boolean, previewViewport?: PreviewViewport): ImageLayout {
  if (!preview || !previewViewport) return 'responsive'
  if (isPreviewMobileLayout(previewViewport)) return 'mobile'
  return 'desktop'
}

export default function HeroBannerView({
  config,
  preview = false,
  previewViewport,
  onPreviewNavigate,
}: HeroBannerViewProps) {
  const { enabled, slides, autoplay, autoplaySeconds, heightDesktop } = config
  const [activeIndex, setActiveIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)
  const touchStart = useRef<{ x: number; y: number; dragging: boolean } | null>(null)
  const suppressClick = useRef(false)
  const activeIndexRef = useRef(activeIndex)
  activeIndexRef.current = activeIndex

  const imageLayout = resolveImageLayout(preview, previewViewport)
  const desktopAspect = heroBannerAspectRatio(
    HERO_BANNER_DESIGN_WIDTH.desktop,
    heightDesktop,
    800
  )
  const canSwipe = slides.length > 1

  const goTo = useCallback(
    (index: number) => {
      if (!slides.length) return
      setActiveIndex((index + slides.length) % slides.length)
    },
    [slides.length]
  )

  useEffect(() => {
    setActiveIndex(0)
  }, [slides])

  useEffect(() => {
    if (!enabled || !autoplay || paused || slides.length <= 1) return
    const ms = autoplaySeconds * 1000
    const id = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length)
    }, ms)
    return () => window.clearInterval(id)
  }, [enabled, autoplay, autoplaySeconds, slides.length, paused])

  // Native listeners (non-passive) so horizontal swipe can call preventDefault.
  useEffect(() => {
    const el = sectionRef.current
    if (!el || !canSwipe) return

    const onStart = (e: TouchEvent) => {
      const t = e.touches[0]
      if (!t) return
      touchStart.current = { x: t.clientX, y: t.clientY, dragging: false }
      setPaused(true)
    }

    const onMove = (e: TouchEvent) => {
      if (!touchStart.current) return
      const t = e.touches[0]
      if (!t) return
      const dx = t.clientX - touchStart.current.x
      const dy = t.clientY - touchStart.current.y

      if (!touchStart.current.dragging) {
        if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return
        // Vertical page scroll wins
        if (Math.abs(dy) > Math.abs(dx)) {
          touchStart.current = null
          setPaused(false)
          return
        }
        touchStart.current.dragging = true
      }

      e.preventDefault()
    }

    const onEnd = (e: TouchEvent) => {
      const start = touchStart.current
      touchStart.current = null
      setPaused(false)
      if (!start) return

      const t = e.changedTouches[0]
      if (!t) return
      const dx = t.clientX - start.x
      const dy = t.clientY - start.y
      if (!start.dragging && Math.abs(dx) < SWIPE_MIN_PX) return
      if (Math.abs(dx) < SWIPE_MIN_PX || Math.abs(dx) < Math.abs(dy)) return

      suppressClick.current = true
      const current = activeIndexRef.current
      if (dx < 0) goTo(current + 1)
      else goTo(current - 1)
    }

    const onCancel = () => {
      touchStart.current = null
      setPaused(false)
    }

    el.addEventListener('touchstart', onStart, { passive: true })
    el.addEventListener('touchmove', onMove, { passive: false })
    el.addEventListener('touchend', onEnd, { passive: true })
    el.addEventListener('touchcancel', onCancel, { passive: true })

    return () => {
      el.removeEventListener('touchstart', onStart)
      el.removeEventListener('touchmove', onMove)
      el.removeEventListener('touchend', onEnd)
      el.removeEventListener('touchcancel', onCancel)
    }
  }, [canSwipe, goTo])

  const onClickCapture = (e: React.MouseEvent) => {
    if (!suppressClick.current) return
    e.preventDefault()
    e.stopPropagation()
    suppressClick.current = false
  }

  if (!enabled || !slides.length) return null

  const usePreviewLayout = preview && Boolean(previewViewport)
  const isPreviewMobile = usePreviewLayout && isPreviewMobileLayout(previewViewport)
  // Tablet + desktop must force wide layout — never fall back to browser media queries.
  const isPreviewWide = usePreviewLayout && isPreviewWideLayout(previewViewport)

  const sectionStyle: React.CSSProperties = isPreviewWide
    ? { aspectRatio: desktopAspect }
    : isPreviewMobile
      ? {}
      : {
          ['--hero-aspect-desktop' as string]: desktopAspect,
        }

  const sectionClass = [
    'hero-banner relative block w-full shrink-0 overflow-hidden leading-none bg-gray-100',
    isPreviewMobile ? 'hero-banner--preview-mobile' : '',
    isPreviewWide ? 'hero-banner--preview-desktop' : '',
    canSwipe ? 'touch-pan-y select-none' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <section
      ref={sectionRef}
      className={sectionClass}
      style={sectionStyle}
      aria-label="Hero slider"
      aria-roledescription="carousel"
      onClickCapture={onClickCapture}
    >
      {slides.map((slide, index) => {
        const active = index === activeIndex
        return (
          <div
            key={slide.id}
            className={`hero-banner__slide transition-opacity duration-700 ease-in-out ${
              active ? 'hero-banner__slide--active z-[1] opacity-100' : 'z-0 opacity-0 pointer-events-none'
            }`}
            aria-hidden={!active}
          >
            <SlideLink slide={slide} preview={preview} onPreviewNavigate={onPreviewNavigate}>
              <SlidePicture slide={slide} layout={imageLayout} />
            </SlideLink>
          </div>
        )
      })}

      {slides.length > 1 ? (
        <div className="absolute bottom-3 left-0 right-0 z-[2] flex justify-center gap-2">
          {slides.map((slide, index) => (
            <button
              key={slide.id}
              type="button"
              onClick={() => goTo(index)}
              className={`h-2 w-2 rounded-full transition ${
                index === activeIndex ? 'bg-white shadow' : 'bg-white/50 hover:bg-white/80'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      ) : null}
    </section>
  )
}
