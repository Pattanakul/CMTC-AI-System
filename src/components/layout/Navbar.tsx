import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { logoutAction } from '@/app/auth/actions'
import { Button } from '@/components/ui/button'

export default async function Navbar() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  let profile = null;
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    profile = data;
  }

  const isAdmin = profile?.role === 'Super Admin' || profile?.role === 'Admin';
  const dashboardUrl = isAdmin ? '/admin/dashboard' : '/staff/dashboard';

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/" className="font-bold flex items-center space-x-2">
            <span>🧠</span>
            <span className="hidden sm:inline-block">CMTC AI KMS</span>
          </Link>
        </div>

        <div className="flex items-center space-x-2">
          {user ? (
            <>
              <Link href={dashboardUrl}>
                <Button variant="ghost" size="sm">
                  Dashboard
                </Button>
              </Link>
              <Link href="/profile">
                <Button variant="ghost" size="sm">
                  Profile
                </Button>
              </Link>
              <form action={logoutAction}>
                <Button variant="outline" size="sm" type="submit">
                  Logout
                </Button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Login
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm">
                  Sign Up
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
