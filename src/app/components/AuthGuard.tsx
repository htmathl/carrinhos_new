"use client"

import { useAuth } from "@/app/hooks/useAuthCustom"
import { useRouter, usePathname } from "next/navigation"
import { useEffect } from "react"
import { Loader2, ShoppingCart } from "lucide-react"

interface AuthGuardProps {
  children: React.ReactNode
  requireAuth?: boolean
}

export default function AuthGuard({ children, requireAuth = true }: AuthGuardProps) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!loading) {
      if (requireAuth && !user && !pathname.startsWith('/auth')) {
        router.push('/auth/login')
      } else if (!requireAuth && user) {
        router.push('/')
      }
    }
  }, [user, loading, router, pathname, requireAuth])

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center">
              <ShoppingCart className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold">Carrinhos</h1>
          </div>
          <div className="flex items-center justify-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
            <span className="text-gray-400">Carregando...</span>
          </div>
        </div>
      </div>
    )
  }

  // Se não está logado e precisa de auth (e não está em página de auth), não renderizar
  if (requireAuth && !user && !pathname.startsWith('/auth')) {
    return null
  }

  // Se está logado e não precisa de auth (página de login), não renderizar
  if (!requireAuth && user) {
    return null
  }

  return <>{children}</>
}
