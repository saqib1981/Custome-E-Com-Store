import { normalizeHexColor } from '@/lib/announcement'

export type GeneralSettingsConfig = {
  /** Store page background color — hex, e.g. "#ffffff". */
  backgroundColor: string
}

export const GENERAL_SETTINGS_KEY = 'general'

export const DEFAULT_GENERAL_SETTINGS: GeneralSettingsConfig = {
  backgroundColor: '#ffffff',
}

export function normalizeGeneralSettingsConfig(
  input: Partial<GeneralSettingsConfig> | null | undefined
): GeneralSettingsConfig {
  return {
    backgroundColor: normalizeHexColor(
      input?.backgroundColor,
      DEFAULT_GENERAL_SETTINGS.backgroundColor
    ),
  }
}
