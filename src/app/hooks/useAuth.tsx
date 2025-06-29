"use client"

import { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'

interface User {
  id: string
  email: string
  name?: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const signIn = async (email: string, password: string) => {
    try {
      const supabase = createClient()
      
      // Verificar credenciais na tabela public.users
      const { data, error } = await supabase.rpc('verify_user_login', {
        user_email: email,
        user_password: password
      })

      if (error) {
        console.error('Erro no login:', error)
        return { error: 'Erro interno do servidor' }
      }

      if (!data || data.length === 0) {
        return { error: 'Email ou senha incorretos' }
      }

      const userData = data[0]
      const userInfo: User = {
        id: userData.id,
        email: userData.email,
        name: userData.raw_user_meta_data?.name || 'Usuário'
      }

      // Salvar no localStorage
      localStorage.setItem('user', JSON.stringify(userInfo))
      setUser(userInfo)

      return { error: null }
    } catch (error) {
      console.error('Erro no login:', error)
      return { error: 'Erro ao fazer login' }
    }
  }

  const signOut = async () => {
    localStorage.removeItem('user')
    setUser(null)
    window.location.href = '/auth/login'
  }

  useEffect(() => {
    const checkAuthState = () => {
      try {
        const savedUser = localStorage.getItem('user')
        if (savedUser) {
          const userData = JSON.parse(savedUser)
          setUser(userData)
        }
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error)
        localStorage.removeItem('user')
      } finally {
        setLoading(false)
      }
    }

    checkAuthState()
  }, []) // Sem dependências externas, apenas roda uma vez

  const value = {
    user,
    loading,
    signIn,
    signOut,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
