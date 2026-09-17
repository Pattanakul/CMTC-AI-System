'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { LayoutDashboard, FileText, BookOpen, Users, LogOut, Building, History, Settings, BarChart, Sparkles } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

export function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
  };

  const adminItems = [
    { name: 'แดชบอร์ด', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'แชท AI', href: '/admin/chat', icon: Sparkles },
    { name: 'จัดการข้อมูลความรู้', href: '/admin/knowledge', icon: BookOpen },
    { name: 'จัดการเอกสาร', href: '/admin/documents', icon: FileText },
    { name: 'จัดการบุคลากร', href: '/admin/users', icon: Users },
    { name: 'จัดการแผนก', href: '/admin/departments', icon: Building },
    { name: 'สถิติการใช้งาน', href: '/admin/analytics', icon: BarChart },
    { name: 'ประวัติการใช้งาน', href: '/admin/history', icon: History },
    { name: 'ตั้งค่าระบบ', href: '/admin/settings', icon: Settings },
  ];

  const staffItems = [
    { name: 'แดชบอร์ด', href: '/staff/dashboard', icon: LayoutDashboard },
    { name: 'แชท AI', href: '/staff/chat', icon: Sparkles },
    { name: 'ข้อมูลความรู้ประชาสัมพันธ์', href: '/staff/knowledge', icon: BookOpen },
    { name: 'จัดการเอกสาร', href: '/staff/documents', icon: FileText },
  ];

  const navItems = isAdmin ? adminItems : staffItems;

  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="border-b border-sidebar-border/70 px-4 py-5">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg border border-sidebar-primary/30 bg-sidebar-primary/15 text-sidebar-primary">
            <Sparkles className="size-5" />
          </div>
          <div>
            <div className="text-base font-semibold leading-tight">CMTC AI</div>
            <div className="text-xs text-sidebar-foreground/60">Knowledge System</div>
          </div>
        </div>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground ${pathname === item.href ? 'bg-sidebar-accent text-sidebar-accent-foreground shadow-[inset_3px_0_0_var(--sidebar-primary)]' : 'text-sidebar-foreground/76'}`}
          >
            <item.icon className="size-4.5" />
            <span className="truncate">{item.name}</span>
          </Link>
        ))}
      </nav>
      <button
        onClick={handleLogout}
        className="mx-3 mb-4 mt-auto flex items-center gap-3 rounded-lg border border-sidebar-border/80 px-3 py-2.5 text-sm text-sidebar-foreground/75 transition-colors hover:border-destructive/35 hover:bg-destructive/10 hover:text-destructive"
      >
        <LogOut className="size-4.5" />
        ออกจากระบบ
      </button>
    </div>
  );
}
