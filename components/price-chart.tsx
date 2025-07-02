"use client"

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

interface PriceChartProps {
  data: Array<{
    date: string
    price: number
    period?: string
  }>
  timePeriod?: "daily" | "monthly" | "yearly"
}

export function PriceChart({ data, timePeriod = "daily" }: PriceChartProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    
    switch (timePeriod) {
      case "yearly":
        return date.getFullYear().toString()
      case "monthly":
        return date.toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        })
      case "daily":
      default:
        return date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })
    }
  }

  const formatPrice = (price: number) => {
    return `$${price.toFixed(2)}`
  }

  return (
    <div className="h-[200px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis dataKey="date" tickFormatter={formatDate} fontSize={12} tickLine={false} axisLine={false} />
          <YAxis tickFormatter={formatPrice} fontSize={12} tickLine={false} axisLine={false} width={60} />
          <Tooltip
            labelFormatter={(label) => formatDate(label)}
            formatter={(value: number) => [formatPrice(value), "Price"]}
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid #e2e8f0",
              borderRadius: "6px",
              fontSize: "12px",
            }}
          />
          <Line
            type="monotone"
            dataKey="price"
            stroke="#2563eb"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: "#2563eb" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
