"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, TrendingUp, TrendingDown, Minus, RefreshCw, ChevronLeft, ChevronRight, ShoppingCart } from "lucide-react"
import { PriceChart } from "@/components/price-chart"
import { PriceTable } from "@/components/price-table"
import { PriceStats } from "@/components/price-stats"
import { ShoppingCart as ShoppingCartComponent } from "@/components/shopping-cart"
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
  priceHistory: any // Will handle the complex structure dynamically
}

export function PriceDashboard() {
  const { getTotalItems } = useCart()
  const [priceData, setPriceData] = useState<PriceData[]>([])
  const [filteredData, setFilteredData] = useState<PriceData[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [sourceFilter, setSourceFilter] = useState("all")
  const [timePeriod, setTimePeriod] = useState<"daily" | "monthly" | "yearly">("daily")
  const [loading, setLoading] = useState(true)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())
  const [currentPage, setCurrentPage] = useState(1)
  const [chartsPerPage] = useState(12) // 12 charts per page for better performance

  useEffect(() => {
    fetchPriceData()
  }, [])

  useEffect(() => {
    filterData()
  }, [priceData, searchTerm, categoryFilter, sourceFilter])

  useEffect(() => {
    // Reset to first page when filters change
    setCurrentPage(1)
  }, [filteredData])

  const fetchPriceData = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/prices")
      const data = await response.json()
      setPriceData(data)
      setLastRefresh(new Date())
    } catch (error) {
      console.error("Failed to fetch price data:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterData = () => {
    let filtered = priceData

    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.category.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter((item) => item.category === categoryFilter)
    }

    if (sourceFilter !== "all") {
      filtered = filtered.filter((item) => item.source === sourceFilter)
    }

    setFilteredData(filtered)
  }

  const categories = [...new Set(priceData.map((item) => item.category))]

  // Pagination calculations
  const totalPages = Math.ceil(filteredData.length / chartsPerPage)
  const startIndex = (currentPage - 1) * chartsPerPage
  const endIndex = startIndex + chartsPerPage
  const currentPageData = filteredData.slice(startIndex, endIndex)

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

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <PriceStats data={filteredData} />

      {/* Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Price Data</CardTitle>
              <CardDescription>Real-time grocery and household item prices from government sources</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500">Last updated: {lastRefresh.toLocaleTimeString()}</span>
              <Button variant="outline" size="sm" onClick={fetchPriceData} disabled={loading}>
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger className="w-full md:w-32">
                <SelectValue placeholder="Source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                <SelectItem value="BLS">BLS</SelectItem>
                <SelectItem value="USDA">USDA</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="table" className="space-y-4">
        <TabsList>
          <TabsTrigger value="table">Price Table</TabsTrigger>
          <TabsTrigger value="charts">Price Charts</TabsTrigger>
          <TabsTrigger value="cart">
            <div className="flex items-center space-x-2">
              <ShoppingCart className="h-4 w-4" />
              <span>Shopping Cart</span>
              {getTotalItems() > 0 && (
                <Badge variant="secondary" className="ml-1 px-1.5 py-0.5 text-xs">
                  {getTotalItems()}
                </Badge>
              )}
            </div>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="table" className="space-y-4">
          <PriceTable data={filteredData} loading={loading} />
        </TabsContent>

        <TabsContent value="charts" className="space-y-4">
          {/* Time Period Selector */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Time Period</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-2">
                <Button
                  variant={timePeriod === "daily" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTimePeriod("daily")}
                  title="Show detailed daily price changes over the last 3 months (91 data points)"
                >
                  3 Months (Daily)
                </Button>
                <Button
                  variant={timePeriod === "monthly" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTimePeriod("monthly")}
                  title="Show weekly price changes over the last 2 years (105 data points)"
                >
                  2 Years (Weekly)
                </Button>
                <Button
                  variant={timePeriod === "yearly" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTimePeriod("yearly")}
                  title="Show monthly price trends over the last 10 years (121 data points)"
                >
                  10 Years (Monthly)
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Charts Header with Pagination Info */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-medium">
                    Price Charts ({filteredData.length} items)
                  </CardTitle>
                  <CardDescription>
                    Showing {startIndex + 1}-{Math.min(endIndex, filteredData.length)} of {filteredData.length} items
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <span className="text-sm text-gray-500">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Charts Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {currentPageData.map((item) => (
              <Card key={item.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{item.name}</CardTitle>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-xs">
                        {item.source}
                      </Badge>
                      <div className="flex items-center space-x-1">
                        {getTrendIcon(item.change)}
                        <span className={`text-sm font-medium ${getTrendColor(item.change)}`}>
                          {item.changePercent > 0 ? "+" : ""}
                          {item.changePercent.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                  <CardDescription>
                    ${item.currentPrice.toFixed(2)} per {item.unit}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <PriceChart 
                    data={item.priceHistory?.[timePeriod] || item.priceHistory?.all || item.priceHistory || []} 
                    timePeriod={timePeriod}
                  />
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Bottom Pagination */}
          {totalPages > 1 && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-center space-x-4">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                  >
                    First
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  
                  <div className="flex items-center space-x-2">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(pageNum)}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>

                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                  >
                    Last
                  </Button>
                </div>
                <div className="text-center mt-3">
                  <span className="text-sm text-gray-500">
                    Showing {startIndex + 1}-{Math.min(endIndex, filteredData.length)} of {filteredData.length} items
                  </span>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="cart" className="space-y-4">
          <ShoppingCartComponent />
        </TabsContent>
      </Tabs>
    </div>
  )
}
