import { Suspense } from "react"
import { PriceDashboard } from "@/components/price-dashboard"
import { DashboardSkeleton } from "@/components/dashboard-skeleton"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">CostCheck</h1>
              <p className="text-sm text-gray-600">Real-time grocery & household prices from government data</p>
            </div>
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <span>Data from BLS & USDA</span>
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
              <span>Live</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <Suspense fallback={<DashboardSkeleton />}>
          <PriceDashboard />
        </Suspense>
      </main>
    </div>
  )
}
