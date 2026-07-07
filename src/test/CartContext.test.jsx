import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { CartProvider, useCart } from '../context/CartContext'
import { NotificationProvider } from '../context/NotificationContext'

function wrapper({ children }) {
  return (
    <NotificationProvider>
      <CartProvider>{children}</CartProvider>
    </NotificationProvider>
  )
}

describe('CartContext', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('starts with empty cart', () => {
    const { result } = renderHook(() => useCart(), { wrapper })
    expect(result.current.items).toEqual([])
    expect(result.current.total).toBe(0)
    expect(result.current.totalItems).toBe(0)
  })

  it('adds an item', () => {
    const { result } = renderHook(() => useCart(), { wrapper })
    act(() => {
      result.current.addItem({ id: 1, title: 'Test Album', price: 299, qty: 1 })
    })
    expect(result.current.items).toHaveLength(1)
    expect(result.current.total).toBe(299)
    expect(result.current.totalItems).toBe(1)
  })

  it('increments qty for duplicate item', () => {
    const { result } = renderHook(() => useCart(), { wrapper })
    act(() => {
      result.current.addItem({ id: 1, title: 'Test', price: 100, qty: 1 })
    })
    act(() => {
      result.current.addItem({ id: 1, title: 'Test', price: 100, qty: 2 })
    })
    expect(result.current.items).toHaveLength(1)
    expect(result.current.items[0].qty).toBe(3)
    expect(result.current.total).toBe(300)
  })

  it('treats different variants as separate items', () => {
    const { result } = renderHook(() => useCart(), { wrapper })
    act(() => {
      result.current.addItem({ id: 1, variantId: 'a', title: 'Test', price: 100, qty: 1 })
    })
    act(() => {
      result.current.addItem({ id: 1, variantId: 'b', title: 'Test', price: 150, qty: 1 })
    })
    expect(result.current.items).toHaveLength(2)
    expect(result.current.total).toBe(250)
  })

  it('removes an item', () => {
    const { result } = renderHook(() => useCart(), { wrapper })
    act(() => {
      result.current.addItem({ id: 1, title: 'Test', price: 200, qty: 1 })
    })
    const cartKey = result.current.items[0].cartKey
    act(() => {
      result.current.removeItem(cartKey)
    })
    expect(result.current.items).toHaveLength(0)
  })

  it('updates quantity', () => {
    const { result } = renderHook(() => useCart(), { wrapper })
    act(() => {
      result.current.addItem({ id: 1, title: 'Test', price: 100, qty: 1 })
    })
    const cartKey = result.current.items[0].cartKey
    act(() => {
      result.current.updateQty(cartKey, 5)
    })
    expect(result.current.items[0].qty).toBe(5)
    expect(result.current.total).toBe(500)
  })

  it('clears cart', () => {
    const { result } = renderHook(() => useCart(), { wrapper })
    act(() => {
      result.current.addItem({ id: 1, title: 'A', price: 100, qty: 1 })
      result.current.addItem({ id: 2, title: 'B', price: 200, qty: 1 })
    })
    act(() => {
      result.current.clearCart()
    })
    expect(result.current.items).toHaveLength(0)
    expect(result.current.total).toBe(0)
  })

  it('calculates free shipping over 799', () => {
    const { result } = renderHook(() => useCart(), { wrapper })
    act(() => {
      result.current.addItem({ id: 1, title: 'Test', price: 800, qty: 1 })
    })
    expect(result.current.shipping).toBe(0)
  })

  it('charges shipping under 799', () => {
    const { result } = renderHook(() => useCart(), { wrapper })
    act(() => {
      result.current.addItem({ id: 1, title: 'Test', price: 500, qty: 1 })
    })
    expect(result.current.shipping).toBeGreaterThan(0)
  })
})
