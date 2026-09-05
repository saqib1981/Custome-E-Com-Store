import { shopifyAdminGraphql } from '@/lib/shopify-admin'
import { isShopifyConfigured } from '@/lib/shopify-config'

type ConsentUpdateResponse = {
  customerEmailMarketingConsentUpdate?: {
    customer?: { id?: string | null } | null
    userErrors?: Array<{ field?: string[] | null; message?: string | null }> | null
  } | null
}

type SmsConsentUpdateResponse = {
  customerSmsMarketingConsentUpdate?: {
    customer?: { id?: string | null } | null
    userErrors?: Array<{ field?: string[] | null; message?: string | null }> | null
  } | null
}

/**
 * Marks a Shopify customer as subscribed to email marketing (checkout opt-in).
 * Requires write_customers. Failures are logged; they must not block order placement.
 */
export async function subscribeCustomerEmailMarketing(customerId: string): Promise<boolean> {
  if (!isShopifyConfigured() || !customerId.trim()) return false

  try {
    const data = await shopifyAdminGraphql<ConsentUpdateResponse>(
      `
      mutation SubscribeEmailMarketing($input: CustomerEmailMarketingConsentUpdateInput!) {
        customerEmailMarketingConsentUpdate(input: $input) {
          customer { id }
          userErrors { field message }
        }
      }
    `,
      {
        input: {
          customerId,
          emailMarketingConsent: {
            marketingState: 'SUBSCRIBED',
            marketingOptInLevel: 'SINGLE_OPT_IN',
            consentUpdatedAt: new Date().toISOString(),
          },
        },
      }
    )

    const errors =
      data.customerEmailMarketingConsentUpdate?.userErrors?.filter((e) => e?.message) ?? []
    if (errors.length) {
      console.error(
        'subscribeCustomerEmailMarketing userErrors:',
        errors.map((e) => e.message).join('; ')
      )
      return false
    }
    return Boolean(data.customerEmailMarketingConsentUpdate?.customer?.id)
  } catch (e) {
    console.error('subscribeCustomerEmailMarketing error:', e)
    return false
  }
}

/**
 * Optional SMS opt-in when checkout contact is phone-only but marketing box is checked.
 * Requires write_customers. Does not block checkout on failure.
 */
export async function subscribeCustomerSmsMarketing(customerId: string): Promise<boolean> {
  if (!isShopifyConfigured() || !customerId.trim()) return false

  try {
    const data = await shopifyAdminGraphql<SmsConsentUpdateResponse>(
      `
      mutation SubscribeSmsMarketing($input: CustomerSmsMarketingConsentUpdateInput!) {
        customerSmsMarketingConsentUpdate(input: $input) {
          customer { id }
          userErrors { field message }
        }
      }
    `,
      {
        input: {
          customerId,
          smsMarketingConsent: {
            marketingState: 'SUBSCRIBED',
            marketingOptInLevel: 'SINGLE_OPT_IN',
            consentUpdatedAt: new Date().toISOString(),
          },
        },
      }
    )

    const errors =
      data.customerSmsMarketingConsentUpdate?.userErrors?.filter((e) => e?.message) ?? []
    if (errors.length) {
      console.error(
        'subscribeCustomerSmsMarketing userErrors:',
        errors.map((e) => e.message).join('; ')
      )
      return false
    }
    return Boolean(data.customerSmsMarketingConsentUpdate?.customer?.id)
  } catch (e) {
    console.error('subscribeCustomerSmsMarketing error:', e)
    return false
  }
}
