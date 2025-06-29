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
  const supabase = createClient()

  const signIn = async (email: string, password: string) => {
    try {
      // Buscar usuário na tabela public.users
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, email, encrypted_password, raw_user_meta_data')
        .eq('email', email)
        .single()

      if (userError || !userData) {
        return { error: 'Email ou senha incorretos' }
      }

      // Verificar senha usando a função crypt do PostgreSQL
      const { data: passwordCheck, error: passwordError } = await supabase
        .rpc('verify_password', {
          input_password: password,
          stored_hash: userData.encrypted_password
        })

      if (passwordError || !passwordCheck) {
        return { error: 'Email ou senha incorretos' }
      }

      // Login bem-sucedido
      const loggedUser: User = {
        id: userData.id,
        email: userData.email,
        name: userData.raw_user_meta_data?.name || userData.email.split('@')[0]
      }

      setUser(loggedUser)
      
      // Salvar no localStorage para persistir
      localStorage.setItem('user', JSON.stringify(loggedUser))
      
      return { error: null }
    } catch (error) {
      console.error('Erro no login:', error)
      return { error: 'Erro interno do servidor' }
    }
  }

  const signOut = async () => {
    setUser(null)
    localStorage.removeItem('user')
  }

  // Verificar se há usuário salvo no localStorage
  useEffect(() => {
    const checkUser = () => {
      try {
        const savedUser = localStorage.getItem('user')
        if (savedUser) {
          setUser(JSON.parse(savedUser))
        }
      } catch (error) {
        console.error('Erro ao recuperar usuário:', error)
        localStorage.removeItem('user')
      }
      setLoading(false)
    }

    checkUser()
  }, [])

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
