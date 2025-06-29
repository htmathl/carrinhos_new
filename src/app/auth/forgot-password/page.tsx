"use client"

import { useState } from 'react'
// import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { ArrowLeft, Mail, Loader2, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  
//   const { resetPassword } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!email) {
      setError('Digite seu email')
      setLoading(false)
      return
    }

    // const { error } = await resetPassword(email)
    
    if (error) {
      setError('Erro ao enviar email de recuperação. Tente novamente.')
    } else {
      setSuccess(true)
    }
    
    setLoading(false)
  }

  if (success) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center space-y-6">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-7 h-7 text-white" />
            </div>
          </div>
          
          <div className="space-y-4">
            <h1 className="text-2xl font-bold text-green-400">Email enviado!</h1>
            <p className="text-gray-300">
              Enviamos as instruções de recuperação para <strong>{email}</strong>
            </p>
            <p className="text-sm text-gray-400">
              Verifique sua caixa de entrada e clique no link para redefinir sua senha.
            </p>
          </div>

          <Card className="bg-gray-950 border-gray-800 p-4">
            <div className="text-sm text-gray-400 space-y-2">
              <p>📧 Não recebeu o email? Verifique:</p>
              <ul className="text-xs space-y-1 ml-4">
                <li>• Pasta de spam/lixo eletrônico</li>
                <li>• Se o email está correto</li>
                <li>• Aguarde alguns minutos</li>
              </ul>
            </div>
          </Card>

          <div className="space-y-3">
            <Button
              onClick={() => {setSuccess(false); setEmail('')}}
              variant="outline"
              className="w-full bg-gray-900 border-gray-700 text-white hover:bg-gray-800"
            >
              Tentar outro email
            </Button>
            
            <Link href="/auth/login">
              <Button className="w-full bg-purple-600 hover:bg-purple-700 border-0">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar para Login
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
              <Mail className="w-7 h-7 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold">Recuperar Senha</h1>
          <p className="text-sm text-gray-400 mt-2">
            Digite seu email para receber as instruções de recuperação
          </p>
        </div>

        {/* Reset Form */}
        <Card className="bg-gray-950 border-gray-800 p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-900/20 border border-red-700 rounded-lg p-3 text-red-300 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="bg-gray-900 border-gray-700 text-white"
                disabled={loading}
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 border-0"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Enviar Instruções
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/auth/login"
              className="text-sm text-gray-400 hover:text-purple-300 flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar para Login
            </Link>
          </div>
        </Card>
      </div>
    </div>
  )
}
