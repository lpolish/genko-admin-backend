import { Suspense } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { createServerComponentClient } from '@/lib/supabase/server'

type User = {
  id: string
  email: string
  role: string
  status?: string
  is_active?: boolean
  created_at: string
  organizations?: {
    name: string
  } | null
}

async function getUsers(): Promise<User[]> {
  try {
    const supabase = await createServerComponentClient()
    const { data, error } = await supabase
      .from('users')
      .select('id, email, role, status, is_active, created_at, organizations(name)')
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      console.error('Error fetching users:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Unexpected error:', error)
    return []
  }
}

function UsersList({ users }: { users: User[] }) {
  if (users.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        No users found.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {users.map((user) => (
        <Card key={user.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">{user.email}</CardTitle>
                <CardDescription>
                  Organization: {user.organizations?.name || 'None'}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Badge variant={
                  user.role === 'super_admin' ? 'destructive' :
                  user.role === 'admin' ? 'default' :
                  user.role === 'org_admin' ? 'secondary' : 'outline'
                }>
                  {user.role}
                </Badge>
                <Badge variant={
                  (user.status === 'active' || user.is_active) ? 'default' : 'secondary'
                }>
                  {(user.status === 'active' || user.is_active) ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Joined: {new Date(user.created_at).toLocaleDateString()}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default async function UsersPage() {
  const users = await getUsers()

  const activeUsers = users.filter(u => u.status === 'active' || u.is_active)
  const adminUsers = users.filter(u => ['super_admin', 'admin', 'org_admin'].includes(u.role))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Users</h1>
        <p className="text-muted-foreground">
          Manage platform users and their access levels.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeUsers.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admin Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{adminUsers.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(u => {
                const created = new Date(u.created_at)
                const now = new Date()
                return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear()
              }).length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>
            Complete list of platform users
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<Skeleton className="h-32 w-full" />}>
            <UsersList users={users} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}