"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Item, ShoppingList, ListItem } from "../types"

interface CommandResult {
  success: boolean
  message: string
  type: "success" | "error" | "info"
  action?: {
    type: "edit-item" | "edit-list" | "delete-item" | "delete-list"
    data: any
  }
}

interface AppState {
  items: Item[]
  lists: ShoppingList[]
  listItems: ListItem[]

  // Item actions
  addItem: (name: string, category: string, unit: "unidade" | "kg" | "litro") => Item
  deleteItem: (id: string) => void
  updateItem: (id: string, updates: Partial<Item>) => void

  // List actions
  addList: (name: string, description?: string) => void
  deleteList: (id: string) => void
  updateList: (id: string, updates: Partial<ShoppingList>) => void

  // List item actions
  addItemToList: (listId: string, itemId: string, quantity: number, price: number) => void
  removeItemFromList: (listItemId: string) => void
  updateListItem: (listItemId: string, updates: Partial<ListItem>) => void
  toggleItemCompleted: (listItemId: string) => void
  getListItems: (listId: string) => ListItem[]

  // Smart command processing
  processCommand: (command: string) => Promise<CommandResult>
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      items: [],
      lists: [],
      listItems: [],

      addItem: (name, category, unit) => {
        const newItem: Item = {
          id: crypto.randomUUID(),
          name,
          category,
          unit,
          createdAt: new Date(),
        }
        set((state) => ({ items: [...state.items, newItem] }))
        return newItem // Return the created item
      },

      deleteItem: (id) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
          listItems: state.listItems.filter((listItem) => listItem.itemId !== id),
        }))
      },

      updateItem: (id, updates) => {
        set((state) => ({
          items: state.items.map((item) => (item.id === id ? { ...item, ...updates } : item)),
        }))
      },

      addList: (name, description = "") => {
        const newList: ShoppingList = {
          id: crypto.randomUUID(),
          name,
          description,
          createdAt: new Date(),
        }
        set((state) => ({ lists: [...state.lists, newList] }))
      },

      deleteList: (id) => {
        set((state) => ({
          lists: state.lists.filter((list) => list.id !== id),
          listItems: state.listItems.filter((listItem) => listItem.listId !== id),
        }))
      },

      updateList: (id, updates) => {
        set((state) => ({
          lists: state.lists.map((list) => (list.id === id ? { ...list, ...updates } : list)),
        }))
      },

      addItemToList: (listId, itemId, quantity, price) => {
        const newListItem: ListItem = {
            id: crypto.randomUUID(),
            listId,
            itemId,
            quantity,
            price,
            completed: false,
            addedAt: new Date(),
            unit: undefined
        }
        set((state) => ({ listItems: [...state.listItems, newListItem] }))
      },

      removeItemFromList: (listItemId) => {
        set((state) => ({
          listItems: state.listItems.filter((item) => item.id !== listItemId),
        }))
      },

      updateListItem: (listItemId, updates) => {
        set((state) => ({
          listItems: state.listItems.map((item) => (item.id === listItemId ? { ...item, ...updates } : item)),
        }))
      },

      toggleItemCompleted: (listItemId) => {
        set((state) => ({
          listItems: state.listItems.map((item) =>
            item.id === listItemId ? { ...item, completed: !item.completed } : item,
          ),
        }))
      },

      getListItems: (listId) => {
        return get().listItems.filter((item) => item.listId === listId)
      },

      processCommand: async (command): Promise<CommandResult> => {
        const {
          items,
          lists,
          addItem,
          addList,
          addItemToList,
          getListItems,
          deleteItem,
          deleteList,
          updateItem,
          updateList,
        } = get()
        const cmd = command.toLowerCase().trim()

        // Simular processamento
        await new Promise((resolve) => setTimeout(resolve, 500))

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

          addList(listName)
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

          addItem(itemName, category, unit)
          return {
            success: true,
            message: `Item "${itemName}" criado na categoria "${category}" (${unit}) ✨`,
            type: "success",
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
          addItemToList(targetList.id, targetItem.id, 1, 0)
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
      },
    }),
    {
      name: "smart-cart-storage",
    },
  ),
)
