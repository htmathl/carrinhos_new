"use client"

import { useState } from 'react'
// import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { ShoppingCart, Eye, EyeOff, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
//   const [success, setSuccess] = useState(false)
  
//   const { signUp } = useAuth()

  const validatePassword = (pass: string) => {
    if (pass.length < 6) return 'A senha deve ter pelo menos 6 caracteres'
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!name || !email || !password || !confirmPassword) {
      setError('Preencha todos os campos')
      setLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError('As senhas não coincidem')
      setLoading(false)
      return
    }

    const passwordError = validatePassword(password)
    if (passwordError) {
      setError(passwordError)
      setLoading(false)
      return
    }

    // const { error } = await signUp(email, password, name)
    
    // if (error) {
    //   setError(
    //     error.message === 'User already registered' 
    //       ? 'Este email já está cadastrado' 
    //       : error.message
    //   )
    // } else {
    //   setSuccess(true)
    // }
    
    setLoading(false)
  }

//   if (success) {
//     return (
//       <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
//         <div className="w-full max-w-md text-center space-y-6">
//           <div className="flex items-center justify-center gap-3 mb-6">
//             <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center">
//               <CheckCircle className="w-7 h-7 text-white" />
//             </div>
//           </div>
          
//           <div className="space-y-4">
//             <h1 className="text-2xl font-bold text-green-400">Conta criada com sucesso!</h1>
//             <p className="text-gray-300">
//               Enviamos um email de confirmação para <strong>{email}</strong>
//             </p>
//             <p className="text-sm text-gray-400">
//               Verifique sua caixa de entrada e clique no link para ativar sua conta.
//             </p>
//           </div>

//           <Card className="bg-gray-950 border-gray-800 p-4">
//             <div className="text-sm text-gray-400 space-y-2">
//               <p>📧 Não recebeu o email? Verifique:</p>
//               <ul className="text-xs space-y-1 ml-4">
//                 <li>• Pasta de spam/lixo eletrônico</li>
//                 <li>• Se o email está correto</li>
//                 <li>• Aguarde alguns minutos</li>
//               </ul>
//             </div>
//           </Card>

//           <Link href="/auth/login">
//             <Button className="w-full bg-purple-600 hover:bg-purple-700 border-0">
//               Voltar para Login
//             </Button>
//           </Link>
//         </div>
//       </div>
//     )
//   }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center">
              <ShoppingCart className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-3xl font-bold">Carrinhos</h1>
          </div>
          <h2 className="text-xl text-gray-300">Criar nova conta</h2>
          <p className="text-sm text-gray-500 mt-2">
            Comece a organizar suas listas de compras
          </p>
        </div>

        {/* Register Form */}
        <Card className="bg-gray-950 border-gray-800 p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-900/20 border border-red-700 rounded-lg p-3 text-red-300 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome"
                className="bg-gray-900 border-gray-700 text-white"
                disabled={loading}
              />
            </div>

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

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="bg-gray-900 border-gray-700 text-white pr-10"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {password && validatePassword(password) && (
                <p className="text-xs text-red-400">{validatePassword(password)}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Senha</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Digite a senha novamente"
                  className="bg-gray-900 border-gray-700 text-white pr-10"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  disabled={loading}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {confirmPassword && password !== confirmPassword && (
                <p className="text-xs text-red-400">As senhas não coincidem</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700 border-0"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Criando conta...
                </>
              ) : (
                'Criar Conta'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <span className="text-sm text-gray-400">Já tem uma conta? </span>
            <Link
              href="/auth/login"
              className="text-sm text-purple-400 hover:text-purple-300 font-medium"
            >
              Fazer login
            </Link>
          </div>
        </Card>
      </div>
    </div>
  )
}
