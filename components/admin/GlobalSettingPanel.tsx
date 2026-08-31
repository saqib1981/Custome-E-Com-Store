'use client'

import LogoFaviconSettingsPanel from '@/components/admin/LogoFaviconSettingsPanel'

type GlobalSettingPanelProps = {
  settingId: 'logo-favicon'
}

export default function GlobalSettingPanel({ settingId }: GlobalSettingPanelProps) {
  if (settingId === 'logo-favicon') {
    return <LogoFaviconSettingsPanel />
  }

  return null
}
