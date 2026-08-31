'use client'

import AdminPanelShell from '@/components/admin/AdminPanelShell'
import ColorField from '@/components/admin/ColorField'
import {
  ImageUploadField,
  LogoWidthRow,
  SettingsCollapsibleSection,
} from '@/components/admin/LogoFaviconFields'
import { useAdminEditor } from '@/context/AdminEditorContext'
import HeaderMenuHighlightBlock from '@/components/admin/HeaderMenuHighlightBlock'
import {
  DEFAULT_HEADER_NAV_SETTINGS,
  createMenuItemHighlight,
  type HeaderMenuItemHighlight,
} from '@/lib/header-settings'

export default function HeaderSettingsPanel() {
  const {
    closeSection,
    logoFaviconDraft,
    logoFaviconUploading,
    updateLogoFaviconDraft,
    uploadLogoFaviconImage,
    headerNavDraft,
    updateHeaderNavDraft,
    saveHeaderSection,
    headerSectionDirty,
    headerSectionSaving,
    headerSectionStatus,
  } = useAdminEditor()

  const updateMenuHighlight = (id: string, patch: Partial<HeaderMenuItemHighlight>) => {
    updateHeaderNavDraft({
      menuHighlights: headerNavDraft.menuHighlights.map((block) =>
        block.id === id ? { ...block, ...patch } : block
      ),
    })
  }

  const removeMenuHighlight = (id: string) => {
    updateHeaderNavDraft({
      menuHighlights: headerNavDraft.menuHighlights.filter((block) => block.id !== id),
    })
  }

  const addMenuHighlight = () => {
    updateHeaderNavDraft({
      menuHighlights: [...headerNavDraft.menuHighlights, createMenuItemHighlight()],
    })
  }

  return (
    <AdminPanelShell
      title="Header"
      subtitle="Logo and navigation bar"
      onBack={closeSection}
      onSave={() => void saveHeaderSection()}
      saveDisabled={!headerSectionDirty}
      saving={headerSectionSaving}
      status={headerSectionStatus}
    >
      <SettingsCollapsibleSection title="Menu titles">
        <div className="space-y-4 pb-2">
          <ColorField
            id="header-nav-link-color"
            label="Title color"
            value={headerNavDraft.linkColor}
            fallback={DEFAULT_HEADER_NAV_SETTINGS.linkColor}
            onChange={(linkColor) => updateHeaderNavDraft({ linkColor })}
          />
          <ColorField
            id="header-nav-link-hover-color"
            label="Title hover color"
            value={headerNavDraft.linkHoverColor}
            fallback={DEFAULT_HEADER_NAV_SETTINGS.linkHoverColor}
            onChange={(linkHoverColor) => updateHeaderNavDraft({ linkHoverColor })}
          />
          <ColorField
            id="header-nav-link-active-color"
            label="Active title color"
            value={headerNavDraft.linkActiveColor}
            fallback={DEFAULT_HEADER_NAV_SETTINGS.linkActiveColor}
            onChange={(linkActiveColor) => updateHeaderNavDraft({ linkActiveColor })}
          />
          <ColorField
            id="header-nav-link-active-underline-color"
            label="Active underline color"
            value={headerNavDraft.linkActiveUnderlineColor}
            fallback={DEFAULT_HEADER_NAV_SETTINGS.linkActiveUnderlineColor}
            onChange={(linkActiveUnderlineColor) =>
              updateHeaderNavDraft({ linkActiveUnderlineColor })
            }
          />
          <ColorField
            id="header-nav-border-color"
            label="Menu bar border color"
            value={headerNavDraft.navBorderColor}
            fallback={DEFAULT_HEADER_NAV_SETTINGS.navBorderColor}
            onChange={(navBorderColor) => updateHeaderNavDraft({ navBorderColor })}
          />
        </div>
      </SettingsCollapsibleSection>

      <SettingsCollapsibleSection title="Menu item highlights" defaultOpen>
        <p className="mb-3 text-xs text-gray-500 dark:text-gray-400">
          Style a single menu title differently — custom color, underline, and badge (e.g. Sale).
        </p>
        <div className="space-y-3 pb-2">
          {headerNavDraft.menuHighlights.map((block, index) => (
            <HeaderMenuHighlightBlock
              key={block.id}
              block={block}
              index={index}
              onChange={(patch) => updateMenuHighlight(block.id, patch)}
              onRemove={() => removeMenuHighlight(block.id)}
            />
          ))}
          <button
            type="button"
            onClick={addMenuHighlight}
            className="w-full rounded-md border border-dashed border-gray-300 px-3 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:border-primary-400 hover:bg-primary-50 hover:text-primary-700 dark:border-gray-600 dark:text-gray-300 dark:hover:border-primary-500 dark:hover:bg-primary-950/30 dark:hover:text-primary-300"
          >
            + Add menu item block
          </button>
        </div>
      </SettingsCollapsibleSection>

      <SettingsCollapsibleSection title="Logo">
        <ImageUploadField
          id="header-logo-upload"
          label="Logo"
          imageUrl={logoFaviconDraft.logoUrl}
          fileName={logoFaviconDraft.logoFileName}
          uploading={logoFaviconUploading === 'logo'}
          onUpload={(file) => uploadLogoFaviconImage('logo', file)}
        />
        <ImageUploadField
          id="header-logo-transparent-upload"
          label="Logo on transparent header"
          imageUrl={logoFaviconDraft.logoTransparentUrl}
          fileName={logoFaviconDraft.logoTransparentFileName}
          dashed
          emptyLabel="Select"
          uploading={logoFaviconUploading === 'logo-transparent'}
          onUpload={(file) => uploadLogoFaviconImage('logo-transparent', file)}
        />
      </SettingsCollapsibleSection>

      <SettingsCollapsibleSection title="Logo width">
        <LogoWidthRow
          label="Desktop"
          value={logoFaviconDraft.logoWidthDesktop}
          onChange={(logoWidthDesktop) => updateLogoFaviconDraft({ logoWidthDesktop })}
        />
        <LogoWidthRow
          label="Mobile"
          value={logoFaviconDraft.logoWidthMobile}
          onChange={(logoWidthMobile) => updateLogoFaviconDraft({ logoWidthMobile })}
        />
      </SettingsCollapsibleSection>

      <p className="pt-2 text-xs text-gray-500 dark:text-gray-400">
        Navigation menu is managed in Shopify Admin under Online Store → Navigation.
      </p>
    </AdminPanelShell>
  )
}
