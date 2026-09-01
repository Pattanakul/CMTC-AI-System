'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { LayoutDashboard, FileText, BookOpen, Users, ShieldCheck, LogOut, Building, History, Settings, BarChart } from 'lucide-react';
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
    { name: 'ข้อมูลความรู้ประชาสัมพันธ์', href: '/staff/knowledge', icon: BookOpen },
    { name: 'จัดการเอกสาร', href: '/staff/documents', icon: FileText },
  ];

  const navItems = isAdmin ? adminItems : staffItems;

  return (
    <div className="flex flex-col h-full bg-sidebar text-sidebar-foreground p-4">
      <div className="text-xl font-bold mb-8">CMTC AI</div>
      <nav className="flex-1 space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={`flex items-center gap-3 px-4 py-2 rounded-md hover:bg-sidebar-accent hover:text-sidebar-accent-foreground ${pathname === item.href ? 'bg-sidebar-accent' : ''}`}
          >
            <item.icon className="size-5" />
            {item.name}
          </Link>
        ))}
      </nav>
      <button
        onClick={handleLogout}
        className="flex items-center gap-3 px-4 py-2 mt-auto rounded-md text-red-500 hover:bg-red-50 hover:text-red-600"
      >
        <LogOut className="size-5" />
        ออกจากระบบ
      </button>
    </div>
  );
}
