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

  const addItem = (product) => {
    setItems(prev => {
      const existing = prev.find(item => item.id === product.id)
      if (existing) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, qty: item.qty + (product.qty || 1) }
            : item
        )
      }
      return [...prev, { ...product, qty: product.qty || 1 }]
    })
    notify(`"${product.nombre}" se añadió a tu carrito`)
  }

  const removeItem = (id) => {
    setItems(prev => prev.filter(item => item.id !== id))
    notify('El producto fue removido de tu carrito', 'info')
  }

  const clearCart = () => {
    setItems([])
    notify('Tu carrito ha sido vaciado', 'info')
  }

  const updateQty = (id, qty) => {
    if (qty <= 0) {
      removeItem(id)
      return
    }
    setItems(prev => prev.map(item => item.id === id ? { ...item, qty } : item))
  }

  const total = items.reduce((sum, item) => sum + item.precio * item.qty, 0)
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
