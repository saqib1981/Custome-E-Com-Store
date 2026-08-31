export const COLLECTION_CARDS_COUNT = 4

export type CollectionCardSlot = {
  id: string
  collectionId: string
  collectionHandle: string
}

export type CollectionCardTitlePosition = 'overlay' | 'below'

export type CollectionCardsConfig = {
  enabled: boolean
  /** Where collection title appears on each card. */
  titlePosition: CollectionCardTitlePosition
  cards: CollectionCardSlot[]
}

export type ResolvedCollectionCard = {
  id: string
  title: string
  href: string
  imageUrl: string
  imageAlt: string
}

export const COLLECTION_CARDS_SETTING_KEY = 'collection-cards'

export const DEFAULT_COLLECTION_CARDS: CollectionCardsConfig = {
  enabled: true,
  titlePosition: 'overlay',
  cards: [],
}

function createCardId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `card-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function createCollectionCardSlot(
  patch: Partial<CollectionCardSlot> = {}
): CollectionCardSlot {
  return {
    id: String(patch.id ?? createCardId()),
    collectionId: String(patch.collectionId ?? '').trim(),
    collectionHandle: String(patch.collectionHandle ?? '').trim(),
  }
}

export function normalizeCollectionCardsConfig(
  input: Partial<CollectionCardsConfig> | null | undefined
): CollectionCardsConfig {
  const raw = Array.isArray(input?.cards) ? input.cards : []
  const cards: CollectionCardSlot[] = []

  for (let i = 0; i < COLLECTION_CARDS_COUNT; i += 1) {
    const slot = raw[i] as Partial<CollectionCardSlot> | undefined
    cards.push(
      createCollectionCardSlot({
        id: slot?.id,
        collectionId: slot?.collectionId,
        collectionHandle: slot?.collectionHandle,
      })
    )
  }

  return {
    enabled: Boolean(input?.enabled ?? DEFAULT_COLLECTION_CARDS.enabled),
    titlePosition: input?.titlePosition === 'below' ? 'below' : 'overlay',
    cards,
  }
}

export function collectionCardsConfigsEqual(a: CollectionCardsConfig, b: CollectionCardsConfig): boolean {
  if (
    a.enabled !== b.enabled ||
    a.titlePosition !== b.titlePosition ||
    a.cards.length !== b.cards.length
  ) {
    return false
  }
  return a.cards.every(
    (card, index) =>
      card.id === b.cards[index]?.id &&
      card.collectionId === b.cards[index]?.collectionId &&
      card.collectionHandle === b.cards[index]?.collectionHandle
  )
}
