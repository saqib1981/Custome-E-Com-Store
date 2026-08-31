'use client'

import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import {
  HERO_BANNER_DESIGN_WIDTH,
  heroBannerAspectRatio,
  type HeroBannerConfig,
  type HeroSlide,
} from '@/lib/hero-banner'
import type { PreviewViewport } from '@/lib/preview-viewport'

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
      <img src={src} alt={slide.alt} className="hero-banner__slide-media" loading="eager" />
    )
  }

  if (layout === 'desktop') {
    const src = desktop || mobile
    return (
      /* eslint-disable-next-line @next/next/no-img-element */
      <img src={src} alt={slide.alt} className="hero-banner__slide-media" loading="eager" />
    )
  }

  const same = desktop === mobile
  if (same) {
    return (
      /* eslint-disable-next-line @next/next/no-img-element */
      <img src={desktop} alt={slide.alt} className="hero-banner__slide-media" loading="eager" />
    )
  }

  return (
    <picture className="block h-full w-full leading-none max-md:h-auto max-md:w-full">
      {desktop ? <source media="(min-width: 768px)" srcSet={desktop} /> : null}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={mobile || desktop} alt={slide.alt} className="hero-banner__slide-media" loading="eager" />
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
  if (previewViewport === 'mobile') return 'mobile'
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

  const imageLayout = resolveImageLayout(preview, previewViewport)
  const desktopAspect = heroBannerAspectRatio(
    HERO_BANNER_DESIGN_WIDTH.desktop,
    heightDesktop,
    800
  )

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
    if (!enabled || !autoplay || slides.length <= 1) return
    const ms = autoplaySeconds * 1000
    const id = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length)
    }, ms)
    return () => window.clearInterval(id)
  }, [enabled, autoplay, autoplaySeconds, slides.length])

  if (!enabled || !slides.length) return null

  const usePreviewLayout = preview && Boolean(previewViewport)
  const isPreviewMobile = usePreviewLayout && previewViewport === 'mobile'
  const isPreviewDesktop = usePreviewLayout && previewViewport === 'desktop'

  const sectionStyle: React.CSSProperties = isPreviewDesktop
    ? { aspectRatio: desktopAspect }
    : isPreviewMobile
      ? {}
      : {
          ['--hero-aspect-desktop' as string]: desktopAspect,
        }

  const sectionClass = [
    'hero-banner relative block w-full shrink-0 overflow-hidden leading-none bg-gray-100',
    isPreviewMobile ? 'hero-banner--preview-mobile' : '',
    isPreviewDesktop ? 'hero-banner--preview-desktop' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <section
      className={sectionClass}
      style={sectionStyle}
      aria-label="Hero slider"
      aria-roledescription="carousel"
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
