import { createContext, useContext, useMemo, useReducer } from 'react'

const CartContext = createContext(null)

function cartReducer(state, action) {
  switch (action.type) {
    case 'add': {
      const existing = state.items[action.item.id] || { item: action.item, quantity: 0 }
      const nextQuantity = existing.quantity + 1
      return {
        items: { ...state.items, [action.item.id]: { item: action.item, quantity: nextQuantity } },
      }
    }
    case 'remove': {
      const existing = state.items[action.itemId]
      if (!existing) return state
      const nextQuantity = existing.quantity - 1
      const nextItems = { ...state.items }
      if (nextQuantity <= 0) delete nextItems[action.itemId]
      else nextItems[action.itemId] = { ...existing, quantity: nextQuantity }
      return { items: nextItems }
    }
    case 'clear':
      return { items: {} }
    default:
      return state
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, { items: {} })

  const addToCart = (item) => dispatch({ type: 'add', item })
  const removeFromCart = (itemId) => dispatch({ type: 'remove', itemId })
  const clearCart = () => dispatch({ type: 'clear' })

  const summary = useMemo(() => {
    const entries = Object.values(state.items)
    const itemCount = entries.reduce((acc, e) => acc + e.quantity, 0)
    const total = entries.reduce((acc, e) => acc + e.quantity * (e.item.price || 0), 0)
    return { entries, itemCount, total }
  }, [state])

  const value = useMemo(
    () => ({ items: state.items, addToCart, removeFromCart, clearCart, summary }),
    [state.items, summary]
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}

