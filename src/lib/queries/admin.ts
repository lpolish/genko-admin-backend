import { supabaseAdmin } from '@/lib/supabase/client'
import type { Organization, PlatformMetrics, RevenueAnalytics } from '@/types/database'
import type { AdminUser } from '@/lib/auth/admin'

// Organizations
export async function getOrganizations(limit = 50, offset = 0, user?: AdminUser) {
  let query = supabaseAdmin
    .from('organizations')
    .select('*', { count: 'exact' })
    .range(offset, offset + limit - 1)
    .order('created_at', { ascending: false })

  // Platform admins can see all organizations, org admins only see their own
  if (user && !user.isPlatformAdmin) {
    query = query.eq('id', user.organization_id)
  }

  const { data, error, count } = await query

  if (error) throw error
  return { organizations: data as Organization[], total: count || 0 }
}

export async function getOrganizationById(id: string, user?: AdminUser) {
  // Platform admins can access any organization, org admins only their own
  if (user && !user.isPlatformAdmin && user.organization_id !== id) {
    throw new Error('Access denied: Cannot access this organization')
  }

  const { data, error } = await supabaseAdmin
    .from('organizations')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data as Organization
}

export async function getOrganizationStats(user?: AdminUser) {
  let query = supabaseAdmin
    .from('organizations')
    .select('subscription_tier, subscription_status, created_at')

  // Platform admins can see all organizations, org admins only their own
  if (user && !user.isPlatformAdmin) {
    query = query.eq('id', user.organization_id)
  }

  const { data, error } = await query

  if (error) throw error

  const stats = {
    total: data.length,
    active: data.filter(org => org.subscription_status === 'active').length,
    inactive: data.filter(org => org.subscription_status === 'inactive').length,
    suspended: data.filter(org => org.subscription_status === 'suspended').length,
    byTier: {
      starter: data.filter(org => org.subscription_tier === 'starter').length,
      professional: data.filter(org => org.subscription_tier === 'professional').length,
      enterprise: data.filter(org => org.subscription_tier === 'enterprise').length,
    }
  }

  return stats
}

// Users
export async function getUsers(limit = 50, offset = 0, organizationId?: string, user?: AdminUser) {
  let query = supabaseAdmin
    .from('users')
    .select('*, organizations(name)', { count: 'exact' })
    .range(offset, offset + limit - 1)
    .order('created_at', { ascending: false })

  // Platform admins can see all users, org admins only see users in their organization
  if (user && !user.isPlatformAdmin) {
    query = query.eq('organization_id', user.organization_id)
  } else if (organizationId) {
    // If organizationId is specified and user is platform admin, filter by that org
    query = query.eq('organization_id', organizationId)
  }

  const { data, error, count } = await query

  if (error) throw error
  return { users: data, total: count || 0 }
}

export async function getUserById(id: string, user?: AdminUser) {
  // First get the user to check their organization
  const { data: userData, error: userError } = await supabaseAdmin
    .from('users')
    .select('organization_id')
    .eq('id', id)
    .single()

  if (userError) throw userError

  // Platform admins can access any user, org admins only users in their organization
  if (user && !user.isPlatformAdmin && user.organization_id !== userData.organization_id) {
    throw new Error('Access denied: Cannot access this user')
  }

  const { data, error } = await supabaseAdmin
    .from('users')
    .select('*, organizations(name)')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function getUserStats(user?: AdminUser) {
  let query = supabaseAdmin
    .from('users')
    .select('role, status, created_at')

  // Platform admins can see all users, org admins only their organization
  if (user && !user.isPlatformAdmin) {
    query = query.eq('organization_id', user.organization_id)
  }

  const { data: initialData, error } = await query
  let data = initialData

  if (error) {
    // If status field doesn't exist, try is_active
    if (error.message.includes('status')) {
      query = supabaseAdmin
        .from('users')
        .select('role, is_active, created_at')

      if (user && !user.isPlatformAdmin) {
        query = query.eq('organization_id', user.organization_id)
      }

      const retryResult = await query
      if (retryResult.error) throw retryResult.error
      data = retryResult.data
    } else {
      throw error
    }
  }

  if (!data) {
    throw new Error('No user data returned')
  }

  // Type for user data that can have either status or is_active field
  type UserWithStatus = {
    role: string
    status?: 'active' | 'inactive' | 'suspended'
    is_active?: boolean
    created_at: string
  }

  const stats = {
    total: data.length,
    active: data.filter((user: UserWithStatus) => user.status === 'active' || user.is_active === true).length,
    inactive: data.filter((user: UserWithStatus) => user.status === 'inactive' || user.is_active === false).length,
    suspended: data.filter((user: UserWithStatus) => user.status === 'suspended').length,
    byRole: {
      super_admin: data.filter(user => user.role === 'super_admin').length,
      org_admin: data.filter(user => user.role === 'org_admin').length,
      admin: data.filter(user => user.role === 'admin').length,
      provider: data.filter(user => user.role === 'provider').length,
      staff: data.filter(user => user.role === 'staff').length,
      patient: data.filter(user => user.role === 'patient').length,
    }
  }

  return stats
}

// Platform Analytics
export async function getPlatformMetrics(user?: AdminUser): Promise<PlatformMetrics> {
  const [orgStats, userStats, revenueData] = await Promise.all([
    getOrganizationStats(user),
    getUserStats(user),
    getRevenueMetrics()
  ])

  return {
    total_users: userStats.total,
    total_organizations: orgStats.total,
    total_revenue: revenueData.totalRevenue,
    monthly_recurring_revenue: revenueData.mrr,
    annual_recurring_revenue: revenueData.arr,
    active_users_today: userStats.active, // Simplified - would need session tracking
    new_users_this_month: userStats.total, // Simplified - would need date filtering
    churn_rate: 0, // Would need historical data
    conversion_rate: 0, // Would need conversion tracking
  }
}

export async function getRevenueMetrics() {
  // This would integrate with Stripe or invoice data
  // For now, return mock data
  return {
    totalRevenue: 125000,
    mrr: 12500,
    arr: 150000,
    growth: 15.5
  }
}

export async function getRevenueAnalytics(): Promise<RevenueAnalytics[]> {
  // Mock data - would pull from invoices table
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
  return months.map((month, index) => ({
    period: `${month} 2024`,
    revenue: 15000 + (index * 1000),
    subscriptions: 45 + index,
    refunds: 500,
    growth_percentage: 8.5 + (index * 0.5)
  }))
}