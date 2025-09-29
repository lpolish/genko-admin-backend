"use client"

import { useQuery } from '@tanstack/react-query'
import { Building2, Users, CreditCard, TrendingUp } from 'lucide-react'
import { useEffect, useState } from 'react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getPlatformMetrics } from '@/lib/queries/admin'
import { getCurrentAdminUser, type AdminUser } from '@/lib/auth/admin'

export function MetricsCards() {
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null)

  useEffect(() => {
    const loadUser = async () => {
      const user = await getCurrentAdminUser()
      setCurrentUser(user)
    }
    loadUser()
  }, [])

  const { data: metrics, isLoading, error } = useQuery({
    queryKey: ['platform-metrics', currentUser?.id],
    queryFn: () => getPlatformMetrics(currentUser || undefined),
    refetchInterval: 30000, // Refresh every 30 seconds
    enabled: !!currentUser, // Only run query when user is loaded
  })

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-24 bg-muted animate-pulse rounded" />
              <div className="h-4 w-4 bg-muted animate-pulse rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 bg-muted animate-pulse rounded mb-1" />
              <div className="h-3 w-20 bg-muted animate-pulse rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="col-span-full">
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground">
              Failed to load metrics. Please try again later.
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const cards = [
    {
      title: 'Total Organizations',
      value: metrics?.total_organizations.toString() || '0',
      description: '+12% from last month',
      icon: Building2,
      trend: 'up',
    },
    {
      title: 'Total Users',
      value: metrics?.total_users.toString() || '0',
      description: '+8% from last month',
      icon: Users,
      trend: 'up',
    },
    {
      title: 'Monthly Revenue',
      value: `$${(metrics?.monthly_recurring_revenue || 0).toLocaleString()}`,
      description: '+15.5% from last month',
      icon: CreditCard,
      trend: 'up',
    },
    {
      title: 'Active Users',
      value: metrics?.active_users_today.toString() || '0',
      description: 'Currently online',
      icon: TrendingUp,
      trend: 'neutral',
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {card.title}
            </CardTitle>
            <card.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            <p className="text-xs text-muted-foreground">
              {card.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}