const fs = require('fs');
const path = require('path');

const files = {
  "src/utils/supabase/client.ts": `import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
`,
  "src/utils/supabase/server.ts": `import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async getAll() {
          return (await cookieStore).getAll()
        },
        async setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              ;(await cookieStore).set(name, value, options)
            }
          } catch {
            // The \`setAll\` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}
`,
  "src/middleware.ts": `import { type NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
`,
  "src/utils/supabase/middleware.ts": `import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (
    !user &&
    !request.nextUrl.pathname.startsWith('/login') &&
    !request.nextUrl.pathname.startsWith('/auth')
  ) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (user && request.nextUrl.pathname.startsWith('/login')) {
    const url = request.nextUrl.clone()
    url.pathname = '/' // Redirect to dashboard
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
`,
  "src/features/users/services/user.service.ts": `import { createClient } from '@/utils/supabase/server';
import { CreateUser, UpdateUser } from '../schemas';

export const userService = {
  async getUsers() {
    const supabase = createClient();
    const { data, error } = await supabase.from('users').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async getUserById(id: string) {
    const supabase = createClient();
    const { data, error } = await supabase.from('users').select('*').eq('id', id).single();
    if (error) throw error;
    return data;
  },

  async createUser(userData: CreateUser) {
    const supabase = createClient();
    const { data, error } = await supabase.from('users').insert([{
      full_name: userData.fullName,
      email: userData.email,
      phone: userData.phone,
      department: userData.department,
      role: userData.role,
      status: userData.status
    }]).select().single();
    if (error) throw error;
    return data;
  },

  async updateUser(id: string, userData: UpdateUser) {
    const supabase = createClient();
    const updatePayload: any = {};
    if (userData.fullName) updatePayload.full_name = userData.fullName;
    if (userData.phone !== undefined) updatePayload.phone = userData.phone;
    if (userData.department) updatePayload.department = userData.department;
    if (userData.role) updatePayload.role = userData.role;
    if (userData.status) updatePayload.status = userData.status;
    
    const { data, error } = await supabase.from('users').update(updatePayload).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },

  async disableUser(id: string) {
    const supabase = createClient();
    const { data, error } = await supabase.from('users').update({ status: 'INACTIVE' }).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },

  async enableUser(id: string) {
    const supabase = createClient();
    const { data, error } = await supabase.from('users').update({ status: 'ACTIVE' }).eq('id', id).select().single();
    if (error) throw error;
    return data;
  }
};
`
};

for (const [filePath, content] of Object.entries(files)) {
  const fullPath = path.join('D:/CMTC/CMTC-AI-System', filePath);
  const dir = path.dirname(fullPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(fullPath, content, 'utf8');
  console.log('Created: ' + filePath);
}
