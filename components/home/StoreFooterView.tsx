'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronDown } from 'lucide-react'
import {
  formatFooterCopyright,
  type FooterSocialLink,
  type FooterSocialPlatform,
  type StoreFooterConfig,
} from '@/lib/store-footer'
import { STORE_SECTION_EDGE_X_CLASS } from '@/lib/breakpoints'
import type { PreviewViewport } from '@/lib/preview-viewport'

type StoreFooterViewProps = {
  config: StoreFooterConfig
  storeName?: string
  preview?: boolean
  previewViewport?: PreviewViewport
  onPreviewNavigate?: (path: string) => void
}

function isPreviewMobile(preview: boolean, previewViewport?: PreviewViewport): boolean {
  return Boolean(preview && previewViewport === 'mobile')
}

function resolveFooterContainerClass(preview: boolean, previewViewport?: PreviewViewport): string {
  if (preview && previewViewport) {
    return previewViewport === 'mobile'
      ? `flex w-full max-w-none flex-col gap-0 py-8 ${STORE_SECTION_EDGE_X_CLASS}`
      : `grid w-full max-w-none grid-cols-3 gap-8 py-10 ${STORE_SECTION_EDGE_X_CLASS}`
  }

  return `flex w-full max-w-none flex-col gap-0 py-8 md:grid md:grid-cols-3 md:gap-8 md:py-10 ${STORE_SECTION_EDGE_X_CLASS}`
}

function resolveSectionClass(
  preview: boolean,
  previewViewport?: PreviewViewport,
  isLast = false
): string {
  if (isPreviewMobile(preview, previewViewport)) {
    return `w-full min-w-0 border-b py-8 text-center ${isLast ? 'border-b-0' : ''}`
  }

  return `min-w-0 w-full border-b py-8 text-center max-md:py-8 md:border-b-0 md:py-0 md:pb-0 md:text-left ${
    isLast ? 'max-md:border-b-0' : ''
  }`
}

function resolveNewsletterFormClass(preview: boolean, previewViewport?: PreviewViewport): string {
  if (isPreviewMobile(preview, previewViewport)) {
    return 'flex flex-col gap-2'
  }

  return 'flex flex-col gap-2 md:flex-row md:items-stretch'
}

function resolveCopyrightClass(preview: boolean, previewViewport?: PreviewViewport): string {
  if (isPreviewMobile(preview, previewViewport)) {
    return `w-full max-w-none py-4 text-center text-sm ${STORE_SECTION_EDGE_X_CLASS}`
  }

  return `w-full max-w-none py-4 text-center text-sm md:text-left ${STORE_SECTION_EDGE_X_CLASS}`
}

function resolveMobileToggleClass(preview: boolean, previewViewport?: PreviewViewport): string {
  if (preview && previewViewport) {
    return previewViewport === 'mobile'
      ? 'flex w-full items-center justify-between gap-3 text-left'
      : 'hidden'
  }

  return 'flex w-full items-center justify-between gap-3 text-left md:hidden'
}

function resolveDesktopHeadingClass(preview: boolean, previewViewport?: PreviewViewport): string {
  if (preview && previewViewport) {
    return previewViewport === 'mobile' ? 'hidden' : 'mb-4 block text-base font-semibold md:text-left'
  }

  return 'mb-4 hidden text-base font-semibold md:block md:text-left'
}

function resolveCollapsibleContentClass(
  open: boolean,
  preview: boolean,
  previewViewport?: PreviewViewport
): string {
  if (preview && previewViewport && previewViewport !== 'mobile') {
    return 'block'
  }

  if (preview && previewViewport === 'mobile') {
    return open ? 'block' : 'hidden'
  }

  return open ? 'block' : 'hidden md:block'
}

function FooterCollapsibleSection({
  title,
  headingColor,
  defaultOpen,
  collapsible,
  preview,
  previewViewport,
  isLast,
  borderColor,
  children,
}: {
  title: string
  headingColor: string
  defaultOpen: boolean
  collapsible: boolean
  preview: boolean
  previewViewport?: PreviewViewport
  isLast?: boolean
  borderColor: string
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)
  const sectionClass = resolveSectionClass(preview, previewViewport, isLast)
  const collapsibleMobile = collapsible && (isPreviewMobile(preview, previewViewport) || !preview)

  if (!collapsible) {
    return (
      <div className={sectionClass} style={{ borderColor }}>
        {title ? (
          <h3 className="mb-4 text-base font-semibold md:text-left" style={{ color: headingColor }}>
            {title}
          </h3>
        ) : null}
        {children}
      </div>
    )
  }

  return (
    <div className={`${sectionClass} ${collapsibleMobile && !open ? 'py-4' : ''}`} style={{ borderColor }}>
      {title ? (
        <>
          <button
            type="button"
            className={resolveMobileToggleClass(preview, previewViewport)}
            aria-expanded={open}
            onClick={() => setOpen((prev) => !prev)}
          >
            <span className="text-base font-semibold" style={{ color: headingColor }}>
              {title}
            </span>
            <ChevronDown
              className={`h-5 w-5 shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
              aria-hidden
            />
          </button>
          <h3 className={resolveDesktopHeadingClass(preview, previewViewport)} style={{ color: headingColor }}>
            {title}
          </h3>
        </>
      ) : null}
      <div className={`${resolveCollapsibleContentClass(open, preview, previewViewport)} ${open ? 'mt-4 md:mt-0' : ''}`}>
        {children}
      </div>
    </div>
  )
}

function FooterLink({
  href,
  preview,
  onPreviewNavigate,
  children,
  className,
}: {
  href: string
  preview?: boolean
  onPreviewNavigate?: (path: string) => void
  children: React.ReactNode
  className?: string
}) {
  if (preview && onPreviewNavigate) {
    return (
      <button type="button" onClick={() => onPreviewNavigate(href)} className={className}>
        {children}
      </button>
    )
  }

  if (href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:')) {
    return (
      <a href={href} className={className}>
        {children}
      </a>
    )
  }

  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  )
}

function SocialIcon({ platform }: { platform: FooterSocialPlatform }) {
  switch (platform) {
    case 'facebook':
      return (
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden>
          <circle cx="20" cy="20" r="19.5" stroke="currentColor" />
          <path
            fill="currentColor"
            d="M18.333 16.667V18H17v2h1.333v6H21v-6h1.773L23 18h-2v-1.167c0-.54.053-.826.887-.826H23V14h-1.787c-2.133 0-2.88 1-2.88 2.667Z"
          />
        </svg>
      )
    case 'instagram':
      return (
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden>
          <circle cx="20" cy="20" r="19.5" stroke="currentColor" />
          <path
            fill="currentColor"
            d="M23.6 14h-7.2a2.4 2.4 0 0 0-2.4 2.4v7.2a2.4 2.4 0 0 0 2.4 2.4h7.2a2.4 2.4 0 0 0 2.4-2.4v-7.2a2.4 2.4 0 0 0-2.4-2.4Zm-1.2 1.8h1.8v1.8h-1.8v-1.8ZM20 17.6a2.4 2.4 0 1 1 0 4.8 2.4 2.4 0 0 1 0-4.8Zm4.8 6a1.2 1.2 0 0 1-1.2 1.2h-7.2a1.2 1.2 0 0 1-1.2-1.2v-4.2h1.26a3.6 3.6 0 1 0 7.08 0h1.26v4.2Z"
          />
        </svg>
      )
    case 'tiktok':
      return (
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden>
          <circle cx="20" cy="20" r="19.5" stroke="currentColor" />
          <path
            fill="currentColor"
            d="M17.989 26a4.075 4.075 0 0 1-2.82-1.122A3.753 3.753 0 0 1 14 22.171c0-1.016.42-1.99 1.168-2.708a4.075 4.075 0 0 1 2.82-1.121h.974v1.869h-.973c-.405 0-.8.115-1.137.33a1.983 1.983 0 0 0-.753.882 1.891 1.891 0 0 0-.117 1.134c.08.381.274.731.56 1.006.286.274.65.461 1.048.537.396.076.808.037 1.181-.112.374-.148.694-.4.918-.723.225-.323.345-.702.345-1.09V14h1.947v.934c0 .52.215 1.02.599 1.388a2.09 2.09 0 0 0 1.446.576H25v1.865h-.98a4.07 4.07 0 0 1-2.046-.546v3.954a3.756 3.756 0 0 1-1.168 2.705A4.078 4.078 0 0 1 17.989 26Z"
          />
        </svg>
      )
    case 'youtube':
      return (
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden>
          <circle cx="20" cy="20" r="19.5" stroke="currentColor" />
          <path
            fill="currentColor"
            d="M26.988 16.565a1.79 1.79 0 0 0-1.259-1.26C24.612 15 20.141 15 20.141 15s-4.47 0-5.588.294c-.6.165-1.094.659-1.259 1.27C13 17.683 13 20 13 20s0 2.33.294 3.435a1.79 1.79 0 0 0 1.259 1.26c1.13.305 5.588.305 5.588.305s4.47 0 5.588-.294a1.79 1.79 0 0 0 1.26-1.259c.293-1.118.293-3.435.293-3.435s.012-2.33-.294-3.447Zm-8.27 5.576V17.86L22.435 20l-3.717 2.141Z"
          />
        </svg>
      )
    case 'whatsapp':
      return (
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden>
          <circle cx="20" cy="20" r="19.5" stroke="currentColor" />
          <path
            fill="currentColor"
            fillRule="evenodd"
            clipRule="evenodd"
            d="M24.252 15.744A3.975 3.975 0 0 0 20.025 14c-3.293 0-5.974 2.667-5.975 5.946 0 1.048.275 2.07.798 2.972L14 26l3.167-.827a6.02 6.02 0 0 0 2.858.724h.001c3.293 0 5.974-2.667 5.975-5.945a3.975 3.975 0 0 0-1.749-3.208ZM20.025 24.893h-.002a5.02 5.02 0 0 1-2.59-.724l-.182-.108-1.88.49.502-1.824-.104-.19a5.02 5.02 0 0 1-.724-2.59c0-2.725 2.228-4.942 4.967-4.942 1.326 0 2.573.517 3.511 1.451.938.935 1.454 2.176 1.454 3.497-.001 2.725-2.229 4.94-4.953 4.94Zm2.724-3.702c-.149-.075-.884-.434-1.02-.484-.136-.05-.235-.075-.335.075-.1.15-.386.484-.473.584-.087.1-.174.112-.324.037-.15-.075-.634-.222-1.208-.716-.446-.394-.748-.88-.835-1.03-.087-.15-.009-.23.057-.315.062-.085.136-.222.204-.334.068-.112.091-.168.136-.28.045-.112.023-.21-.011-.295-.034-.085-.317-.752-.434-1.05-.114-.298-.23-.254-.318-.25-.087.004-.187.006-.286.006-.1 0-.262.037-.399.186-.136.15-.52.509-.52 1.24 0 .732.535 1.438.61 1.537.074.1 1.052 1.602 2.55 2.245.357.113.635.183.852.252.357.113.683.097.94.058.287-.043.884-.419 1.009-.766.125-.347.125-.65.088-.711-.037-.062-.136-.1-.286-.174Z"
          />
        </svg>
      )
    default:
      return null
  }
}

function socialLabel(link: FooterSocialLink): string {
  return link.platform.charAt(0).toUpperCase() + link.platform.slice(1)
}

export default function StoreFooterView({
  config,
  storeName = '',
  preview = false,
  previewViewport,
  onPreviewNavigate,
}: StoreFooterViewProps) {
  if (!config.enabled) return null

  const visibleSocial = config.socialLinks.filter((link) => link.enabled && link.url.trim())
  const visibleMenuLinks = config.menuLinks.filter((link) => link.label.trim())
  const showHelpColumn = visibleMenuLinks.length > 0
  const showNewsletterColumn = config.newsletterEnabled
  const lastSectionKey = showNewsletterColumn ? 'newsletter' : showHelpColumn ? 'help' : 'info'

  return (
    <footer
      className="mt-auto w-full max-w-none border-t"
      style={{ backgroundColor: config.backgroundColor, borderColor: config.borderColor, color: config.textColor }}
      aria-label="Site footer"
    >
      <div className={resolveFooterContainerClass(preview, previewViewport)}>
        <FooterCollapsibleSection
          title={config.infoHeading}
          headingColor={config.headingColor}
          defaultOpen
          collapsible={false}
          preview={preview}
          previewViewport={previewViewport}
          isLast={lastSectionKey === 'info'}
          borderColor={config.borderColor}
        >
          {config.logoUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={config.logoUrl}
              alt=""
              className="mx-auto mb-4 h-[50px] w-auto max-w-[120px] object-contain md:mx-0 md:object-left"
              loading="lazy"
            />
          ) : null}
          {config.description ? (
            <p className="mb-4 text-sm leading-relaxed md:text-left">{config.description}</p>
          ) : null}
          <div className="space-y-1 text-sm md:text-left">
            {config.city ? <p>{config.city}</p> : null}
            {config.phone ? (
              <p>
                <a href={`tel:${config.phone.replace(/\s/g, '')}`} className="hover:underline">
                  {config.phone}
                </a>
              </p>
            ) : null}
            {config.email ? (
              <p>
                <a href={`mailto:${config.email}`} className="hover:underline">
                  {config.email}
                </a>
              </p>
            ) : null}
          </div>
          {visibleSocial.length ? (
            <ul className="mt-5 flex flex-wrap justify-center gap-2.5 md:justify-start">
              {visibleSocial.map((link) => (
                <li key={link.id}>
                  <a
                    href={link.url}
                    target={preview ? undefined : '_blank'}
                    rel={preview ? undefined : 'noopener noreferrer'}
                    aria-label={socialLabel(link)}
                    className="inline-flex text-current transition hover:opacity-80"
                    onClick={preview ? (e) => e.preventDefault() : undefined}
                  >
                    <SocialIcon platform={link.platform} />
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </FooterCollapsibleSection>

        {showHelpColumn ? (
          <FooterCollapsibleSection
            title={config.helpHeading}
            headingColor={config.headingColor}
            defaultOpen={false}
            collapsible
            preview={preview}
            previewViewport={previewViewport}
            isLast={lastSectionKey === 'help'}
            borderColor={config.borderColor}
          >
            <ul className="space-y-2 text-sm md:text-left">
              {visibleMenuLinks.map((link) => (
                <li key={link.id}>
                  <FooterLink
                    href={link.href}
                    preview={preview}
                    onPreviewNavigate={onPreviewNavigate}
                    className="transition hover:underline"
                  >
                    {link.label}
                  </FooterLink>
                </li>
              ))}
            </ul>
          </FooterCollapsibleSection>
        ) : null}

        {showNewsletterColumn ? (
          <FooterCollapsibleSection
            title={config.newsletterHeading}
            headingColor={config.headingColor}
            defaultOpen={false}
            collapsible
            preview={preview}
            previewViewport={previewViewport}
            isLast={lastSectionKey === 'newsletter'}
            borderColor={config.borderColor}
          >
            <form
              className="mx-auto max-w-md space-y-3 md:mx-0 md:max-w-none"
              onSubmit={(e) => {
                e.preventDefault()
              }}
            >
              <div className={resolveNewsletterFormClass(preview, previewViewport)}>
                <input
                  id="store-footer-newsletter-email"
                  name="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  enterKeyHint="send"
                  required
                  aria-label={config.newsletterPlaceholder || 'Email address'}
                  placeholder={config.newsletterPlaceholder || 'Enter your email...'}
                  className="min-w-0 flex-1 border-b border-gray-300 bg-transparent px-0 py-2 text-sm outline-none focus:border-gray-900"
                  style={{ color: config.textColor }}
                />
                <button
                  type="submit"
                  className="shrink-0 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
                >
                  {config.newsletterButtonText || 'Sign Up'}
                </button>
              </div>
              {config.newsletterDisclaimer ? (
                <p className="text-xs leading-relaxed opacity-80 md:text-left">{config.newsletterDisclaimer}</p>
              ) : null}
            </form>
          </FooterCollapsibleSection>
        ) : null}
      </div>

      {config.copyrightText ? (
        <>
          <hr className="border-t" style={{ borderColor: config.borderColor }} aria-hidden />
          <div className={resolveCopyrightClass(preview, previewViewport)}>
            {formatFooterCopyright(config.copyrightText, storeName)}
          </div>
        </>
      ) : null}
    </footer>
  )
}
