import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';

function isAdminRole(role: string | null | undefined) {
  const normalizedRole = role?.trim().toLowerCase().replace(/[_\s-]+/g, ' ') ?? '';
  return normalizedRole === 'super admin' || normalizedRole === 'admin';
}

export default async function ChatPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  redirect(isAdminRole(profile?.role) ? '/admin/chat' : '/staff/chat');
}
