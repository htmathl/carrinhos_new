"use client"

import { useState } from "react"
import { Plus, Search, Package, Edit, Trash2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import AnimatedSelect from "./AnimatedSelect"
import AnimatedDialog from "./AnimatedDialog"
// import AnimatedCard from "./AnimatedCard"
import { useAppStore } from "../store/useAppStore"
import { Item } from "../types"

export default function ItemManager() {
  const { items, addItem, deleteItem, updateItem } = useAppStore()
  const [searchTerm, setSearchTerm] = useState("")
  const [showNewItem, setShowNewItem] = useState(false)
  const [newItem, setNewItem] = useState({
    name: "",
    category: "",
    unit: "unidade" as "unidade" | "kg" | "litro",
  })

  const [showEditItem, setShowEditItem] = useState(false)
  const [editingItem, setEditingItem] = useState<Item | null>(null)
  const [editItemName, setEditItemName] = useState("")
  const [editItemCategory, setEditItemCategory] = useState("")
  const [editItemUnit, setEditItemUnit] = useState<"unidade" | "kg" | "litro">("unidade")

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<Item | null>(null)

  // Variantes de animação
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  }

  const searchBarVariants = {
    hidden: { opacity: 0},
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  }

  const buttonVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.4
      }
    },
    hover: {
      transition: {
        duration: 0.2
      }
    }
  }

  const listContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.4,
        staggerChildren: 0.08
      }
    }
  }

  const itemVariants = {
    hidden: { 
      opacity: 0
    },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5
      }
    },
    hover: {
      transition: {
        duration: 0.2
      }
    },
    exit: {
      opacity: 0,
      transition: {
        duration: 0.3
      }
    }
  }

  const emptyStateVariants = {
    hidden: { opacity: 0},
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        delay: 0.2
      }
    }
  }

  const iconVariants = {
    hidden: { rotate: -180, scale: 0 },
    visible: {
      rotate: 0,
      scale: 1,
      transition: {
        duration: 0.8,
        delay: 0.4
      }
    }
  }

  const unitOptions = [
    { value: "unidade", label: "Unidade" },
    { value: "kg", label: "Quilograma (kg)" },
    { value: "litro", label: "Litro (L)" },
  ]

  const filteredItems = items.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleCreateItem = () => {
    if (newItem.name.trim() && newItem.category.trim()) {
      addItem(newItem.name.trim(), newItem.category.trim(), newItem.unit)
      setNewItem({ name: "", category: "", unit: "unidade" })
      setShowNewItem(false)
    }
  }

  const handleEditItem = (item: Item) => {
    setEditingItem(item)
    setEditItemName(item.name)
    setEditItemCategory(item.category)
    setEditItemUnit(item.unit)
    setShowEditItem(true)
  }

  const handleUpdateItem = () => {
    if (editingItem && editItemName.trim() && editItemCategory.trim()) {
      updateItem(editingItem.id, {
        name: editItemName.trim(),
        category: editItemCategory.trim(),
        unit: editItemUnit,
      })
      setShowEditItem(false)
      setEditingItem(null)
    }
  }

  const getLinkedListsCount = (itemId: string) => {
    const { listItems, lists } = useAppStore.getState()
    const linkedListItems = listItems.filter((listItem) => listItem.itemId === itemId)
    const linkedListIds = [...new Set(linkedListItems.map((li) => li.listId))]
    const linkedLists = lists.filter((list) => linkedListIds.includes(list.id))
    return { count: linkedLists.length, lists: linkedLists }
  }

  const handleDeleteClick = (item: Item) => {
    setItemToDelete(item)
    setShowDeleteConfirm(true)
  }

  const handleConfirmDelete = () => {
    if (itemToDelete) {
      deleteItem(itemToDelete.id)
      setShowDeleteConfirm(false)
      setItemToDelete(null)
    }
  }

  return (
    <motion.div 
      className="space-y-4 max-h-[60vh] overflow-hidden flex flex-col"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Search and Add */}
      <div className="flex gap-2">
        <motion.div 
          className="relative flex-1"
          variants={searchBarVariants}
        >
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <Input
            placeholder="Buscar itens..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-gray-900 border-gray-700 text-white placeholder:text-gray-500"
          />
        </motion.div>
        
        <Dialog open={showNewItem} onOpenChange={setShowNewItem}>
          <DialogTrigger asChild>
            <motion.div
              variants={buttonVariants}
              >
              <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                <motion.div
                  animate={{ rotate: showNewItem ? 45 : 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  <Plus className="w-4 h-4" />
                </motion.div>
              </Button>
            </motion.div>
          </DialogTrigger>
        </Dialog>

        <AnimatedDialog
          open={showNewItem}
          onOpenChange={setShowNewItem}
          title="Novo Item"
        >
          <div className="space-y-4">
            <div>
              <Label htmlFor="itemName" className="text-sm font-medium text-gray-200 mb-2 block">Nome do Item</Label>
              <Input
                id="itemName"
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                placeholder="Ex: Arroz"
                className="bg-gray-900 border-gray-700 text-white mt-1"
              />
            </div>
            <div>
              <Label htmlFor="itemCategory" className="text-sm font-medium text-gray-200 mb-2 block">Categoria</Label>
              <Input
                id="itemCategory"
                value={newItem.category}
                onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                placeholder="Ex: Grãos"
                className="bg-gray-900 border-gray-700 text-white mt-1"
              />
            </div>
            <div>
              <Label htmlFor="itemUnit" className="text-sm font-medium text-gray-200 mb-2 block">Unidade</Label>
              <AnimatedSelect
                value={newItem.unit}
                onValueChange={(value) => setNewItem({ ...newItem, unit: value as "unidade" | "kg" | "litro" })}
                options={unitOptions}
                className="mt-1"
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button onClick={handleCreateItem} className="flex-1 bg-purple-600 hover:bg-purple-700">
                Criar Item
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowNewItem(false)}
                className="bg-gray-900 border-gray-700 text-white hover:bg-gray-800"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </AnimatedDialog>
      </div>

      {/* Items List */}
      <motion.div 
        className="flex-1 overflow-y-auto space-y-2"
        variants={listContainerVariants}
        initial="hidden"
        animate="visible"
      >
        <AnimatePresence mode="popLayout">
          {filteredItems.length === 0 ? (
            <motion.div 
              className="text-center py-8"
              variants={emptyStateVariants}
              initial="hidden"
              animate="visible"
              key="empty-state"
            >
              <motion.div variants={iconVariants}>
                <Package className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              </motion.div>
              <motion.p 
                className="text-slate-400"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.4 }}
              >
                {searchTerm ? "Nenhum item encontrado" : "Nenhum item cadastrado"}
              </motion.p>
            </motion.div>
          ) : (
            filteredItems.map((item, index) => (
              <motion.div
                key={item.id}
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                layout
                custom={index}
              >
                <Card className="bg-gray-900 border-gray-700">
                  <CardContent className="px-3">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <motion.h4 
                          className="font-medium text-white"
                          initial={{ opacity: 0}}
                          animate={{ opacity: 1}}
                          transition={{ delay: index * 0.05 + 0.2 }}
                        >
                          {item.name}
                        </motion.h4>
                        <motion.div 
                          className="flex items-center gap-2 mt-2"
                          initial={{ opacity: 0}}
                          animate={{ opacity: 1}}
                          transition={{ delay: index * 0.05 + 0.3 }}
                        >
                          <Badge variant="outline" className="text-xs border-slate-600 text-slate-300">
                            {item.category}
                          </Badge>
                          <Badge variant="secondary" className="text-xs bg-purple-900/30 text-purple-300">
                            {item.unit}
                          </Badge>
                        </motion.div>
                      </div>
                      <motion.div 
                        className="flex gap-1"
                        initial={{ opacity: 0}}
                        animate={{ opacity: 1}}
                        transition={{ delay: index * 0.05 + 0.4 }}
                      >
                        <motion.div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditItem(item)}
                            className="text-gray-400 hover:text-white hover:bg-gray-800"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </motion.div>
                        <motion.div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClick(item)}
                            className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </motion.div>
                      </motion.div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </motion.div>

      {/* Dialogs permanecem iguais... */}
      <AnimatedDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Confirmar Exclusão"
        className="bg-gray-950 border-gray-800 text-white"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          {itemToDelete && (
            <>
              <div className="bg-red-900/20 border border-red-700 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Trash2 className="w-5 h-5 text-red-400" />
                  <span className="font-medium text-red-300">Tem certeza?</span>
                </div>
                <p className="text-sm text-gray-300 mb-4">
                  Você está prestes a excluir o item <strong>&quot;{itemToDelete.name}&quot;</strong>.
                </p>

                {(() => {
                  const { count, lists } = getLinkedListsCount(itemToDelete.id)
                  if (count > 0) {
                    return (
                      <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-3 mt-4">
                        <div className="text-yellow-400 text-sm font-medium mb-3">
                          ⚠️ Este item está sendo usado em {count} lista{count > 1 ? "s" : ""}:
                        </div>
                        <ul className="text-xs text-yellow-300 space-y-1 mb-3">
                          {lists.map((list) => (
                            <li key={list.id}>• {list.name}</li>
                          ))}
                        </ul>
                        <p className="text-xs text-yellow-400">O item será removido de todas essas listas.</p>
                      </div>
                    )
                  }
                  return <div className="text-sm text-gray-400 py-2">Este item não está sendo usado em nenhuma lista.</div>
                })()}
              </div>

              <div className="flex gap-3 pt-4">
                <Button onClick={handleConfirmDelete} className="flex-1 bg-red-600 hover:bg-red-700 border-0">
                  Sim, Excluir
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 bg-gray-900 border-gray-700 text-white hover:bg-gray-800"
                >
                  Cancelar
                </Button>
              </div>
            </>
          )}
        </div>
      </AnimatedDialog>

      <AnimatedDialog
        open={showEditItem}
        onOpenChange={setShowEditItem}
        title="Editar Item"
      >
        <div className="space-y-4">
          <div>
            <Label htmlFor="editItemName" className="text-sm font-medium text-gray-200 mb-2 block">Nome do Item</Label>
            <Input
              id="editItemName"
              value={editItemName}
              onChange={(e) => setEditItemName(e.target.value)}
              className="bg-gray-900 border-gray-700 text-white mt-1"
            />
          </div>
          <div>
            <Label htmlFor="editItemCategory" className="text-sm font-medium text-gray-200 mb-2 block">Categoria</Label>
            <Input
              id="editItemCategory"
              value={editItemCategory}
              onChange={(e) => setEditItemCategory(e.target.value)}
              className="bg-gray-900 border-gray-700 text-white mt-1"
            />
          </div>
          <div>
            <Label htmlFor="editItemUnit" className="text-sm font-medium text-gray-200 mb-2 block">Unidade</Label>
            <AnimatedSelect
              value={editItemUnit}
              onValueChange={(value) => setEditItemUnit(value as "unidade" | "kg" | "litro")}
              options={unitOptions}
              className="mt-1"
            />
          </div>
          <div className="flex gap-3 pt-4">
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
    </motion.div>
  )
}
