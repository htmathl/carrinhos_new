"use client"

import { create } from "zustand"
import { createClient } from "@/utils/supabase/client"
import type { Item, ShoppingList, ListItem } from "../types"
import type { RealtimeChannel, RealtimePostgresChangesPayload } from "@supabase/supabase-js"

interface CommandResult {
  success: boolean
  message: string
  type: "success" | "error" | "info"
  action?: {
    type: "edit-item" | "edit-list" | "delete-item" | "delete-list"
    data: Item | ShoppingList | ListItem
  }
}

// Tipos para os dados do banco
interface DatabaseItem {
  id: string
  name: string
  category: string
  unit: "unidade" | "kg" | "litro"
  createdAt: string
}

interface DatabaseList {
  id: string
  name: string
  description: string
  createdAt: string
}

interface DatabaseListItem {
  id: string
  listId: string
  itemId: string
  quantity: number
  price: number
  completed: boolean
  createdAt: string
}

interface AppState {
  items: Item[]
  lists: ShoppingList[]
  listItems: ListItem[]
  loading: boolean
  error: string | null

  // Item actions
  addItem: (name: string, category: string, unit: "unidade" | "kg" | "litro") => Promise<Item | null>
  deleteItem: (id: string) => Promise<void>
  updateItem: (id: string, updates: Partial<Item>) => Promise<void>
  loadItems: () => Promise<void>

  // List actions
  addList: (name: string, description?: string) => Promise<void>
  deleteList: (id: string) => Promise<void>
  updateList: (id: string, updates: Partial<ShoppingList>) => Promise<void>
  loadLists: () => Promise<void>

  // List item actions
  addItemToList: (listId: string, itemId: string, quantity: number, price: number) => Promise<void>
  removeItemFromList: (listItemId: string) => Promise<void>
  updateListItem: (listItemId: string, updates: Partial<ListItem>) => Promise<void>
  toggleItemCompleted: (listItemId: string) => Promise<void>
  getListItems: (listId: string) => ListItem[]
  loadListItems: () => Promise<void>

  // Smart command processing
  processCommand: (command: string) => Promise<CommandResult>

  // Realtime subscriptions
  subscribeToRealtime: () => void
  unsubscribeFromRealtime: () => void
  subscriptions: RealtimeChannel[]

  // Utility actions
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

const supabase = createClient()

export const useAppStore = create<AppState>((set, get) => ({
  items: [],
  lists: [],
  listItems: [],
  loading: false,
  error: null,
  subscriptions: [],

  setLoading: (loading: boolean) => set({ loading }),
  setError: (error: string | null) => set({ error }),

  // ===== ITEM ACTIONS =====
  loadItems: async () => {
    try {
      set({ loading: true, error: null })
      
      const { data, error } = await supabase
        .from('item')
        .select('*')
        .order('createdAt', { ascending: false })

      if (error) throw error

      // Convert createdAt to Date objects
      const items = data?.map(item => ({
        ...item,
        createdAt: new Date(item.createdAt)
      })) || []

      set({ items, loading: false })
    } catch (error: unknown) {
      set({ error: (error as Error).message, loading: false })
      console.error('Erro ao carregar itens:', error)
    }
  },

  addItem: async (name, category, unit) => {
    try {
      set({ loading: true, error: null })

      const newItem = {
        id: crypto.randomUUID(),
        name,
        category,
        unit,
        createdAt: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('item')
        .insert([newItem])
        .select()
        .single()

      if (error) throw error

      const itemWithDate = {
        ...data,
        createdAt: new Date(data.createdAt)
      }

      set((state) => ({ 
        items: [itemWithDate, ...state.items],
        loading: false 
      }))

      return itemWithDate
    } catch (error: unknown) {
      set({ error: (error as Error).message, loading: false })
      console.error('Erro ao adicionar item:', error)
      return null
    }
  },

  updateItem: async (id, updates) => {
    try {
      set({ loading: true, error: null })

      const { error } = await supabase
        .from('item')
        .update(updates)
        .eq('id', id)

      if (error) throw error

      set((state) => ({
        items: state.items.map((item) => 
          item.id === id ? { ...item, ...updates } : item
        ),
        loading: false
      }))
    } catch (error: unknown) {
      set({ error: (error as Error).message, loading: false })
      console.error('Erro ao atualizar item:', error)
    }
  },

  deleteItem: async (id) => {
    try {
      set({ loading: true, error: null })

      // Primeiro remove das listas
      await supabase
        .from('list_item')
        .delete()
        .eq('itemId', id)

      // Depois remove o item
      const { error } = await supabase
        .from('item')
        .delete()
        .eq('id', id)

      if (error) throw error

      set((state) => ({
        items: state.items.filter((item) => item.id !== id),
        listItems: state.listItems.filter((listItem) => listItem.itemId !== id),
        loading: false
      }))
    } catch (error: unknown) {
      set({ error: (error as Error).message, loading: false })
      console.error('Erro ao deletar item:', error)
    }
  },

  // ===== LIST ACTIONS =====
  loadLists: async () => {
    try {
      set({ loading: true, error: null })
      
      const { data, error } = await supabase
        .from('shopping_list')
        .select('*')
        .order('createdAt', { ascending: false })

      if (error) throw error

      const lists = data?.map(list => ({
        ...list,
        createdAt: new Date(list.createdAt)
      })) || []

      set({ lists, loading: false })
    } catch (error: unknown) {
      set({ error: (error as Error).message, loading: false })
      console.error('Erro ao carregar listas:', error)
    }
  },

  addList: async (name, description = "") => {
    try {
      set({ loading: true, error: null })

      const newList = {
        id: crypto.randomUUID(),
        name,
        description,
        createdAt: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('shopping_list')
        .insert([newList])
        .select()
        .single()

      if (error) throw error

      const listWithDate = {
        ...data,
        createdAt: new Date(data.createdAt)
      }

      set((state) => ({ 
        lists: [listWithDate, ...state.lists],
        loading: false 
      }))
    } catch (error: unknown) {
      set({ error: (error as Error).message, loading: false })
      console.error('Erro ao adicionar lista:', error)
    }
  },

  updateList: async (id, updates) => {
    try {
      set({ loading: true, error: null })

      const { error } = await supabase
        .from('shopping_list')
        .update(updates)
        .eq('id', id)

      if (error) throw error

      set((state) => ({
        lists: state.lists.map((list) => 
          list.id === id ? { ...list, ...updates } : list
        ),
        loading: false
      }))
    } catch (error: unknown) {
      set({ error: (error as Error).message, loading: false })
      console.error('Erro ao atualizar lista:', error)
    }
  },

  deleteList: async (id) => {
    try {
      set({ loading: true, error: null })

      // Primeiro remove os itens da lista
      await supabase
        .from('list_item')
        .delete()
        .eq('listId', id)

      // Depois remove a lista
      const { error } = await supabase
        .from('shopping_list')
        .delete()
        .eq('id', id)

      if (error) throw error

      set((state) => ({
        lists: state.lists.filter((list) => list.id !== id),
        listItems: state.listItems.filter((listItem) => listItem.listId !== id),
        loading: false
      }))
    } catch (error: unknown) {
      set({ error: (error as Error).message, loading: false })
      console.error('Erro ao deletar lista:', error)
    }
  },

  // ===== LIST ITEM ACTIONS =====
  loadListItems: async () => {
    try {
      set({ loading: true, error: null })
      
      const { data, error } = await supabase
        .from('list_item')
        .select('*')
        .order('createdAt', { ascending: false })

      if (error) throw error

      const listItems = data?.map(item => ({
        id: item.id,
        listId: item.listId,
        itemId: item.itemId,
        quantity: item.quantity,
        price: item.price,
        completed: item.completed,
        createdAt: new Date(item.createdAt),
        unit: '' // Will be filled from the item data
      })) || []

      set({ listItems, loading: false })
    } catch (error: unknown) {
      set({ error: (error as Error).message, loading: false })
      console.error('Erro ao carregar itens das listas:', error)
    }
  },

  addItemToList: async (listId, itemId, quantity, price) => {
    try {
      set({ loading: true, error: null })
      console.log('🔄 addItemToList chamado:', { listId, itemId, quantity, price })

      // Verificar se o item já existe na lista
      const existingListItem = get().listItems.find(
        (listItem) => listItem.listId === listId && listItem.itemId === itemId
      )

      if (existingListItem) {
        console.log('📝 Item já existe na lista, atualizando quantidade...')
        // Se já existe, atualizar a quantidade
        const newQuantity = existingListItem.quantity + quantity
        await get().updateListItem(existingListItem.id, { 
          quantity: newQuantity,
          price: price // Atualizar o preço também
        })
        return
      }

      // Verificar se o itemId realmente existe na tabela item
      const { data: itemExists, error: itemError } = await supabase
        .from('item')
        .select('id')
        .eq('id', itemId)
        .single()

      if (itemError || !itemExists) {
        throw new Error(`Item com ID ${itemId} não existe na tabela item`)
      }

      console.log('✅ Item validado, inserindo na lista...')

      const newListItem = {
        id: crypto.randomUUID(),
        listId: listId,
        itemId: itemId,
        quantity,
        price,
        completed: false,
        createdAt: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('list_item')
        .insert([newListItem])
        .select()
        .single()

      if (error) {
        console.error('❌ Erro ao inserir na tabela list_item:', error)
        throw error
      }

      console.log('✅ Item adicionado com sucesso:', data)

      const listItemWithDate: ListItem = {
        id: data.id,
        listId: data.listId,
        itemId: data.itemId,
        quantity: data.quantity,
        price: data.price,
        completed: data.completed,
        createdAt: new Date(data.createdAt),
        unit: ''
      }

      set((state) => ({ 
        listItems: [listItemWithDate, ...state.listItems],
        loading: false 
      }))
    } catch (error: unknown) {
      console.error('❌ Erro em addItemToList:', error)
      set({ error: (error as Error).message, loading: false })
    }
  },

  updateListItem: async (listItemId, updates) => {
    try {
      set({ loading: true, error: null })

      const { error } = await supabase
        .from('list_item')
        .update(updates)
        .eq('id', listItemId)

      if (error) throw error

      set((state) => ({
        listItems: state.listItems.map((item) => 
          item.id === listItemId ? { ...item, ...updates } : item
        ),
        loading: false
      }))
    } catch (error: unknown) {
      set({ error: (error as Error).message, loading: false })
      console.error('Erro ao atualizar item da lista:', error)
    }
  },

  toggleItemCompleted: async (listItemId) => {
    try {
      const state = get()
      const listItem = state.listItems.find(item => item.id === listItemId)
      if (!listItem) {
        console.error('❌ Item não encontrado no estado local:', listItemId)
        return
      }

      const newCompletedValue = !listItem.completed
      console.log('🔄 Iniciando toggle:', {
        id: listItemId,
        currentCompleted: listItem.completed,
        newCompleted: newCompletedValue,
        timestamp: new Date().toISOString()
      })

      set({ loading: true, error: null })

      // Fazer update direto no banco de dados
      console.log('📤 Enviando update para Supabase...')
      const { data, error } = await supabase
        .from('list_item')
        .update({ completed: newCompletedValue })
        .eq('id', listItemId)
        .select()

      if (error) {
        console.error('❌ Erro do Supabase:', error)
        throw error
      }

      console.log('✅ Update no banco realizado:', data)

      // Atualizar estado local imediatamente (otimistic update)
      set((state) => {
        const newListItems = state.listItems.map((item) => 
          item.id === listItemId ? { ...item, completed: newCompletedValue } : item
        )
        
        console.log('📱 Estado local atualizado otimisticamente')
        return { listItems: newListItems, loading: false }
      })

      // Aguardar um pouco para ver se o realtime chega
      setTimeout(() => {
        const currentState = get()
        const updatedItem = currentState.listItems.find(item => item.id === listItemId)
        console.log('🕐 Estado após 2s:', {
          itemFound: !!updatedItem,
          completed: updatedItem?.completed,
          expectedCompleted: newCompletedValue
        })
      }, 2000)

    } catch (error: unknown) {
      const errorMessage = (error as Error).message
      set({ error: errorMessage, loading: false })
      console.error('❌ Erro ao alternar item:', error)
    }
  },

  removeItemFromList: async (listItemId) => {
    try {
      set({ loading: true, error: null })

      const { error } = await supabase
        .from('list_item')
        .delete()
        .eq('id', listItemId)

      if (error) throw error

      set((state) => ({
        listItems: state.listItems.filter((item) => item.id !== listItemId),
        loading: false
      }))
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
      console.error('Erro ao remover item da lista:', error)
    }
  },

  getListItems: (listId: string) => {
    const state = get()
    return state.listItems.filter((item) => item.listId === listId)
  },

  // ===== COMMAND PROCESSING =====
  processCommand: async (command: string): Promise<CommandResult> => {
    const {
      items,
      lists,
      addItem,
      addList,
      addItemToList,
      getListItems,
      loadItems,
      loadLists,
    } = get()
    
    // Recarregar dados atuais do BD antes de processar
    await Promise.all([loadItems(), loadLists()])
    
    const cmd = command.toLowerCase().trim()

    // Simular processamento
    await new Promise((resolve) => setTimeout(resolve, 500))

    try {
      // Comando: del lista {nome}
      const deleteListMatch = cmd.match(/^del lista (.+)$/)
      if (deleteListMatch) {
        const listName = deleteListMatch[1].trim()
        const targetList = lists.find((list) => list.name.toLowerCase().includes(listName.toLowerCase()))

        if (!targetList) {
          const similarLists = lists.filter((list) => list.name.toLowerCase().includes(listName.split(" ")[0]))

          if (similarLists.length > 0) {
            return {
              success: false,
              message: `Lista "${listName}" não encontrada. Você quis dizer: ${similarLists.map((l) => l.name).join(", ")}?`,
              type: "error",
            }
          }

          return {
            success: false,
            message: `Lista "${listName}" não existe.`,
            type: "error",
          }
        }

        return {
          success: true,
          message: `Abrindo confirmação para excluir a lista "${targetList.name}"...`,
          type: "info",
          action: {
            type: "delete-list",
            data: targetList,
          },
        }
      }

      // Comando: del {item}
      const deleteItemMatch = cmd.match(/^del (.+)$/)
      if (deleteItemMatch) {
        const itemName = deleteItemMatch[1].trim()
        const targetItem = items.find((item) => item.name.toLowerCase().includes(itemName.toLowerCase()))

        if (!targetItem) {
          const similarItems = items.filter((item) => item.name.toLowerCase().includes(itemName.split(" ")[0]))

          if (similarItems.length > 0) {
            return {
              success: false,
              message: `Item "${itemName}" não encontrado. Você quis dizer: ${similarItems.map((i) => i.name).join(", ")}?`,
              type: "error",
            }
          }

          return {
            success: false,
            message: `Item "${itemName}" não existe.`,
            type: "error",
          }
        }

        return {
          success: true,
          message: `Abrindo confirmação para excluir o item "${targetItem.name}"...`,
          type: "info",
          action: {
            type: "delete-item",
            data: targetItem,
          },
        }
      }

      // Comando: edit lista {nome}
      const editListMatch = cmd.match(/^edit lista (.+)$/)
      if (editListMatch) {
        const listName = editListMatch[1].trim()
        const targetList = lists.find((list) => list.name.toLowerCase().includes(listName.toLowerCase()))

        if (!targetList) {
          const similarLists = lists.filter((list) => list.name.toLowerCase().includes(listName.split(" ")[0]))

          if (similarLists.length > 0) {
            return {
              success: false,
              message: `Lista "${listName}" não encontrada. Você quis dizer: ${similarLists.map((l) => l.name).join(", ")}?`,
              type: "error",
            }
          }

          return {
            success: false,
            message: `Lista "${listName}" não existe.`,
            type: "error",
          }
        }

        return {
          success: true,
          message: `Abrindo edição da lista "${targetList.name}"...`,
          type: "success",
          action: {
            type: "edit-list",
            data: targetList,
          },
        }
      }

      // Comando: edit {item}
      const editItemMatch = cmd.match(/^edit (.+)$/)
      if (editItemMatch) {
        const itemName = editItemMatch[1].trim()
        const targetItem = items.find((item) => item.name.toLowerCase().includes(itemName.toLowerCase()))

        if (!targetItem) {
          const similarItems = items.filter((item) => item.name.toLowerCase().includes(itemName.split(" ")[0]))

          if (similarItems.length > 0) {
            return {
              success: false,
              message: `Item "${itemName}" não encontrado. Você quis dizer: ${similarItems.map((i) => i.name).join(", ")}?`,
              type: "error",
            }
          }

          return {
            success: false,
            message: `Item "${itemName}" não existe.`,
            type: "error",
          }
        }

        return {
          success: true,
          message: `Abrindo edição do item "${targetItem.name}"...`,
          type: "success",
          action: {
            type: "edit-item",
            data: targetItem,
          },
        }
      }

      // Comando: add lista {nome}
      const createListMatch = cmd.match(/^add lista (.+)$/)
      if (createListMatch) {
        const listName = createListMatch[1].trim()
        const existingList = lists.find((list) => list.name.toLowerCase() === listName.toLowerCase())

        if (existingList) {
          return {
            success: false,
            message: `Lista "${listName}" já existe!`,
            type: "error",
          }
        }

        await addList(listName)
        return {
          success: true,
          message: `Lista "${listName}" criada com sucesso! 🎉`,
          type: "success",
        }
      }

      // Comando: novo {item} [categoria {categoria}] [unidade]
      const createItemMatch = cmd.match(/^novo (.+?)(?:\s+categoria\s+(.+?))?(?:\s+(kg|litro|unidade))?$/)
      if (createItemMatch) {
        const itemName = createItemMatch[1].trim()
        const category = createItemMatch[2]?.trim() || "Geral"
        const unit = (createItemMatch[3] as "kg" | "litro" | "unidade") || "unidade"

        const existingItem = items.find((item) => item.name.toLowerCase() === itemName.toLowerCase())

        if (existingItem) {
          return {
            success: false,
            message: `Item "${itemName}" já existe!`,
            type: "error",
          }
        }

        const newItem = await addItem(itemName, category, unit)
        if (newItem) {
          return {
            success: true,
            message: `Item "${itemName}" criado na categoria "${category}" (${unit}) ✨`,
            type: "success",
          }
        } else {
          return {
            success: false,
            message: `Erro ao criar item "${itemName}"`,
            type: "error",
          }
        }
      }

      // Comando: add {item} na {lista}
      const addItemMatch = cmd.match(/^add (.+?) na (.+)$/)
      if (addItemMatch) {
        const itemName = addItemMatch[1].trim()
        const listName = addItemMatch[2].trim()

        // Buscar lista
        const targetList = lists.find((list) => list.name.toLowerCase().includes(listName.toLowerCase()))

        if (!targetList) {
          const similarLists = lists.filter((list) => list.name.toLowerCase().includes(listName.split(" ")[0]))

          if (similarLists.length > 0) {
            return {
              success: false,
              message: `Lista "${listName}" não encontrada. Você quis dizer: ${similarLists.map((l) => l.name).join(", ")}?`,
              type: "error",
            }
          }

          return {
            success: false,
            message: `Lista "${listName}" não existe. Use: "add lista ${listName}" para criar.`,
            type: "error",
          }
        }

        // Buscar item
        const targetItem = items.find((item) => item.name.toLowerCase().includes(itemName.toLowerCase()))

        if (!targetItem) {
          const similarItems = items.filter((item) => item.name.toLowerCase().includes(itemName.split(" ")[0]))

          if (similarItems.length > 0) {
            return {
              success: false,
              message: `Item "${itemName}" não encontrado. Você quis dizer: ${similarItems.map((i) => i.name).join(", ")}?`,
              type: "info",
            }
          }

          return {
            success: false,
            message: `Item "${itemName}" não existe. Use: "novo ${itemName}" para criar.`,
            type: "error",
          }
        }

        // Verificar se já está na lista
        const existingItems = getListItems(targetList.id)
        const alreadyExists = existingItems.some((li) => li.itemId === targetItem.id)

        if (alreadyExists) {
          return {
            success: false,
            message: `"${targetItem.name}" já está na lista "${targetList.name}"!`,
            type: "error",
          }
        }

        // Adicionar à lista
        await addItemToList(targetList.id, targetItem.id, 1, 0)
        return {
          success: true,
          message: `"${targetItem.name}" adicionado à lista "${targetList.name}" 🛒`,
          type: "success",
        }
      }

      // Comando não reconhecido
      return {
        success: false,
        message: `Comando "${command}" não reconhecido. Comandos disponíveis: "add", "novo", "del", "edit"`,
        type: "error",
      }
    } catch (error: unknown) {
      return {
        success: false,
        message: `Erro ao processar comando: ${(error as Error).message}`,
        type: "error",
      }
    }
  },

  // ===== REALTIME SUBSCRIPTIONS =====
  subscribeToRealtime: () => {
    const { subscriptions } = get()
    
    console.log('🔄 Iniciando subscriptions de realtime...')
    
    // Unsubscribe from existing subscriptions
    subscriptions.forEach((subscription: RealtimeChannel) => {
      console.log('🗑️ Removendo subscription anterior:', subscription.topic)
      void supabase.removeChannel(subscription)
    })

    // Create separate channels for better debugging
    const itemChannel = supabase
      .channel('items-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'item'
        },
        (payload: RealtimePostgresChangesPayload<DatabaseItem>) => {
          console.log('📦 Item change:', payload.eventType, (payload.new as DatabaseItem)?.name || (payload.old as DatabaseItem)?.name)
          
          if (payload.eventType === 'INSERT' && payload.new) {
            const newItem = {
              ...payload.new,
              createdAt: new Date(payload.new.createdAt)
            }
            set((state) => ({
              items: [newItem, ...state.items.filter(item => item.id !== newItem.id)]
            }))
          } else if (payload.eventType === 'UPDATE' && payload.new) {
            const updatedItem = {
              ...payload.new,
              createdAt: new Date(payload.new.createdAt)
            }
            set((state) => ({
              items: state.items.map((item) =>
                item.id === payload.new?.id ? updatedItem : item
              )
            }))
          } else if (payload.eventType === 'DELETE' && payload.old) {
            set((state) => ({
              items: state.items.filter((item) => item.id !== payload.old?.id),
              listItems: state.listItems.filter((listItem) => listItem.itemId !== payload.old?.id)
            }))
          }
        }
      )
      .subscribe((status) => {
        console.log('📦 Items channel status:', status)
      })

    const listChannel = supabase
      .channel('lists-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'shopping_list'
        },
        (payload: RealtimePostgresChangesPayload<DatabaseList>) => {
          console.log('📋 List change:', payload.eventType, (payload.new as DatabaseList)?.name || (payload.old as DatabaseList)?.name)
          
          if (payload.eventType === 'INSERT' && payload.new) {
            const newList = {
              ...payload.new,
              createdAt: new Date(payload.new.createdAt)
            }
            set((state) => ({
              lists: [newList, ...state.lists.filter(list => list.id !== newList.id)]
            }))
          } else if (payload.eventType === 'UPDATE' && payload.new) {
            const updatedList = {
              ...payload.new,
              createdAt: new Date(payload.new.createdAt)
            }
            set((state) => ({
              lists: state.lists.map((list) =>
                list.id === payload.new?.id ? updatedList : list
              )
            }))
          } else if (payload.eventType === 'DELETE' && payload.old) {
            set((state) => ({
              lists: state.lists.filter((list) => list.id !== payload.old?.id),
              listItems: state.listItems.filter((listItem) => listItem.listId !== payload.old?.id)
            }))
          }
        }
      )
      .subscribe((status) => {
        console.log('📋 Lists channel status:', status)
      })

    const listItemChannel = supabase
      .channel('list-items-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'list_item'
        },
        (payload: RealtimePostgresChangesPayload<DatabaseListItem>) => {
          console.log('🛒 List item change:', {
            event: payload.eventType,
            id: (payload.new as DatabaseListItem)?.id || (payload.old as DatabaseListItem)?.id,
            completed: (payload.new as DatabaseListItem)?.completed,
            timestamp: new Date().toISOString()
          })
          
          if (payload.eventType === 'INSERT' && payload.new) {
            const newListItem: ListItem = {
              id: payload.new.id,
              listId: payload.new.listId,
              itemId: payload.new.itemId,
              quantity: payload.new.quantity,
              price: payload.new.price,
              completed: payload.new.completed,
              createdAt: new Date(payload.new.createdAt),
              unit: ''
            }
            
            console.log('➕ Inserindo list item:', newListItem.id, 'completed:', newListItem.completed)
            
            set((state) => ({
              listItems: [newListItem, ...state.listItems.filter(item => item.id !== newListItem.id)]
            }))
          } else if (payload.eventType === 'UPDATE' && payload.new) {
            const updatedListItem: ListItem = {
              id: payload.new.id,
              listId: payload.new.listId,
              itemId: payload.new.itemId,
              quantity: payload.new.quantity,
              price: payload.new.price,
              completed: payload.new.completed,
              createdAt: new Date(payload.new.createdAt),
              unit: ''
            }
            
            console.log('🔄 Atualizando list item:', updatedListItem.id, 'completed:', updatedListItem.completed)
            
            set((state) => {
              const newListItems = state.listItems.map((listItem) =>
                listItem.id === payload.new?.id ? updatedListItem : listItem
              )
              
              console.log('📱 Estado local atualizado para item:', updatedListItem.id)
              return { listItems: newListItems }
            })
          } else if (payload.eventType === 'DELETE' && payload.old) {
            console.log('🗑️ Removendo list item:', payload.old.id)
            
            set((state) => ({
              listItems: state.listItems.filter((listItem) => listItem.id !== payload.old?.id)
            }))
          }
        }
      )
      .subscribe((status) => {
        console.log('🛒 ListItems channel status:', status)
        if (status === 'SUBSCRIBED') {
          console.log('✅ Canal de list_item conectado com sucesso!')
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Erro no canal de list_item')
        }
      })

    // Store all subscriptions
    set({ subscriptions: [itemChannel, listChannel, listItemChannel] })

    console.log('✅ Realtime subscriptions ativadas com 3 canais separados!')
  },

  unsubscribeFromRealtime: () => {
    const { subscriptions } = get()
    subscriptions.forEach((subscription: RealtimeChannel) => {
      void supabase.removeChannel(subscription)
    })
    set({ subscriptions: [] })
    console.log('Realtime subscriptions desativadas!')
  }
}))
