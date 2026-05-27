import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/middleware'

export async function middleware(request: NextRequest) {
  const { supabase, supabaseResponse } = createClient(request)
  const { data: { user } } = await supabase.auth.getUser()
  const path = request.nextUrl.pathname

  if ((path.startsWith('/admin') || path.startsWith('/score')) && !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  if (path === '/login' && user) {
    return NextResponse.redirect(new URL('/score', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/admin/:path*', '/score/:path*', '/login'],
}
