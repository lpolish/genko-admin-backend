import { Suspense } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { createServerComponentClient } from '@/lib/supabase/server'

type Organization = {
  id: string
  slug: string
  name: string
  subscription_tier: string
  subscription_status: string
  created_at: string
}

async function getOrganizations(): Promise<Organization[]> {
  try {
    const supabase = await createServerComponentClient()
    const { data, error } = await supabase
      .from('organizations')
      .select('id, slug, name, subscription_tier, subscription_status, created_at')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching organizations:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Unexpected error:', error)
    return []
  }
}

function OrganizationsList({ organizations }: { organizations: Organization[] }) {
  if (organizations.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        No organizations found.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {organizations.map((org) => (
        <Card key={org.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">{org.name}</CardTitle>
                <CardDescription>Slug: {org.slug}</CardDescription>
              </div>
              <div className="flex gap-2">
                <Badge variant={org.subscription_status === 'active' ? 'default' : 'secondary'}>
                  {org.subscription_status}
                </Badge>
                <Badge variant="outline">{org.subscription_tier}</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Created: {new Date(org.created_at).toLocaleDateString()}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default async function OrganizationsPage() {
  const organizations = await getOrganizations()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Organizations</h1>
        <p className="text-muted-foreground">
          Manage platform organizations and their subscriptions.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Organizations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{organizations.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {organizations.filter(org => org.subscription_status === 'active').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Premium Tiers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {organizations.filter(org => org.subscription_tier === 'premium').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {organizations.filter(org => {
                const created = new Date(org.created_at)
                const now = new Date()
                return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear()
              }).length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Organizations</CardTitle>
          <CardDescription>
            Complete list of platform organizations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<Skeleton className="h-32 w-full" />}>
            <OrganizationsList organizations={organizations} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}