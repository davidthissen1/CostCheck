"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'

interface CartItem {
  id: string
  name: string
  currentPrice: number
  unit: string
  category: string
  source: "BLS" | "USDA"
  quantity: number
  addedAt: string
}

interface CartContextType {
  items: CartItem[]
  addToCart: (item: Omit<CartItem, 'quantity' | 'addedAt'>, quantity?: number) => void
  removeFromCart: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  getTotalItems: () => number
  getTotalCost: () => number
  isInCart: (id: string) => boolean
  getItemQuantity: (id: string) => number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('costcheck-cart')
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart))
      } catch (error) {
        console.error('Failed to load cart from localStorage:', error)
      }
    }
    setIsLoaded(true)
  }, [])

  // Save cart to localStorage whenever items change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('costcheck-cart', JSON.stringify(items))
    }
  }, [items, isLoaded])

  const addToCart = (item: Omit<CartItem, 'quantity' | 'addedAt'>, quantity = 1) => {
    setItems(prevItems => {
      const existingItem = prevItems.find(cartItem => cartItem.id === item.id)
      
      if (existingItem) {
        // Update existing item quantity
        return prevItems.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + quantity, currentPrice: item.currentPrice }
            : cartItem
        )
      } else {
        // Add new item
        return [...prevItems, {
          ...item,
          quantity,
          addedAt: new Date().toISOString()
        }]
      }
    })
  }

  const removeFromCart = (id: string) => {
    setItems(prevItems => prevItems.filter(item => item.id !== id))
  }

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id)
      return
    }
    
    setItems(prevItems =>
      prevItems.map(item =>
        item.id === id ? { ...item, quantity } : item
      )
    )
  }

  const clearCart = () => {
    setItems([])
  }

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0)
  }

  const getTotalCost = () => {
    return items.reduce((total, item) => total + (item.currentPrice * item.quantity), 0)
  }

  const isInCart = (id: string) => {
    return items.some(item => item.id === id)
  }

  const getItemQuantity = (id: string) => {
    const item = items.find(cartItem => cartItem.id === id)
    return item ? item.quantity : 0
  }

  const value: CartContextType = {
    items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalItems,
    getTotalCost,
    isInCart,
    getItemQuantity,
  }

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
} 