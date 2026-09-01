'use client'

import { useState } from 'react'
import AdminPanelShell from '@/components/admin/AdminPanelShell'
import ColorField from '@/components/admin/ColorField'
import { ImageUploadField, SettingsCollapsibleSection } from '@/components/admin/LogoFaviconFields'
import { useAdminEditor } from '@/context/AdminEditorContext'
import { useStoreTheme } from '@/context/StoreThemeContext'
import {
  buildCopyrightTemplate,
  extractCopyrightSuffix,
  formatFooterCopyright,
  DEFAULT_STORE_FOOTER,
  type FooterMenuLink,
  type FooterSocialLink,
} from '@/lib/store-footer'

const inputClass =
  'w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100'

export default function StoreFooterSettingsPanel() {
  const {
    closeSection,
    storeFooterDraft,
    storeFooterDirty,
    storeFooterSaving,
    storeFooterStatus,
    storeFooterLogoUploading,
    updateStoreFooterDraft,
    uploadStoreFooterLogo,
    saveStoreFooter,
  } = useAdminEditor()
  const { storeName } = useStoreTheme()

  const [newLinkLabel, setNewLinkLabel] = useState('')
  const [newLinkHref, setNewLinkHref] = useState('')
  const copyrightPreview = formatFooterCopyright(storeFooterDraft.copyrightText, storeName)
  const copyrightSuffix = extractCopyrightSuffix(storeFooterDraft.copyrightText)

  const updateSocialLink = (id: string, patch: Partial<FooterSocialLink>) => {
    updateStoreFooterDraft({
      socialLinks: storeFooterDraft.socialLinks.map((link) =>
        link.id === id ? { ...link, ...patch } : link
      ),
    })
  }

  const updateMenuLink = (id: string, patch: Partial<FooterMenuLink>) => {
    updateStoreFooterDraft({
      menuLinks: storeFooterDraft.menuLinks.map((link) =>
        link.id === id ? { ...link, ...patch } : link
      ),
    })
  }

  const removeMenuLink = (id: string) => {
    updateStoreFooterDraft({
      menuLinks: storeFooterDraft.menuLinks.filter((link) => link.id !== id),
    })
  }

  const addMenuLink = () => {
    const label = newLinkLabel.trim()
    const href = newLinkHref.trim()
    if (!label) return
    updateStoreFooterDraft({
      menuLinks: [
        ...storeFooterDraft.menuLinks,
        {
          id: `footer-link-${Date.now()}`,
          label,
          href: href || '#',
        },
      ],
    })
    setNewLinkLabel('')
    setNewLinkHref('')
  }

  return (
    <AdminPanelShell
      title="Footer"
      subtitle="Site footer — Information, Help links, Newsletter"
      onBack={closeSection}
      onSave={() => void saveStoreFooter()}
      saveDisabled={!storeFooterDirty}
      saving={storeFooterSaving}
      status={storeFooterStatus}
    >
      <SettingsCollapsibleSection title="Visibility & colors" defaultOpen>
        <label className="mb-4 flex cursor-pointer items-center justify-between gap-3 py-2">
          <span className="text-sm font-medium text-gray-800 dark:text-gray-200">Show footer</span>
          <input
            type="checkbox"
            checked={storeFooterDraft.enabled}
            onChange={(e) => updateStoreFooterDraft({ enabled: e.target.checked })}
            className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <ColorField
            id="footer-background"
            label="Background"
            value={storeFooterDraft.backgroundColor}
            fallback={DEFAULT_STORE_FOOTER.backgroundColor}
            onChange={(backgroundColor) => updateStoreFooterDraft({ backgroundColor })}
          />
          <ColorField
            id="footer-text"
            label="Text"
            value={storeFooterDraft.textColor}
            fallback={DEFAULT_STORE_FOOTER.textColor}
            onChange={(textColor) => updateStoreFooterDraft({ textColor })}
          />
          <ColorField
            id="footer-heading"
            label="Headings"
            value={storeFooterDraft.headingColor}
            fallback={DEFAULT_STORE_FOOTER.headingColor}
            onChange={(headingColor) => updateStoreFooterDraft({ headingColor })}
          />
          <ColorField
            id="footer-border"
            label="Border"
            value={storeFooterDraft.borderColor}
            fallback={DEFAULT_STORE_FOOTER.borderColor}
            onChange={(borderColor) => updateStoreFooterDraft({ borderColor })}
          />
        </div>
      </SettingsCollapsibleSection>

      <SettingsCollapsibleSection title="Information column" defaultOpen>
        <label className="mb-1 block text-sm font-medium text-gray-800 dark:text-gray-200">
          Column heading
        </label>
        <input
          type="text"
          value={storeFooterDraft.infoHeading}
          onChange={(e) => updateStoreFooterDraft({ infoHeading: e.target.value })}
          className={`${inputClass} mb-4`}
        />
        <ImageUploadField
          id="footer-logo-upload"
          label="Footer logo"
          imageUrl={storeFooterDraft.logoUrl}
          fileName={storeFooterDraft.logoFileName}
          helperText="Uploaded to Shopify Files (logo folder)"
          uploading={storeFooterLogoUploading}
          onUpload={uploadStoreFooterLogo}
        />
        <label className="mb-1 mt-2 block text-sm font-medium text-gray-800 dark:text-gray-200">
          Description
        </label>
        <textarea
          value={storeFooterDraft.description}
          onChange={(e) => updateStoreFooterDraft({ description: e.target.value })}
          rows={3}
          className={`${inputClass} mb-4`}
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs text-gray-500">City</label>
            <input
              type="text"
              value={storeFooterDraft.city}
              onChange={(e) => updateStoreFooterDraft({ city: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-gray-500">Phone</label>
            <input
              type="text"
              value={storeFooterDraft.phone}
              onChange={(e) => updateStoreFooterDraft({ phone: e.target.value })}
              className={inputClass}
            />
          </div>
        </div>
        <label className="mb-1 mt-3 block text-xs text-gray-500">Email</label>
        <input
          type="email"
          value={storeFooterDraft.email}
          onChange={(e) => updateStoreFooterDraft({ email: e.target.value })}
          className={inputClass}
        />
      </SettingsCollapsibleSection>

      <SettingsCollapsibleSection title="Social links" defaultOpen={false}>
        <ul className="space-y-3">
          {storeFooterDraft.socialLinks.map((link) => (
            <li key={link.id} className="rounded-lg border border-gray-200 p-3 dark:border-gray-700">
              <label className="mb-2 flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={link.enabled}
                  onChange={(e) => updateSocialLink(link.id, { enabled: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <span className="capitalize">{link.platform}</span>
              </label>
              <input
                type="url"
                value={link.url}
                onChange={(e) => updateSocialLink(link.id, { url: e.target.value })}
                placeholder="https://..."
                className={inputClass}
              />
            </li>
          ))}
        </ul>
      </SettingsCollapsibleSection>

      <SettingsCollapsibleSection title="Help Customer links" defaultOpen={false}>
        <label className="mb-1 block text-sm font-medium text-gray-800 dark:text-gray-200">
          Column heading
        </label>
        <input
          type="text"
          value={storeFooterDraft.helpHeading}
          onChange={(e) => updateStoreFooterDraft({ helpHeading: e.target.value })}
          className={`${inputClass} mb-4`}
        />
        <ul className="space-y-3">
          {storeFooterDraft.menuLinks.map((link) => (
            <li key={link.id} className="rounded-lg border border-gray-200 p-3 dark:border-gray-700">
              <input
                type="text"
                value={link.label}
                onChange={(e) => updateMenuLink(link.id, { label: e.target.value })}
                placeholder="Label"
                className={`${inputClass} mb-2`}
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  value={link.href}
                  onChange={(e) => updateMenuLink(link.id, { href: e.target.value })}
                  placeholder="/pages/..."
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={() => removeMenuLink(link.id)}
                  className="shrink-0 rounded-md border border-red-200 px-2 text-xs text-red-600 hover:bg-red-50"
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <input
            type="text"
            value={newLinkLabel}
            onChange={(e) => setNewLinkLabel(e.target.value)}
            placeholder="New link label"
            className={inputClass}
          />
          <input
            type="text"
            value={newLinkHref}
            onChange={(e) => setNewLinkHref(e.target.value)}
            placeholder="/pages/..."
            className={inputClass}
          />
          <button
            type="button"
            onClick={addMenuLink}
            className="shrink-0 rounded-md bg-gray-900 px-3 py-2 text-sm text-white hover:bg-gray-800"
          >
            Add link
          </button>
        </div>
      </SettingsCollapsibleSection>

      <SettingsCollapsibleSection title="Newsletter" defaultOpen={false}>
        <label className="mb-4 flex cursor-pointer items-center justify-between gap-3 py-2">
          <span className="text-sm font-medium text-gray-800 dark:text-gray-200">Show newsletter</span>
          <input
            type="checkbox"
            checked={storeFooterDraft.newsletterEnabled}
            onChange={(e) => updateStoreFooterDraft({ newsletterEnabled: e.target.checked })}
            className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
        </label>
        <label className="mb-1 block text-sm font-medium text-gray-800 dark:text-gray-200">Heading</label>
        <input
          type="text"
          value={storeFooterDraft.newsletterHeading}
          onChange={(e) => updateStoreFooterDraft({ newsletterHeading: e.target.value })}
          placeholder="Sign Up to Newsletter"
          className={`${inputClass} mb-4`}
        />
        <label className="mb-1 block text-sm font-medium text-gray-800 dark:text-gray-200">
          Email input placeholder
        </label>
        <input
          type="text"
          value={storeFooterDraft.newsletterPlaceholder}
          onChange={(e) => updateStoreFooterDraft({ newsletterPlaceholder: e.target.value })}
          placeholder="Enter your email..."
          className={`${inputClass} mb-2`}
        />
        <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
          Storefront uses a real email field (<code className="rounded bg-gray-100 px-1 dark:bg-gray-800">type="email"</code>
          ).
        </p>
        <input
          type="email"
          readOnly
          tabIndex={-1}
          aria-hidden
          placeholder={storeFooterDraft.newsletterPlaceholder || 'Enter your email...'}
          className={`${inputClass} mb-4 pointer-events-none opacity-70`}
        />
        <label className="mb-1 block text-sm font-medium text-gray-800 dark:text-gray-200">Button text</label>
        <input
          type="text"
          value={storeFooterDraft.newsletterButtonText}
          onChange={(e) => updateStoreFooterDraft({ newsletterButtonText: e.target.value })}
          placeholder="Sign Up"
          className={`${inputClass} mb-4`}
        />
        <label className="mb-1 block text-sm font-medium text-gray-800 dark:text-gray-200">Disclaimer</label>
        <textarea
          value={storeFooterDraft.newsletterDisclaimer}
          onChange={(e) => updateStoreFooterDraft({ newsletterDisclaimer: e.target.value })}
          rows={3}
          placeholder="Disclaimer text"
          className={inputClass}
        />
      </SettingsCollapsibleSection>

      <SettingsCollapsibleSection title="Copyright" defaultOpen={false}>
        <p className="mb-3 text-xs text-gray-500 dark:text-gray-400">
          Year and store name are filled in automatically from the current calendar year and your
          Shopify store name.
        </p>
        <label className="mb-1 block text-sm font-medium text-gray-800 dark:text-gray-200">
          Live preview
        </label>
        <input
          type="text"
          readOnly
          value={copyrightPreview}
          className={`${inputClass} mb-4 pointer-events-none bg-gray-50 dark:bg-gray-900/40`}
        />
        <label className="mb-1 block text-sm font-medium text-gray-800 dark:text-gray-200">
          Text after store name
        </label>
        <input
          type="text"
          value={copyrightSuffix}
          onChange={(e) =>
            updateStoreFooterDraft({ copyrightText: buildCopyrightTemplate(e.target.value) })
          }
          placeholder="- All rights reserved."
          className={inputClass}
        />
      </SettingsCollapsibleSection>
    </AdminPanelShell>
  )
}
