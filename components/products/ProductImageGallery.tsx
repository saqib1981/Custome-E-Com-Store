'use client'

import { useCallback, useEffect, useRef, useState, type TouchEvent } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { ProductPageImage } from '@/lib/product-page'
import type { PreviewViewport } from '@/lib/preview-viewport'
import { isPreviewMobileLayout } from '@/lib/preview-viewport'

const SWIPE_MIN_PX = 48

type ProductImageGalleryProps = {
  images: ProductPageImage[]
  title: string
  activeIndex: number
  onActiveIndexChange: (index: number) => void
  showSaleBadge?: boolean
  preview?: boolean
  previewViewport?: PreviewViewport
}

export default function ProductImageGallery({
  images,
  title,
  activeIndex,
  onActiveIndexChange,
  showSaleBadge = false,
  preview = false,
  previewViewport,
}: ProductImageGalleryProps) {
  const [failedUrls, setFailedUrls] = useState<Record<string, true>>({})
  const [dragOffset, setDragOffset] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [frameWidth, setFrameWidth] = useState(0)
  const frameRef = useRef<HTMLDivElement>(null)
  const touchStart = useRef<{ x: number; y: number; dragging: boolean } | null>(null)
  const count = images.length
  const activeImage = images[activeIndex] ?? images[0] ?? null
  const canNavigate = count > 1
  const activeFailed = activeImage ? Boolean(failedUrls[activeImage.url]) : true

  useEffect(() => {
    const el = frameRef.current
    if (!el) return
    const measure = () => setFrameWidth(el.clientWidth)
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const goTo = useCallback(
    (index: number) => {
      if (count < 1) return
      const next = Math.max(0, Math.min(count - 1, index))
      onActiveIndexChange(next)
    },
    [count, onActiveIndexChange]
  )

  const goPrev = useCallback(() => goTo(activeIndex - 1), [activeIndex, goTo])
  const goNext = useCallback(() => goTo(activeIndex + 1), [activeIndex, goTo])

  const onTouchStart = (e: TouchEvent) => {
    if (!canNavigate) return
    const t = e.touches[0]
    if (!t) return
    touchStart.current = { x: t.clientX, y: t.clientY, dragging: false }
  }

  const onTouchMove = (e: TouchEvent) => {
    if (!canNavigate || !touchStart.current) return
    const t = e.touches[0]
    if (!t) return
    const dx = t.clientX - touchStart.current.x
    const dy = t.clientY - touchStart.current.y

    if (!touchStart.current.dragging) {
      if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return
      // Vertical scroll wins — abandon horizontal drag
      if (Math.abs(dy) > Math.abs(dx)) {
        touchStart.current = null
        setIsDragging(false)
        setDragOffset(0)
        return
      }
      touchStart.current.dragging = true
      setIsDragging(true)
    }

    // Resist pull past ends slightly
    let offset = dx
    if ((activeIndex === 0 && dx > 0) || (activeIndex === count - 1 && dx < 0)) {
      offset = dx * 0.35
    }
    setDragOffset(offset)
  }

  const settleDrag = (dx: number) => {
    touchStart.current = null
    setIsDragging(false)

    const threshold = Math.max(SWIPE_MIN_PX, frameWidth * 0.18)
    if (dx <= -threshold && activeIndex < count - 1) {
      setDragOffset(0)
      goNext()
      return
    }
    if (dx >= threshold && activeIndex > 0) {
      setDragOffset(0)
      goPrev()
      return
    }
    // Snap back smoothly
    setDragOffset(0)
  }

  const onTouchEnd = () => {
    if (!canNavigate || !touchStart.current) {
      setIsDragging(false)
      setDragOffset(0)
      return
    }
    if (!touchStart.current.dragging) {
      touchStart.current = null
      return
    }
    settleDrag(dragOffset)
  }

  const arrowClass = preview
    ? isPreviewMobileLayout(previewViewport)
      ? 'hidden'
      : 'flex'
    : 'hidden lg:flex'

  const dotsClass = preview
    ? isPreviewMobileLayout(previewViewport)
      ? 'flex'
      : 'hidden'
    : 'flex lg:hidden'

  const trackOffset =
    frameWidth > 0 ? -(activeIndex * frameWidth) + dragOffset : dragOffset

  return (
    <div className="min-w-0 max-w-full">
      <div
        ref={frameRef}
        className="relative aspect-square w-full max-w-full touch-pan-y overflow-hidden rounded-md bg-gray-100 select-none"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onTouchCancel={() => {
          touchStart.current = null
          setIsDragging(false)
          setDragOffset(0)
        }}
        role="group"
        aria-roledescription="carousel"
        aria-label={`${title} images`}
      >
        {images.length > 0 && !activeFailed ? (
          <div
            className={`flex h-full ease-out will-change-transform ${
              isDragging
                ? 'transition-none'
                : 'transition-transform duration-300'
            }`}
            style={{
              width: frameWidth > 0 ? frameWidth * count : '100%',
              transform: `translate3d(${trackOffset}px, 0, 0)`,
            }}
          >
            {images.map((image, index) => (
              <div
                key={`${image.url}-${index}`}
                className="relative h-full shrink-0"
                style={{ width: frameWidth > 0 ? frameWidth : '100%' }}
                aria-hidden={index !== activeIndex}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image.url}
                  alt={image.alt || title}
                  draggable={false}
                  className="pointer-events-none absolute inset-0 h-full w-full object-cover"
                  onError={() =>
                    setFailedUrls((prev) =>
                      prev[image.url] ? prev : { ...prev, [image.url]: true }
                    )
                  }
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center px-4 text-center text-sm text-gray-400">
            {activeImage?.alt || title || 'No image'}
          </div>
        )}

        {showSaleBadge ? (
          <span className="pointer-events-none absolute left-3 top-3 z-10 rounded bg-red-600 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-white">
            Sale
          </span>
        ) : null}

        {canNavigate ? (
          <>
            <button
              type="button"
              onClick={goPrev}
              aria-label="Previous image"
              className={`${arrowClass} absolute left-2 top-1/2 z-10 h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border-2 border-gray-900/80 bg-white text-gray-900 shadow-[0_1px_3px_rgba(0,0,0,0.35),0_0_0_1px_rgba(255,255,255,0.9)] transition hover:bg-gray-50`}
            >
              <ChevronLeft className="h-5 w-5" strokeWidth={2.25} aria-hidden />
            </button>
            <button
              type="button"
              onClick={goNext}
              aria-label="Next image"
              className={`${arrowClass} absolute right-2 top-1/2 z-10 h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border-2 border-gray-900/80 bg-white text-gray-900 shadow-[0_1px_3px_rgba(0,0,0,0.35),0_0_0_1px_rgba(255,255,255,0.9)] transition hover:bg-gray-50`}
            >
              <ChevronRight className="h-5 w-5" strokeWidth={2.25} aria-hidden />
            </button>
          </>
        ) : null}

        {canNavigate ? (
          <div
            className={`absolute bottom-3 left-1/2 z-10 ${dotsClass} -translate-x-1/2 gap-1.5`}
            aria-hidden
          >
            {images.map((_, index) => (
              <span
                key={`dot-${index}`}
                className={`h-1.5 rounded-full transition-all duration-300 ease-out ${
                  index === activeIndex
                    ? 'w-4 bg-white shadow'
                    : 'w-1.5 bg-white/50'
                }`}
              />
            ))}
          </div>
        ) : null}
      </div>

      {canNavigate ? (
        <div className="mt-3 flex max-w-full gap-2 overflow-x-auto pb-1">
          {images.map((image, index) => (
            <button
              key={`${image.url}-${index}`}
              type="button"
              onClick={() => goTo(index)}
              className={`relative h-16 w-16 shrink-0 overflow-hidden rounded border transition-[border-color,box-shadow] duration-200 ${
                index === activeIndex
                  ? 'border-gray-900 ring-1 ring-gray-900'
                  : 'border-gray-200'
              }`}
              aria-label={`View image ${index + 1}`}
              aria-current={index === activeIndex ? 'true' : undefined}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image.url}
                alt={image.alt || title}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}
