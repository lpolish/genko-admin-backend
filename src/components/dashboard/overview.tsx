"use client"

import { useQuery } from '@tanstack/react-query'
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts'

import { getRevenueAnalytics } from '@/lib/queries/admin'

export function Overview() {
  const { data: revenueData, isLoading } = useQuery({
    queryKey: ['revenue-analytics'],
    queryFn: getRevenueAnalytics,
  })

  if (isLoading) {
    return (
      <div className="h-[350px] flex items-center justify-center">
        <div className="text-muted-foreground">Loading chart...</div>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={revenueData}>
        <XAxis
          dataKey="period"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `$${value}`}
        />
        <Bar
          dataKey="revenue"
          fill="currentColor"
          radius={[4, 4, 0, 0]}
          className="fill-primary"
        />
      </BarChart>
    </ResponsiveContainer>
  )
}