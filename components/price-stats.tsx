"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, DollarSign, Package } from "lucide-react"

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

interface PriceStatsProps {
  data: PriceData[]
}

export function PriceStats({ data }: PriceStatsProps) {
  const totalItems = data.length
  const avgPrice = data.length > 0 ? data.reduce((sum, item) => sum + item.currentPrice, 0) / data.length : 0
  const priceIncreases = data.filter((item) => item.change > 0).length
  const priceDecreases = data.filter((item) => item.change < 0).length
  const avgChange = data.length > 0 ? data.reduce((sum, item) => sum + item.changePercent, 0) / data.length : 0

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Items</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalItems}</div>
          <p className="text-xs text-muted-foreground">Tracked items</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Average Price</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${avgPrice.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">Across all items</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Price Increases</CardTitle>
          <TrendingUp className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">{priceIncreases}</div>
          <p className="text-xs text-muted-foreground">Items with higher prices</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Average Change</CardTitle>
          <TrendingDown className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${avgChange >= 0 ? "text-red-600" : "text-green-600"}`}>
            {avgChange >= 0 ? "+" : ""}
            {avgChange.toFixed(1)}%
          </div>
          <p className="text-xs text-muted-foreground">Overall price trend</p>
        </CardContent>
      </Card>
    </div>
  )
}
