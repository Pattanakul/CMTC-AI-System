

import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { logoutAction } from '@/app/auth/actions'
import { Button } from '@/components/ui/button'
import { MobileSidebar } from '@/components/layout/MobileSidebar'
import { ThemeSwitcher } from '@/components/layout/ThemeSwitcher'
import { BrainCircuit } from 'lucide-react'

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
    <nav className="sticky top-0 z-50 flex h-14 w-full items-center border-b border-border/80 bg-card/90 px-4 backdrop-blur supports-[backdrop-filter]:bg-card/75">
      {/* Mobile menu button */}
      <MobileSidebar />
      {/* Theme toggle */}
      <div className="ml-auto mr-4">
        <ThemeSwitcher />
      </div>
      <div className="flex-1 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-semibold text-foreground">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <BrainCircuit className="size-4" />
          </span>
          <span className="hidden sm:inline-block">CMTC AI</span>
        </Link>
        <div className="flex items-center space-x-2">
          {user ? (
            <>
              <Link href={dashboardUrl}>
                <Button variant="ghost" size="sm">
                  แดชบอร์ด
                </Button>
              </Link>
              <Link href="/profile">
                <Button variant="ghost" size="sm">
                  โปรไฟล์
                </Button>
              </Link>
              <form action={logoutAction}>
                <Button variant="outline" size="sm" type="submit">
                  ออกจากระบบ
                </Button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  เข้าสู่ระบบ
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm">
                  สมัครใช้งาน
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
