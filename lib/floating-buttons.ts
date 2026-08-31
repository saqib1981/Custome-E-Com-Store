export type FloatingButtonsConfig = {
  backToTopEnabled: boolean
  whatsappEnabled: boolean
  /** Digits only with country code, e.g. 923001234567 */
  whatsappNumber: string
}

export const FLOATING_BUTTONS_SETTING_KEY = 'floating-buttons'

export const DEFAULT_FLOATING_BUTTONS: FloatingButtonsConfig = {
  backToTopEnabled: true,
  whatsappEnabled: false,
  whatsappNumber: '',
}

export function normalizeWhatsAppNumber(input: unknown): string {
  return String(input ?? '').replace(/\D/g, '').slice(0, 15)
}

export function normalizeFloatingButtonsConfig(
  input: Partial<FloatingButtonsConfig> | null | undefined
): FloatingButtonsConfig {
  return {
    backToTopEnabled: Boolean(input?.backToTopEnabled ?? DEFAULT_FLOATING_BUTTONS.backToTopEnabled),
    whatsappEnabled: Boolean(input?.whatsappEnabled ?? DEFAULT_FLOATING_BUTTONS.whatsappEnabled),
    whatsappNumber: normalizeWhatsAppNumber(input?.whatsappNumber),
  }
}

export function floatingButtonsConfigsEqual(
  a: FloatingButtonsConfig,
  b: FloatingButtonsConfig
): boolean {
  return (
    a.backToTopEnabled === b.backToTopEnabled &&
    a.whatsappEnabled === b.whatsappEnabled &&
    a.whatsappNumber === b.whatsappNumber
  )
}

export function buildWhatsAppChatUrl(number: string, pageUrl: string): string {
  const digits = normalizeWhatsAppNumber(number)
  if (!digits) return ''
  const message = `Hello, I have a question about this page: ${pageUrl}`
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`
}

export function formatWhatsAppNumberDisplay(number: string): string {
  const digits = normalizeWhatsAppNumber(number)
  if (!digits) return ''
  return `+${digits}`
}
