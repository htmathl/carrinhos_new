"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Loader2, ShoppingCart } from 'lucide-react'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const handleAuthCallback = async () => {
      const supabase = createClient()
      
      try {
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Erro na autenticação:', error)
          router.push('/auth/login?error=auth_callback_error')
          return
        }

        if (data.session) {
          // Usuário autenticado com sucesso
          router.push('/')
        } else {
          // Sem sessão
          router.push('/auth/login')
        }
      } catch (error) {
        console.error('Erro inesperado:', error)
        router.push('/auth/login?error=unexpected_error')
      }
    }

    handleAuthCallback()
  }, [router])

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
          <span className="text-gray-400">Finalizando autenticação...</span>
        </div>
      </div>
    </div>
  )
}
