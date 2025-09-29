import { redirect } from 'next/navigation'
import { createServerComponentClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const supabase = await createServerComponentClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    // Check if user has admin role
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role === 'super_admin' || profile?.role === 'org_admin') {
      redirect('/dashboard')
    }
  }

  // Redirect to login for non-admin users or unauthenticated users
  redirect('/login')
}
