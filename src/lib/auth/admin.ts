import { supabase } from '@/lib/supabase/client'
import type { User } from '@/types/database'

export interface AdminUser extends User {
  isSuperAdmin: boolean
  isOrgAdmin: boolean
  isPlatformAdmin: boolean
}

export async function getCurrentAdminUser(): Promise<AdminUser | null> {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
      return null
    }

    // Get user profile with role and organization information
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return null
    }

    // Get organization separately to avoid foreign key issues
    let organization = null
    if (profile.organization_id) {
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .select('slug')
        .eq('id', profile.organization_id)
        .single()

      if (orgData) {
        organization = orgData
      }
    }

    // Check admin levels - Organization-scoped for SaaS security
    const isOrgAdmin = !!profile.organization_id // All users with organization are org admins in SaaS
    const isPlatformAdmin = organization?.slug === 'platform-admin' // Only platform-admin org users have global access
    const isSuperAdmin = profile.role === 'super_admin' || isPlatformAdmin // Legacy super_admin role or platform admin

    if (!isOrgAdmin) {
      return null
    }

    return {
      ...profile,
      isSuperAdmin,
      isOrgAdmin,
      isPlatformAdmin,
    }
  } catch (error) {
    return null
  }
}

export async function signInAdmin(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    throw error
  }

  // Verify admin role after sign in
  const adminUser = await getCurrentAdminUser()

  if (!adminUser) {
    // Sign out if not an admin
    await supabase.auth.signOut()
    throw new Error('Access denied. Admin privileges required.')
  }

  return { data, adminUser }
}

export async function signOutAdmin() {
  const { error } = await supabase.auth.signOut()
  if (error) {
    throw error
  }
}

export function hasPermission(user: AdminUser | null, permission: 'platform_admin' | 'super_admin' | 'org_admin' | 'read' | 'write'): boolean {
  if (!user) return false

  switch (permission) {
    case 'platform_admin':
      return user.isPlatformAdmin
    case 'super_admin':
      return user.isSuperAdmin
    case 'org_admin':
      return user.isOrgAdmin // All SaaS users are org admins
    case 'write':
      return user.isOrgAdmin // Org admins can write within their organization
    case 'read':
      return user.isOrgAdmin // All org admins can read
    default:
      return false
  }
}