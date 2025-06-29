"use client"

import { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Download, X } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    // Detectar iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    setIsIOS(iOS)

    // Detectar se já está em modo standalone
    const standalone = window.matchMedia('(display-mode: standalone)').matches || 
                      ('standalone' in window.navigator && (window.navigator as Navigator & { standalone?: boolean }).standalone === true)
    setIsStandalone(standalone)

    // Listener para o evento beforeinstallprompt (Android/Chrome)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      const promptEvent = e as BeforeInstallPromptEvent
      setDeferredPrompt(promptEvent)
      setShowInstallPrompt(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    // Para iOS, mostrar instrução manual após um tempo
    if (iOS && !standalone) {
      const timer = setTimeout(() => {
        setShowInstallPrompt(true)
      }, 3000) // Mostrar após 3 segundos

      return () => {
        clearTimeout(timer)
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // Android/Chrome
      deferredPrompt.prompt()
      const choiceResult = await deferredPrompt.userChoice
      if (choiceResult.outcome === 'accepted') {
        console.log('PWA foi instalado')
      }
      setDeferredPrompt(null)
      setShowInstallPrompt(false)
    }
  }

  const handleDismiss = () => {
    setShowInstallPrompt(false)
    // Salvar no localStorage que o usuário dispensou
    localStorage.setItem('pwa-dismissed', 'true')
  }

  // Não mostrar se já está instalado ou se foi dispensado
  if (isStandalone || localStorage.getItem('pwa-dismissed')) {
    return null
  }

  if (!showInstallPrompt) {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-sm">
      <div className="bg-purple-900 border border-purple-700 rounded-lg p-4 shadow-lg">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Download className="w-5 h-5 text-purple-400" />
              <h3 className="text-sm font-semibold text-white">
                Instalar App
              </h3>
            </div>
            <p className="text-xs text-gray-300 mb-3">
              {isIOS 
                ? 'Toque no ícone de compartilhar e selecione "Adicionar à Tela de Início"'
                : 'Instale o Carrinhos no seu dispositivo para acesso rápido'
              }
            </p>
            <div className="flex gap-2">
              {!isIOS && (
                <Button
                  size="sm"
                  onClick={handleInstallClick}
                  className="bg-purple-600 hover:bg-purple-700 text-white border-0 text-xs"
                >
                  Instalar
                </Button>
              )}
              <Button
                size="sm"
                variant="outline"
                onClick={handleDismiss}
                className="bg-transparent border-purple-600 text-purple-300 hover:bg-purple-800 text-xs"
              >
                Agora não
              </Button>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-gray-400 hover:text-white ml-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
