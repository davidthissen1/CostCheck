"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useCart } from "@/contexts/cart-context"
import { ShoppingCart as ShoppingCartIcon, Trash2, Plus, Minus, ShoppingBag } from "lucide-react"

export function ShoppingCart() {
  const { 
    items, 
    removeFromCart, 
    updateQuantity, 
    clearCart, 
    getTotalItems, 
    getTotalCost 
  } = useCart()

  const [quantities, setQuantities] = useState<{ [key: string]: string }>({})

  const handleQuantityChange = (id: string, value: string) => {
    setQuantities(prev => ({ ...prev, [id]: value }))
    
    const numValue = parseInt(value)
    if (!isNaN(numValue) && numValue > 0) {
      updateQuantity(id, numValue)
    }
  }

  const incrementQuantity = (id: string, currentQuantity: number) => {
    updateQuantity(id, currentQuantity + 1)
  }

  const decrementQuantity = (id: string, currentQuantity: number) => {
    if (currentQuantity > 1) {
      updateQuantity(id, currentQuantity - 1)
    } else {
      removeFromCart(id)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (items.length === 0) {
    return (
      <Card>
        <CardHeader>
                      <div className="flex items-center space-x-2">
              <ShoppingCartIcon className="h-5 w-5" />
              <CardTitle>Shopping Cart</CardTitle>
            </div>
          <CardDescription>Add items to your cart to see your grocery total</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">Your cart is empty</p>
            <p className="text-sm text-gray-400">Start adding items from the price table to track your grocery costs</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Cart Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShoppingCartIcon className="h-5 w-5" />
              <CardTitle>Shopping Cart ({getTotalItems()} items)</CardTitle>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={clearCart}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear Cart
            </Button>
          </div>
          <CardDescription>
            Track your grocery costs before you shop
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Cart Items */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Items in Cart</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {items.map((item, index) => (
            <div key={item.id}>
              <div className="flex items-center justify-between py-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-3">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{item.name}</h4>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {item.source}
                        </Badge>
                        <span className="text-xs text-gray-500">{item.category}</span>
                        <span className="text-xs text-gray-400">
                          Added {formatDate(item.addedAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  {/* Price per unit */}
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      ${item.currentPrice.toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-500">per {item.unit}</div>
                  </div>

                  {/* Quantity controls */}
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => decrementQuantity(item.id, item.quantity)}
                      className="h-8 w-8 p-0"
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    
                    <Input
                      type="number"
                      min="1"
                      value={quantities[item.id] ?? item.quantity}
                      onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                      className="w-16 text-center h-8"
                    />
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => incrementQuantity(item.id, item.quantity)}
                      className="h-8 w-8 p-0"
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>

                  {/* Item total */}
                  <div className="text-right min-w-[80px]">
                    <div className="font-medium">
                      ${(item.currentPrice * item.quantity).toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {item.quantity} {item.unit}{item.quantity !== 1 ? 's' : ''}
                    </div>
                  </div>

                  {/* Remove button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFromCart(item.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {index < items.length - 1 && <Separator />}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Cart Summary */}
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <CardTitle className="text-lg">Cart Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>Total Items:</span>
              <span className="font-medium">{getTotalItems()}</span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span>Unique Products:</span>
              <span className="font-medium">{items.length}</span>
            </div>
            
            <Separator />
            
            <div className="flex justify-between text-lg font-bold">
              <span>Total Cost:</span>
              <span className="text-primary">${getTotalCost().toFixed(2)}</span>
            </div>
            
            <div className="text-xs text-gray-500 text-center mt-2">
              * Prices are current estimates and may vary at actual stores
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Shopping Tips */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-sm text-blue-800">💡 Shopping Tips</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-blue-700">
          <ul className="space-y-1">
            <li>• Compare prices across different stores</li>
            <li>• Check for store sales and discounts</li>
            <li>• Consider buying generic brands for savings</li>
            <li>• Prices update in real-time based on government data</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
} 