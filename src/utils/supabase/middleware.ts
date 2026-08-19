import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set({ name, value, ...options }));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set({ name, value, ...options }));
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const path = request.nextUrl.pathname;

  // Public/Auth routes
  if (!user && !path.startsWith('/login') && !path.startsWith('/auth') && path !== '/' && !path.startsWith('/admin/login') && !path.startsWith('/staff/login')) {
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  if (user && (path === '/admin/login' || path === '/staff/login')) {
    // Redirect based on role if already logged in
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
      
    if (profile?.role === 'SUPER_ADMIN' || profile?.role === 'ADMIN') {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }
    return NextResponse.redirect(new URL('/staff/dashboard', request.url));
  }

  // Admin Route Protection
  if (path.startsWith('/admin')) {
      if (!user) return NextResponse.redirect(new URL('/admin/login', request.url));
      
      const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
      
      if (profile?.role !== 'SUPER_ADMIN' && profile?.role !== 'ADMIN') {
          return NextResponse.redirect(new URL('/staff/dashboard', request.url));
      }
  }

  // Staff Route Protection (if needed, e.g., /staff/dashboard)
  if (path.startsWith('/staff')) {
      if (!user) return NextResponse.redirect(new URL('/staff/login', request.url));
  }

  return supabaseResponse;
}
