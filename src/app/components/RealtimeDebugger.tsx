"use client"

import { useEffect, useState } from 'react'
import { useAppStore } from '../store/useAppStoreDB'
import { Button } from '@/components/ui/button'

export default function RealtimeDebugger() {
  const { 
    subscriptions, 
    subscribeToRealtime, 
    unsubscribeFromRealtime,
    listItems 
  } = useAppStore()
  const [lastUpdate, setLastUpdate] = useState<string>('')
  const [testItemId, setTestItemId] = useState<string>('')

  useEffect(() => {
    // Encontrar um item para teste
    if (listItems.length > 0 && !testItemId) {
      setTestItemId(listItems[0].id)
    }
  }, [listItems, testItemId])

  useEffect(() => {
    // Log quando listItems mudam
    const timestamp = new Date().toLocaleTimeString()
    setLastUpdate(timestamp)
    console.log('🔄 RealtimeDebugger: listItems updated at', timestamp)
  }, [listItems])

  const testRealtimeConnection = async () => {
    console.log('🧪 Testando conexão realtime...')
    
    // Unsubscribe e subscribe novamente
    unsubscribeFromRealtime()
    setTimeout(() => {
      subscribeToRealtime()
    }, 1000)
  }

  const manualToggle = async () => {
    if (!testItemId) return
    
    console.log('🔄 Fazendo toggle manual do item:', testItemId)
    
    // Importar supabase diretamente para fazer update manual
    const { createClient } = await import('@/utils/supabase/client')
    const supabase = createClient()
    
    const currentItem = listItems.find(item => item.id === testItemId)
    if (!currentItem) {
      console.error('❌ Item não encontrado para teste')
      return
    }
    
    console.log('📋 Item atual:', {
      id: currentItem.id,
      completed: currentItem.completed,
      listId: currentItem.listId
    })
    
    const newCompletedValue = !currentItem.completed
    console.log('📤 Fazendo update direto no Supabase...')
    
    const { data, error } = await supabase
      .from('list_item')
      .update({ completed: newCompletedValue })
      .eq('id', testItemId)
      .select()
    
    if (error) {
      console.error('❌ Erro no update manual:', error)
    } else {
      console.log('✅ Update manual realizado:', data)
      console.log('⏳ Aguardando realtime...')
      
      // Verificar após alguns segundos se o realtime chegou
      setTimeout(() => {
        const updatedItem = listItems.find(item => item.id === testItemId)
        console.log('🔍 Verificação após 3s:', {
          itemFound: !!updatedItem,
          completed: updatedItem?.completed,
          expectedCompleted: newCompletedValue,
          realtimeWorking: updatedItem?.completed === newCompletedValue
        })
      }, 3000)
    }
  }

  return (
    <div className="fixed bottom-4 right-4 bg-gray-900 border border-gray-700 rounded-lg p-4 max-w-sm z-50">
      <h3 className="text-white font-bold mb-2">Realtime Debug</h3>
      
      <div className="space-y-2 text-sm">
        <div className="text-gray-300">
          Subscriptions: <span className="text-purple-400">{subscriptions.length}</span>
        </div>
        
        <div className="text-gray-300">
          ListItems: <span className="text-blue-400">{listItems.length}</span>
        </div>
        
        <div className="text-gray-300">
          Última atualização: <span className="text-green-400">{lastUpdate || 'Nunca'}</span>
        </div>
        
        {testItemId && (
          <div className="text-gray-300">
            Item teste: <span className="text-yellow-400 text-xs">{testItemId.slice(0, 8)}...</span>
          </div>
        )}
      </div>
      
      <div className="flex gap-2 mt-3">
        <Button 
          size="sm" 
          onClick={testRealtimeConnection}
          className="bg-purple-600 hover:bg-purple-700 text-xs"
        >
          Reconectar
        </Button>
        
        <Button 
          size="sm" 
          onClick={manualToggle}
          disabled={!testItemId}
          className="bg-blue-600 hover:bg-blue-700 text-xs"
        >
          Toggle Manual
        </Button>
      </div>
      
      <div className="mt-2 text-xs text-gray-400">
        Abra o console para ver logs detalhados
      </div>
    </div>
  )
}
