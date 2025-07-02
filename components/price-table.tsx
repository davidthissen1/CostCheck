"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { TrendingUp, TrendingDown, Minus, ShoppingCart, Check } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { useCart } from "@/contexts/cart-context"

interface PriceData {
  id: string
  name: string
  category: string
  currentPrice: number
  previousPrice: number
  change: number
  changePercent: number
  unit: string
  source: "BLS" | "USDA"
  lastUpdated: string
}

interface PriceTableProps {
  data: PriceData[]
  loading: boolean
}

export function PriceTable({ data, loading }: PriceTableProps) {
  const { addToCart, isInCart, getItemQuantity } = useCart()

  const getTrendIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="h-4 w-4 text-red-500" />
    if (change < 0) return <TrendingDown className="h-4 w-4 text-green-500" />
    return <Minus className="h-4 w-4 text-gray-500" />
  }

  const getTrendColor = (change: number) => {
    if (change > 0) return "text-red-600"
    if (change < 0) return "text-green-600"
    return "text-gray-600"
  }

  const handleAddToCart = (item: PriceData) => {
    addToCart({
      id: item.id,
      name: item.name,
      currentPrice: item.currentPrice,
      unit: item.unit,
      category: item.category,
      source: item.source
    })
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading Price Data...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Current Prices ({data.length} items)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Current Price</TableHead>
                <TableHead>Change</TableHead>
                <TableHead>% Change</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead>Cart</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-xs">
                      {item.category}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">${item.currentPrice.toFixed(2)}</span>
                      <span className="text-xs text-gray-500">per {item.unit}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      {getTrendIcon(item.change)}
                      <span className={getTrendColor(item.change)}>${Math.abs(item.change).toFixed(2)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`font-medium ${getTrendColor(item.change)}`}>
                      {item.changePercent > 0 ? "+" : ""}
                      {item.changePercent.toFixed(1)}%
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={item.source === "BLS" ? "default" : "outline"} className="text-xs">
                      {item.source}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-gray-500">
                    {new Date(item.lastUpdated).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {isInCart(item.id) ? (
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAddToCart(item)}
                          className="h-8 text-xs"
                        >
                          <ShoppingCart className="h-3 w-3 mr-1" />
                          +1
                        </Button>
                        <div className="flex items-center text-xs text-green-600">
                          <Check className="h-3 w-3 mr-1" />
                          {getItemQuantity(item.id)}
                        </div>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddToCart(item)}
                        className="h-8 text-xs"
                      >
                        <ShoppingCart className="h-3 w-3 mr-1" />
                        Add
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
