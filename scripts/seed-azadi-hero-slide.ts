/**
 * Upload Azadi Sale slider images to Shopify Files and save as first hero slide.
 * Run: npx tsx scripts/seed-azadi-hero-slide.ts
 */
import { readFileSync } from 'node:fs'
import { createHeroSlide } from '../lib/hero-banner'
import { readHeroBannerConfig, writeHeroBannerConfig } from '../lib/hero-banner-server'
import { uploadBufferToShopify } from '../lib/shopify-files-server'

const DESKTOP_PATH =
  '/home/hacker/.cursor/projects/home-hacker-Documents-Cursor-AI-03-Custome-E-Com-Store/assets/Azadi_Sale_Dektop_Slider-e677778e-9687-47bb-a1eb-1cfe1460fbf5.jpg'
const MOBILE_PATH =
  '/home/hacker/.cursor/projects/home-hacker-Documents-Cursor-AI-03-Custome-E-Com-Store/assets/Mobile_Slider_Azadi_Sale-2d678281-2dac-4d9e-8e64-57a6ffbfff0e.jpg'

async function main() {
  console.log('Uploading desktop slide to Shopify Files…')
  const desktop = await uploadBufferToShopify(
    readFileSync(DESKTOP_PATH),
    'azadi-sale-desktop-slider.jpg',
    'image/jpeg',
    'hero'
  )
  console.log('Desktop URL:', desktop.url)

  console.log('Uploading mobile slide to Shopify Files…')
  const mobile = await uploadBufferToShopify(
    readFileSync(MOBILE_PATH),
    'azadi-sale-mobile-slider.jpg',
    'image/jpeg',
    'hero'
  )
  console.log('Mobile URL:', mobile.url)

  const existing = await readHeroBannerConfig()
  const azadiSlide = createHeroSlide({
    imageUrl: desktop.url,
    imageFileName: desktop.fileName,
    imageUrlMobile: mobile.url,
    imageFileNameMobile: mobile.fileName,
    linkUrl: '/collections/all',
    alt: 'Azadi Sale',
  })

  const otherSlides = existing.slides.filter(
    (slide) =>
      slide.alt !== 'Azadi Sale' &&
      !slide.imageFileName.includes('azadi-sale') &&
      !slide.imageFileNameMobile.includes('azadi-sale')
  )

  const saved = await writeHeroBannerConfig({
    ...existing,
    enabled: true,
    slides: [azadiSlide, ...otherSlides],
  })

  console.log(`Saved hero slider — ${saved.slides.length} slide(s). First: ${saved.slides[0]?.alt}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
