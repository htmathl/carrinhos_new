"use client"

import { useState, useEffect } from "react"
import { Plus, ShoppingCart, List, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import ListCard from "./components/ListCard"
import ItemManager from "./components/ItemManager"
import CommandBar from "./components/CommandBar"
import AnimatedDialog from "./components/AnimatedDialog"
import { AnimatedList } from "./components/AnimatedCard"
import { useAppStore } from "./store/useAppStoreDB"
import { Item, ShoppingList } from "./types"

// import { createClient } from '@/utils/supabase/client'

export default function Home() {
  // const supabase = createClient()

  const {
    lists,
    items,
    loading,
    error,
    addList,
    updateItem,
    updateList,
    deleteItem,
    deleteList,
    loadItems,
    loadLists,
    loadListItems,
    subscribeToRealtime,
    unsubscribeFromRealtime
  } = useAppStore()
  const [showNewList, setShowNewList] = useState(false)
  const [showItems, setShowItems] = useState(false)
  const [newListName, setNewListName] = useState("")
  const [newListDescription, setNewListDescription] = useState("")

  // Estados para edição via comando
  const [showEditItem, setShowEditItem] = useState(false)
  const [editingItem, setEditingItem] = useState<Item | null>(null)
  const [editItemName, setEditItemName] = useState("")
  const [editItemCategory, setEditItemCategory] = useState("")
  const [editItemUnit, setEditItemUnit] = useState<"unidade" | "kg" | "litro">("unidade")

  const [showEditList, setShowEditList] = useState(false)
  const [editingList, setEditingList] = useState<ShoppingList | null>(null)
  const [editListName, setEditListName] = useState("")
  const [editListDescription, setEditListDescription] = useState("")

  // Adicionar estados para confirmação de exclusão via comando:
  // Estados para exclusão via comando
  const [showDeleteItemConfirm, setShowDeleteItemConfirm] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<Item | null>(null)

  const [showDeleteListConfirm, setShowDeleteListConfirm] = useState(false)
  const [listToDelete, setListToDelete] = useState<ShoppingList | null>(null)

  // // Estados para teste de conexão
  // const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle')
  // const [connectionMessage, setConnectionMessage] = useState('')

  const handleCreateList = async () => {
    if (newListName.trim()) {
      await addList(newListName.trim(), newListDescription.trim())
      setNewListName("")
      setNewListDescription("")
      setShowNewList(false)
    }
  }

  const handleEditItem = (item: Item) => {
    setEditingItem(item)
    setEditItemName(item.name)
    setEditItemCategory(item.category)
    setEditItemUnit(item.unit)
    setShowEditItem(true)
  }

  const handleUpdateItem = async () => {
    if (editingItem && editItemName.trim() && editItemCategory.trim()) {
      await updateItem(editingItem.id, {
        name: editItemName.trim(),
        category: editItemCategory.trim(),
        unit: editItemUnit,
      })
      setShowEditItem(false)
      setEditingItem(null)
    }
  }

  const handleEditList = (list: ShoppingList) => {
    setEditingList(list)
    setEditListName(list.name)
    setEditListDescription(list.description)
    setShowEditList(true)
  }

  const handleUpdateList = async () => {
    if (editingList && editListName.trim()) {
      await updateList(editingList.id, {
        name: editListName.trim(),
        description: editListDescription.trim(),
      })
      setShowEditList(false)
      setEditingList(null)
    }
  }

  // Adicionar funções para lidar com exclusões:
  const handleDeleteItem = (item: Item) => {
    setItemToDelete(item)
    setShowDeleteItemConfirm(true)
  }

  const handleConfirmDeleteItem = async () => {
    if (itemToDelete) {
      await deleteItem(itemToDelete.id)
      setShowDeleteItemConfirm(false)
      setItemToDelete(null)
    }
  }

  const handleDeleteList = (list: ShoppingList) => {
    setListToDelete(list)
    setShowDeleteListConfirm(true)
  }

  const handleConfirmDeleteList = async () => {
    if (listToDelete) {
      await deleteList(listToDelete.id)
      setShowDeleteListConfirm(false)
      setListToDelete(null)
    }
  }

  const getLinkedListsCount = (itemId: string) => {
    const listItems = useAppStore.getState().listItems.filter((listItem) => listItem.itemId === itemId)
    const linkedListIds = [...new Set(listItems.map((li) => li.listId))]
    const linkedLists = lists.filter((list) => linkedListIds.includes(list.id))
    return { count: linkedLists.length, lists: linkedLists }
  }

  // // Função para testar consulta na tabela item
  // const testItemQuery = async () => {
  //   try {
  //     console.log('Testando consulta na tabela item...')

  //     // Consulta simples: buscar todos os itens
  //     const { data, error } = await supabase
  //       .from('item')
  //       .select('*')

  //     if (error) {
  //       console.error('Erro na consulta:', error)
  //       alert(`Erro: ${error.message}`)
  //     } else {
  //       console.log('Dados encontrados:', data)
  //       alert(`Sucesso! Encontrados ${data?.length || 0} itens na tabela.`)
  //     }
  //   } catch (err) {
  //     console.error('Erro inesperado:', err)
  //     alert('Erro inesperado na consulta')
  //   }
  // }

  // Carregar dados iniciais e ativar realtime
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        await Promise.all([
          loadItems(),
          loadLists(),
          loadListItems()
        ])
        
        // Ativar subscriptions de realtime após carregar os dados
        subscribeToRealtime()
      } catch (err) {
        console.error('Erro ao carregar dados iniciais:', err)
      }
    }

    loadInitialData()

    // Cleanup: desativar realtime quando o componente for desmontado
    return () => {
      unsubscribeFromRealtime()
    }
  }, [loadItems, loadLists, loadListItems, subscribeToRealtime, unsubscribeFromRealtime])

  // No useEffect que escuta comandos, adicionar os casos de delete:
  // Escutar comandos de edição e exclusão
  useEffect(() => {
    const handleCommandAction = (event: Event) => {
      const customEvent = event as CustomEvent
      const { action } = customEvent.detail
      if (action?.type === "edit-item") {
        handleEditItem(action.data)
      } else if (action?.type === "edit-list") {
        handleEditList(action.data)
      } else if (action?.type === "delete-item") {
        handleDeleteItem(action.data)
      } else if (action?.type === "delete-list") {
        handleDeleteList(action.data)
      }
    }

    window.addEventListener("command-action", handleCommandAction)
    return () => window.removeEventListener("command-action", handleCommandAction)
  }, [])

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-black/95 backdrop-blur-sm border-b border-gray-800">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold">Smart Cart</h1>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowItems(true)}
            className="bg-gray-900 hover:bg-gray-800 text-white border-0"
          >
            <List className="w-4 h-4 mr-2" />
            Itens ({items.length})
          </Button>
        </div>
      </div>

      {/* Command Bar */}
      <CommandBar />

      {/* Loading Indicator */}
      {loading && (
        <div className="bg-blue-900/20 border border-blue-800 mx-4 p-3 rounded-lg flex items-center gap-2 text-blue-300">
          <div className="w-4 h-4 animate-spin rounded-full border-2 border-blue-400 border-t-transparent" />
          <span className="text-sm">Carregando dados...</span>
        </div>
      )}

      {/* Error Indicator */}
      {error && (
        <div className="bg-red-900/20 border border-red-800 mx-4 p-3 rounded-lg flex items-center gap-2 text-red-300">
          <span className="text-sm">❌ {error}</span>
        </div>
      )}

      {/* Main Content */}
      <div className="p-4 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-950 rounded-xl p-4 border border-gray-800">
            <div className="text-2xl font-bold text-purple-400">{lists.length}</div>
            <div className="text-sm text-gray-400">Listas</div>
          </div>
          <div className="bg-gray-950 rounded-xl p-4 border border-gray-800">
            <div className="text-2xl font-bold text-emerald-400">{items.length}</div>
            <div className="text-sm text-gray-400">Itens</div>
          </div>
        </div>

        {/* Realtime Status
        <div className="bg-gray-950 rounded-xl p-4 border border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-green-400">🟢 Realtime Ativo</h3>
              <p className="text-xs text-gray-400">Mudanças no banco são sincronizadas automaticamente</p>
            </div>
            <Button
              size="sm"
              onClick={() => {
                unsubscribeFromRealtime()
                setTimeout(() => subscribeToRealtime(), 1000)
              }}
              className="bg-green-600 hover:bg-green-700 text-white border-0"
            >
              Reconectar
            </Button>
          </div>
        </div> */}

        {/* Seção de Teste de Consulta
        <div className="bg-gray-950 rounded-xl p-4 border border-gray-800 mb-6">
          <h3 className="text-lg font-semibold mb-3">Teste de Consulta</h3>
          <Button 
            onClick={testItemQuery}
            className="bg-blue-600 hover:bg-blue-700 text-white border-0"
          >
            Consultar Tabela 'item'
          </Button>
        </div> */}

        {/* Lists Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Suas Listas</h2>
            <Button
              size="sm"
              onClick={() => setShowNewList(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white border-0"
            >
              <Plus className="w-4 h-4 mr-1" />
              Nova Lista
            </Button>
          </div>

          {lists.length === 0 ? (
            <div className="bg-gray-950 border border-gray-800 border-dashed rounded-xl p-8 text-center">
              <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingCart className="w-8 h-8 text-gray-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-300 mb-2">Nenhuma lista ainda</h3>
              <p className="text-gray-500 mb-4">Crie sua primeira lista ou use comandos</p>
              <div className="text-sm text-gray-600 bg-gray-900 rounded-lg p-3 mb-4">
                💡 Experimente: <span className="text-purple-400 font-mono">&quot;add lista mercado&quot;</span>
              </div>
              <Button onClick={() => setShowNewList(true)} className="bg-purple-600 hover:bg-purple-700 border-0">
                <Plus className="w-4 h-4 mr-2" />
                Criar Lista
              </Button>
            </div>
          ) : (
            <AnimatedList
              className="space-y-3"
              itemClassName="w-full"
            >
              {lists.map((list) => (
                <ListCard key={list.id} list={list} />
              ))}
            </AnimatedList>
          )}
        </div>
      </div>

      {/* Dialogs */}
      <AnimatedDialog
        open={showNewList}
        onOpenChange={setShowNewList}
        title="Criar Nova Lista"
      >
        <div className="space-y-4">
          <div>
            <Label htmlFor="listName">Nome da Lista</Label>
            <Input
              id="listName"
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              placeholder="Ex: Compras do Mês"
              className="bg-gray-900 border-gray-700 text-white mt-1"
            />
          </div>
          <div>
            <Label htmlFor="listDescription">Descrição (opcional)</Label>
            <Textarea
              id="listDescription"
              value={newListDescription}
              onChange={(e) => setNewListDescription(e.target.value)}
              placeholder="Descrição da lista..."
              className="bg-gray-900 border-gray-700 text-white mt-1"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button onClick={handleCreateList} className="flex-1 bg-purple-600 hover:bg-purple-700 border-0">
              Criar Lista
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowNewList(false)}
              className="bg-gray-900 border-gray-700 text-white hover:bg-gray-800"
            >
              Cancelar
            </Button>
          </div>
        </div>
      </AnimatedDialog>

      <AnimatedDialog
        open={showItems}
        onOpenChange={setShowItems}
        title="Gerenciar Itens"
        maxWidth="max-w-md max-h-[80vh]"
      >
        <ItemManager />
      </AnimatedDialog>

      {/* Dialog de edição de item via comando */}
      <AnimatedDialog
        open={showEditItem}
        onOpenChange={setShowEditItem}
        title="Editar Item"
      >
        <div className="space-y-4">
          <div>
            <Label htmlFor="editItemName">Nome do Item</Label>
            <Input
              id="editItemName"
              value={editItemName}
              onChange={(e) => setEditItemName(e.target.value)}
              className="bg-gray-900 border-gray-700 text-white mt-1"
            />
          </div>
          <div>
            <Label htmlFor="editItemCategory">Categoria</Label>
            <Input
              id="editItemCategory"
              value={editItemCategory}
              onChange={(e) => setEditItemCategory(e.target.value)}
              className="bg-gray-900 border-gray-700 text-white mt-1"
            />
          </div>
          <div>
            <Label htmlFor="editItemUnit">Unidade</Label>
            <Select
              value={editItemUnit}
              onValueChange={(value: "unidade" | "kg" | "litro") => setEditItemUnit(value)}
            >
              <SelectTrigger className="bg-gray-900 border-gray-700 text-white mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-950 border-gray-700 text-white [&>*]:text-white">
                <SelectItem value="unidade" className="text-white hover:bg-gray-900 focus:bg-gray-900">
                  Unidade
                </SelectItem>
                <SelectItem value="kg" className="text-white hover:bg-gray-900 focus:bg-gray-900">
                  Quilograma (kg)
                </SelectItem>
                <SelectItem value="litro" className="text-white hover:bg-gray-900 focus:bg-gray-900">
                  Litro (L)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-3 pt-2">
            <Button onClick={handleUpdateItem} className="flex-1 bg-purple-600 hover:bg-purple-700 border-0">
              Salvar Alterações
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowEditItem(false)}
              className="bg-gray-900 border-gray-700 text-white hover:bg-gray-800"
            >
              Cancelar
            </Button>
          </div>
        </div>
      </AnimatedDialog>

      {/* Dialog de edição de lista via comando */}
      <AnimatedDialog
        open={showEditList}
        onOpenChange={setShowEditList}
        title="Editar Lista"
      >
        <div className="space-y-4">
          <div>
            <Label htmlFor="editListName">Nome da Lista</Label>
            <Input
              id="editListName"
              value={editListName}
              onChange={(e) => setEditListName(e.target.value)}
              className="bg-gray-900 border-gray-700 text-white mt-1"
            />
          </div>
          <div>
            <Label htmlFor="editListDescription">Descrição</Label>
            <Textarea
              id="editListDescription"
              value={editListDescription}
              onChange={(e) => setEditListDescription(e.target.value)}
              className="bg-gray-900 border-gray-700 text-white mt-1"
              rows={3}
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button onClick={handleUpdateList} className="flex-1 bg-purple-600 hover:bg-purple-700 border-0">
              Salvar Alterações
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowEditList(false)}
              className="bg-gray-900 border-gray-700 text-white hover:bg-gray-800"
            >
              Cancelar
            </Button>
          </div>
        </div>
      </AnimatedDialog>

      {/* Dialog de confirmação de exclusão de item via comando */}
      <AnimatedDialog
        open={showDeleteItemConfirm}
        onOpenChange={setShowDeleteItemConfirm}
        title="Confirmar Exclusão"
        className="bg-gray-950 border-gray-800 text-white"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          {itemToDelete && (
            <>
              <div className="bg-red-900/20 border border-red-700 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Trash2 className="w-5 h-5 text-red-400" />
                  <span className="font-medium text-red-300">Tem certeza?</span>
                </div>
                <p className="text-sm text-gray-300 mb-3">
                  Você está prestes a excluir o item <strong>&quot;{itemToDelete.name}&quot;</strong>.
                </p>

                {(() => {
                  const { count, lists: linkedLists } = getLinkedListsCount(itemToDelete.id)
                  if (count > 0) {
                    return (
                      <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-3 mt-3">
                        <div className="text-yellow-400 text-sm font-medium mb-2">
                          ⚠️ Este item está sendo usado em {count} lista{count > 1 ? "s" : ""}:
                        </div>
                        <ul className="text-xs text-yellow-300 space-y-1">
                          {linkedLists.map((list) => (
                            <li key={list.id}>• {list.name}</li>
                          ))}
                        </ul>
                        <p className="text-xs text-yellow-400 mt-2">O item será removido de todas essas listas.</p>
                      </div>
                    )
                  }
                  return <div className="text-sm text-gray-400">Este item não está sendo usado em nenhuma lista.</div>
                })()}
              </div>

              <div className="flex gap-3">
                <Button onClick={handleConfirmDeleteItem} className="flex-1 bg-red-600 hover:bg-red-700 border-0">
                  Sim, Excluir
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteItemConfirm(false)}
                  className="flex-1 bg-gray-900 border-gray-700 text-white hover:bg-gray-800"
                >
                  Cancelar
                </Button>
              </div>
            </>
          )}
        </div>
      </AnimatedDialog>

      {/* Dialog de confirmação de exclusão de lista via comando */}
      <AnimatedDialog
        open={showDeleteListConfirm}
        onOpenChange={setShowDeleteListConfirm}
        title="Confirmar Exclusão"
        className="bg-gray-950 border-gray-800 text-white"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          {listToDelete && (
            <>
              <div className="bg-red-900/20 border border-red-700 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Trash2 className="w-5 h-5 text-red-400" />
                  <span className="font-medium text-red-300">Tem certeza?</span>
                </div>
                <p className="text-sm text-gray-300 mb-3">
                  Você está prestes a excluir a lista <strong>&quot;{listToDelete.name}&quot;</strong>.
                </p>

                {(() => {
                  const listItems = useAppStore.getState().listItems.filter((li) => li.listId === listToDelete.id)
                  if (listItems.length > 0) {
                    return (
                      <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-3 mt-3">
                        <div className="text-yellow-400 text-sm font-medium mb-2">
                          ⚠️ Esta lista contém {listItems.length} item{listItems.length > 1 ? "s" : ""}:
                        </div>
                        <div className="text-xs text-yellow-300 max-h-20 overflow-y-auto">
                          {listItems.slice(0, 5).map((listItem) => {
                            const item = items.find((i) => i.id === listItem.itemId)
                            return item ? (
                              <div key={listItem.id}>
                                • {item.name} ({listItem.quantity} {item.unit})
                              </div>
                            ) : null
                          })}
                          {listItems.length > 5 && (
                            <div className="text-yellow-400 mt-1">... e mais {listItems.length - 5} itens</div>
                          )}
                        </div>
                        <p className="text-xs text-yellow-400 mt-2">Todos os itens da lista serão perdidos.</p>
                      </div>
                    )
                  }
                  return <div className="text-sm text-gray-400">Esta lista está vazia.</div>
                })()}
              </div>

              <div className="flex gap-3">
                <Button onClick={handleConfirmDeleteList} className="flex-1 bg-red-600 hover:bg-red-700 border-0">
                  Sim, Excluir Lista
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteListConfirm(false)}
                  className="flex-1 bg-gray-900 border-gray-700 text-white hover:bg-gray-800"
                >
                  Cancelar
                </Button>
              </div>
            </>
          )}
        </div>
      </AnimatedDialog>
    </div>
  )
}
