import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const PUBLIC_PATHS = new Set(['/', '/login', '/register'])

function normalizeRole(role: string | null | undefined) {
  return role?.trim().toLowerCase().replace(/[_\s-]+/g, ' ') ?? ''
}

function isAdminRole(role: string | null | undefined) {
  const normalizedRole = normalizeRole(role)
  return normalizedRole === 'super admin' || normalizedRole === 'admin'
}

function isStaffRole(role: string | null | undefined) {
  const normalizedRole = normalizeRole(role)
  return (
    normalizedRole === 'department admin' ||
    normalizedRole === 'teacher' ||
    normalizedRole === 'staff'
  )
}

function clearAuthCookies(request: NextRequest, response: NextResponse) {
  request.cookies.getAll().forEach(({ name }) => {
    if (name.startsWith('sb-') && name.includes('-auth-token')) {
      request.cookies.delete(name)
      response.cookies.delete(name)
    }
  })
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  // Public routes — skip auth check entirely
  const pathname = request.nextUrl.pathname
  if (PUBLIC_PATHS.has(pathname)) {
    return supabaseResponse
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set({ name, value, ...options })); 
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set({ name, value, ...options })
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser().catch(() => {
    clearAuthCookies(request, supabaseResponse)
    return { data: { user: null } }
  })

  // Public paths
  if (pathname === '/') {
    if (user) {
        // Already logged in, redirect to dashboard based on role
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (isAdminRole(profile?.role)) {
            return NextResponse.redirect(new URL('/admin/dashboard', request.url))
        } else if (profile?.role) {
            return NextResponse.redirect(new URL('/staff/dashboard', request.url))
        }
    }
    return supabaseResponse
  }

  // Protect routes
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    const role = profile?.role;
    const isAdmin = isAdminRole(role);
    const isStaff = isStaffRole(role);

    // Protect Admin routes
    if (pathname.startsWith('/admin')) {
      if (!isAdmin) {
        return NextResponse.redirect(new URL('/staff/dashboard', request.url))
      }
    }
    // Protect Staff routes
    else if (pathname.startsWith('/staff')) {
      if (!isStaff && !isAdmin) {
          return NextResponse.redirect(new URL('/', request.url)) // Or handle appropriately
      }
    }
  } else {
    // Not logged in and not at root
    if (pathname !== '/' && !pathname.startsWith('/_next') && pathname !== '/favicon.ico') {
      const redirectResponse = NextResponse.redirect(new URL('/', request.url))
      clearAuthCookies(request, redirectResponse)
      return redirectResponse
    }
  }

  return supabaseResponse
}
