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
      console.error('Auth error or no user:', error)
      return null
    }

    console.log('Current auth user ID:', user.id)
    console.log('Current auth user email:', user.email)

    // Get user profile with role and organization information
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select(`
        *,
        organizations (
          slug
        )
      `)
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      console.error('Profile query error:', profileError)
      console.error('Profile data:', profile)
      return null
    }

    console.log('Profile loaded:', { role: profile.role, is_active: profile.is_active, organization: profile.organizations })

    // Check admin levels
    const isSuperAdmin = profile.role === 'super_admin' || profile.role === 'admin'
    const isOrgAdmin = profile.role === 'org_admin' || isSuperAdmin
    const isPlatformAdmin = profile.organizations?.slug === 'platform-admin' || isSuperAdmin

    console.log('Admin checks:', { isSuperAdmin, isOrgAdmin, isPlatformAdmin })

    if (!isSuperAdmin && !isOrgAdmin) {
      console.error('User does not have admin privileges')
      return null
    }

    return {
      ...profile,
      isSuperAdmin,
      isOrgAdmin,
      isPlatformAdmin,
    }
  } catch (error) {
    console.error('Error getting current admin user:', error)
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
      return user.isOrgAdmin
    case 'write':
      return user.isOrgAdmin // Both super and org admins can write
    case 'read':
      return true // All admins can read
    default:
      return false
  }
}