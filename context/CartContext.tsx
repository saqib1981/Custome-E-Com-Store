'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  CART_STORAGE_KEY,
  cartItemCount,
  normalizeCartLine,
  normalizeCartLines,
  type CartLine,
} from '@/lib/cart'

type AddToCartInput = Omit<CartLine, 'quantity'> & { quantity?: number }

type CartContextValue = {
  lines: CartLine[]
  itemCount: number
  drawerOpen: boolean
  openDrawer: () => void
  closeDrawer: () => void
  toggleDrawer: () => void
  addToCart: (input: AddToCartInput, options?: { openDrawer?: boolean }) => void
  setLineQuantity: (variantId: string, quantity: number) => void
  removeLine: (variantId: string) => void
  clearCart: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

function readStoredLines(): CartLine[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY)
    if (!raw) return []
    return normalizeCartLines(JSON.parse(raw))
  } catch {
    return []
  }
}

function writeStoredLines(lines: CartLine[]): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(lines))
  } catch {
    // ignore
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([])
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setLines(readStoredLines())
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    writeStoredLines(lines)
  }, [lines, hydrated])

  const openDrawer = useCallback(() => setDrawerOpen(true), [])
  const closeDrawer = useCallback(() => setDrawerOpen(false), [])
  const toggleDrawer = useCallback(() => setDrawerOpen((open) => !open), [])

  const addToCart = useCallback(
    (input: AddToCartInput, options?: { openDrawer?: boolean }) => {
      const base = normalizeCartLine({ ...input, quantity: input.quantity ?? 1 })
      if (!base) return

      setLines((prev) => {
        const existing = prev.find((line) => line.variantId === base.variantId)
        if (existing) {
          return prev.map((line) =>
            line.variantId === base.variantId
              ? { ...line, quantity: line.quantity + base.quantity }
              : line
          )
        }
        return [...prev, base]
      })

      if (options?.openDrawer !== false) {
        setDrawerOpen(true)
      }
    },
    []
  )

  const setLineQuantity = useCallback((variantId: string, quantity: number) => {
    const nextQty = Math.round(quantity)
    setLines((prev) => {
      if (nextQty <= 0) return prev.filter((line) => line.variantId !== variantId)
      return prev.map((line) =>
        line.variantId === variantId ? { ...line, quantity: nextQty } : line
      )
    })
  }, [])

  const removeLine = useCallback((variantId: string) => {
    setLines((prev) => prev.filter((line) => line.variantId !== variantId))
  }, [])

  const clearCart = useCallback(() => setLines([]), [])

  const value = useMemo<CartContextValue>(
    () => ({
      lines,
      itemCount: cartItemCount(lines),
      drawerOpen,
      openDrawer,
      closeDrawer,
      toggleDrawer,
      addToCart,
      setLineQuantity,
      removeLine,
      clearCart,
    }),
    [
      lines,
      drawerOpen,
      openDrawer,
      closeDrawer,
      toggleDrawer,
      addToCart,
      setLineQuantity,
      removeLine,
      clearCart,
    ]
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext)
  if (!ctx) {
    throw new Error('useCart must be used within CartProvider')
  }
  return ctx
}

/** Safe hook when provider may be missing (admin edges). */
export function useCartOptional(): CartContextValue | null {
  return useContext(CartContext)
}
