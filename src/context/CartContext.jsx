import { createContext, useContext, useState, useEffect } from 'react'
import { useNotification } from './NotificationContext'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const { notify } = useNotification()
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem('cart')
    return saved ? JSON.parse(saved) : []
  })

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items))
  }, [items])

  // Sync when logout clears cart from localStorage
  useEffect(() => {
    const handleClear = () => setItems([])
    window.addEventListener('cart-cleared', handleClear)
    return () => window.removeEventListener('cart-cleared', handleClear)
  }, [])

  const addItem = (product) => {
    const cartKey = product.variantId ? `${product.id}_${product.variantId}` : `${product.id}`
    setItems(prev => {
      const existing = prev.find(item => item.cartKey === cartKey)
      if (existing) {
        return prev.map(item =>
          item.cartKey === cartKey
            ? { ...item, qty: item.qty + (product.qty || 1) }
            : item
        )
      }
      return [...prev, { ...product, cartKey, qty: product.qty || 1 }]
    })
    const name = product.title || product.nombre
    const label = product.variantLabel ? ` (${product.variantLabel})` : ''
    notify(`"${name}${label}" se añadió a tu carrito`)
  }

  const removeItem = (cartKey) => {
    setItems(prev => prev.filter(item => item.cartKey !== cartKey))
    notify('El producto fue removido de tu carrito', 'info')
  }

  const clearCart = () => {
    setItems([])
    notify('Tu carrito ha sido vaciado', 'info')
  }

  const updateQty = (cartKey, qty) => {
    if (qty <= 0) {
      removeItem(cartKey)
      return
    }
    setItems(prev => prev.map(item => item.cartKey === cartKey ? { ...item, qty } : item))
  }

  const total = items.reduce((sum, item) => sum + (item.price || item.precio || 0) * item.qty, 0)
  const totalItems = items.reduce((sum, item) => sum + item.qty, 0)
  const shipping = total >= 799 ? 0 : Math.round(total * 0.07 * 100) / 100

  return (
    <CartContext.Provider value={{ items, addItem, updateQty, removeItem, clearCart, total, totalItems, shipping }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used within CartProvider')
  return context
}
