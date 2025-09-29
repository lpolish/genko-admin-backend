import { LoginForm } from '@/components/auth/login-form'

export const dynamic = 'force-dynamic'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-8 p-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground">Genkō Admin</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Healthcare Management Platform
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}