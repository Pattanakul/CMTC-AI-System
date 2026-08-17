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
  if (!user && !path.startsWith('/login') && !path.startsWith('/auth')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  if (user && path.startsWith('/login')) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // RBAC: Protect /admin routes
  if (path.startsWith('/admin')) {
    if (!user) return NextResponse.redirect(new URL('/login', request.url));
    
    // Fetch user role
    const { data: userRole, error } = await supabase
      .from('user_roles')
      .select('roles(name)')
      .eq('user_id', user.id)
      .single();

    const roleName = userRole && typeof userRole.roles === 'object' && 'name' in userRole.roles ? (userRole.roles as { name: string }).name : '';

    if (roleName !== 'Super Admin' && roleName !== 'Department Admin') {
      return NextResponse.redirect(new URL('/403', request.url));
    }
  }

  return supabaseResponse;
}
