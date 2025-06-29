import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Rotas públicas que não precisam de autenticação
  const publicRoutes = ['/auth/login']
  const isPublicRoute = publicRoutes.includes(pathname)

  // Para sistema customizado, verificamos apenas se a rota é pública
  // A verificação de autenticação será feita no cliente
  if (!isPublicRoute) {
    // Permitir acesso, AuthGuard fará a verificação
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}
