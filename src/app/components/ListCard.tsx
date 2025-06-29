"use client"

import { useState } from "react"
import { MoreVertical, ShoppingBag, Trash2, Edit, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import AnimatedDropdown from "./AnimatedDropdown"
import AnimatedCard from "./AnimatedCard"
import AnimatedDialog from "./AnimatedDialog"
import { useAppStore } from "../store/useAppStore"
import type { ShoppingList } from "../types"
import Link from "next/link"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface ListCardProps {
  list: ShoppingList
}

export default function ListCard({ list }: ListCardProps) {
  const { deleteList, getListItems, updateList, items } = useAppStore()
  const [isDeleting, setIsDeleting] = useState(false)

  // Adicionar estados para edição:
  const [showEditList, setShowEditList] = useState(false)
  const [editListName, setEditListName] = useState("")
  const [editListDescription, setEditListDescription] = useState("")

  // Estados para confirmação de exclusão
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const listItems = getListItems(list.id)
  const totalValue = listItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const completedItems = listItems.filter((item) => item.completed).length

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true)
  }

  const handleConfirmDelete = () => {
    setIsDeleting(true)
    setTimeout(() => {
      deleteList(list.id)
      setShowDeleteConfirm(false)
    }, 200)
  }

  // Adicionar função para abrir edição:
  const handleEditList = () => {
    setEditListName(list.name)
    setEditListDescription(list.description)
    setShowEditList(true)
  }

  // Adicionar função para salvar:
  const handleUpdateList = () => {
    if (editListName.trim()) {
      updateList(list.id, {
        name: editListName.trim(),
        description: editListDescription.trim(),
      })
      setShowEditList(false)
    }
  }

  const dropdownItems = [
    {
      label: "Editar",
      icon: <Edit className="w-4 h-4" />,
      onClick: handleEditList,
      className: "text-white hover:bg-gray-900",
    },
    {
      label: "Excluir",
      icon: <Trash2 className="w-4 h-4" />,
      onClick: handleDeleteClick,
      className: "text-red-400 hover:bg-red-900/20",
    },
  ]

  return (
    <>
      <AnimatedCard 
        isVisible={!isDeleting}
        className="w-full"
      >
        <div className="bg-gray-950 border border-gray-800 rounded-xl p-4 transition-none">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg text-white mb-1 truncate">{list.name}</h3>
              {list.description && <p className="text-sm text-gray-400 mb-2 line-clamp-2">{list.description}</p>}
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <ShoppingBag className="w-4 h-4 flex-shrink-0" />
                <span>{listItems.length} itens</span>
                {completedItems > 0 && (
                  <>
                    <span>•</span>
                    <span className="text-emerald-400">{completedItems} concluídos</span>
                  </>
                )}
              </div>
            </div>

            <AnimatedDropdown
              trigger={
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white hover:bg-gray-800 border-0">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              }
              items={dropdownItems}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {totalValue > 0 && (
                <Badge className="bg-purple-900/30 text-purple-300 border-purple-800 hover:bg-purple-900/40">
                  R$ {totalValue.toFixed(2)}
                </Badge>
              )}
              {listItems.length > 0 && (
                <Badge variant="outline" className="border-gray-600 text-gray-300">
                  {Math.round((completedItems / listItems.length) * 100)}%
                </Badge>
              )}
            </div>

            <Link href={`/list/${list.id}`}>
              <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white border-0">
                Abrir
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </AnimatedCard>

      {/* Dialog de confirmação de exclusão */}
      <AnimatedDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Confirmar Exclusão"
        className="bg-gray-950 border-gray-800 text-white"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <div className="bg-red-900/20 border border-red-700 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Trash2 className="w-5 h-5 text-red-400" />
              <span className="font-medium text-red-300">Tem certeza?</span>
            </div>
            <p className="text-sm text-gray-300 mb-3">
              Você está prestes a excluir a lista <strong>&quot;{list.name}&quot;</strong>.
            </p>

            {listItems.length > 0 && (
              <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-3 mt-3">
                <div className="text-yellow-400 text-sm font-medium mb-2">
                  ⚠️ Esta lista contém {listItems.length} item{listItems.length > 1 ? "s" : ""}:
                </div>
                <div className="text-xs text-yellow-300 max-h-20 overflow-y-auto">
                  {listItems.slice(0, 5).map((listItem) => {
                    const item = items.find((i) => i.id === listItem.itemId)
                    return item ? (
                      <div key={listItem.id}>
                        • {item.name} ({listItem.quantity} {listItem.unit})
                      </div>
                    ) : null
                  })}
                  {listItems.length > 5 && (
                    <div className="text-yellow-400 mt-1">... e mais {listItems.length - 5} itens</div>
                  )}
                </div>
                <p className="text-xs text-yellow-400 mt-2">Todos os itens da lista serão perdidos.</p>
              </div>
            )}

            {listItems.length === 0 && <div className="text-sm text-gray-400">Esta lista está vazia.</div>}
          </div>

          <div className="flex gap-3">
            <Button onClick={handleConfirmDelete} className="flex-1 bg-red-600 hover:bg-red-700 border-0">
              Sim, Excluir Lista
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(false)}
              className="flex-1 bg-gray-900 border-gray-700 text-white hover:bg-gray-800"
            >
              Cancelar
            </Button>
          </div>
        </div>
      </AnimatedDialog>

      {/* Dialog de edição */}
      <AnimatedDialog
        open={showEditList}
        onOpenChange={setShowEditList}
        title="Editar Lista"
        className="bg-gray-950 border-gray-800 text-white"
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
    </>
  )
}
