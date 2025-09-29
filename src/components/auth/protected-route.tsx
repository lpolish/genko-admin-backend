'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { getCurrentAdminUser } from '@/lib/auth/admin'
import type { AdminUser } from '@/lib/auth/admin'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredPermission?: 'super_admin' | 'org_admin' | 'read' | 'write'
  fallback?: React.ReactNode
}

export function ProtectedRoute({
  children,
  requiredPermission = 'read',
  fallback
}: ProtectedRouteProps) {
  const [user, setUser] = useState<AdminUser | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const adminUser = await getCurrentAdminUser()
        setUser(adminUser)

        if (!adminUser) {
          router.push('/login')
          return
        }

        // Check permissions
        const hasPermission = requiredPermission === 'read' ||
          (requiredPermission === 'org_admin' && adminUser.isOrgAdmin) ||
          (requiredPermission === 'super_admin' && adminUser.isSuperAdmin) ||
          (requiredPermission === 'write' && adminUser.isOrgAdmin)

        if (!hasPermission) {
          router.push('/dashboard')
          return
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router, requiredPermission])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!user) {
    return fallback || null
  }

  return <>{children}</>
}