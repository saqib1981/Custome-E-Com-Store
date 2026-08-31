'use client'

import AdminPanelShell from '@/components/admin/AdminPanelShell'
import {
  ImageUploadField,
  LogoWidthRow,
  SettingsCollapsibleSection,
} from '@/components/admin/LogoFaviconFields'
import { useAdminEditor } from '@/context/AdminEditorContext'

export default function LogoFaviconSettingsPanel() {
  const {
    closeGlobalSetting,
    logoFaviconDraft,
    logoFaviconDirty,
    logoFaviconSaving,
    logoFaviconStatus,
    logoFaviconUploading,
    updateLogoFaviconDraft,
    uploadLogoFaviconImage,
    saveLogoFavicon,
  } = useAdminEditor()

  return (
    <AdminPanelShell
      title="Logo and favicon"
      subtitle="Applies across your entire store"
      onBack={closeGlobalSetting}
      onSave={() => void saveLogoFavicon()}
      saveDisabled={!logoFaviconDirty}
      saving={logoFaviconSaving}
      status={logoFaviconStatus}
    >
      <SettingsCollapsibleSection title="Favicon">
        <ImageUploadField
          id="favicon-upload"
          label="Favicon image"
          imageUrl={logoFaviconDraft.faviconUrl}
          fileName={logoFaviconDraft.faviconFileName}
          helperText="32 x 32px .png recommended"
          accept="image/png,image/x-icon,image/vnd.microsoft.icon,image/webp"
          uploading={logoFaviconUploading === 'favicon'}
          onUpload={(file) => uploadLogoFaviconImage('favicon', file)}
        />
      </SettingsCollapsibleSection>

      <SettingsCollapsibleSection title="Logo">
        <ImageUploadField
          id="logo-upload"
          label="Logo"
          imageUrl={logoFaviconDraft.logoUrl}
          fileName={logoFaviconDraft.logoFileName}
          uploading={logoFaviconUploading === 'logo'}
          onUpload={(file) => uploadLogoFaviconImage('logo', file)}
        />
        <ImageUploadField
          id="logo-transparent-upload"
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
    </AdminPanelShell>
  )
}
