"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { ArrowLeft, Plus, Check, Edit, Trash2, ShoppingBag, Sparkles, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import AnimatedSelect from "../../components/AnimatedSelect"
import AnimatedDialog from "../../components/AnimatedDialog"
// import AnimatedListItem from "../../components/AnimatedListItem"
import { useAppStore } from "../../store/useAppStoreDB"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Item, ListItem } from "@/app/types"

export default function ListPage() {
  const params = useParams()
  const listId = params.id as string
  const {
    lists,
    items,
    getListItems,
    addItemToList,
    removeItemFromList,
    toggleItemCompleted,
    addItem,
    // updateItem,
    updateListItem,
    // updateList,
  } = useAppStore()

  const [showAddItem, setShowAddItem] = useState(false)
  const [selectedItemId, setSelectedItemId] = useState("")
  const [quantity, setQuantity] = useState("1")
  const [price, setPrice] = useState("")
  const [swipedItemId, setSwipedItemId] = useState<string | null>(null)
  const [isDesktop, setIsDesktop] = useState(false)

  // Estados para criação de novo item
  const [showCreateItem, setShowCreateItem] = useState(false)
  const [newItemName, setNewItemName] = useState("")
  const [newItemCategory, setNewItemCategory] = useState("")
  const [newItemUnit, setNewItemUnit] = useState<"unidade" | "kg" | "litro">("unidade")
  const [searchTerm, setSearchTerm] = useState("")

  // Estados para edição de item na lista
  const [showEditListItem, setShowEditListItem] = useState(false)
  const [editingListItem, setEditingListItem] = useState<ListItem | null>(null)
  const [editListItemQuantity, setEditListItemQuantity] = useState("")
  const [editListItemPrice, setEditListItemPrice] = useState("")

  // Detectar se é desktop
  useEffect(() => {
    const checkIsDesktop = () => {
      setIsDesktop(window.innerWidth >= 768)
    }

    checkIsDesktop()
    window.addEventListener("resize", checkIsDesktop)

    return () => window.removeEventListener("resize", checkIsDesktop)
  }, [])

  const list = lists.find((l) => l.id === listId)
  const listItems = getListItems(listId)

  // Itens disponíveis (não estão na lista atual)
  const availableItems = items.filter(
    (item) =>
      !listItems.some((listItem) => listItem.itemId === item.id) &&
      (searchTerm === "" || item.name.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  // Verificar se o item pesquisado já existe globalmente
  const existingItem = searchTerm ? items.find((item) => item.name.toLowerCase() === searchTerm.toLowerCase()) : null

  // Verificar se o item já está na lista atual
  const itemAlreadyInList = existingItem ? listItems.some((listItem) => listItem.itemId === existingItem.id) : false

  const totalValue = listItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const completedItems = listItems.filter((item) => item.completed).length

  // Agrupar itens por categoria
  const groupedItems = listItems.reduce(
    (groups, listItem) => {
      const item = items.find((i) => i.id === listItem.itemId)
      if (!item) return groups

      const category = item.category
      if (!groups[category]) {
        groups[category] = []
      }
      groups[category].push({ listItem, item })
      return groups
    },
    {} as Record<string, Array<{ listItem: ListItem; item: Item }>>,
  )

  const handleAddItem = () => {
    if (selectedItemId && quantity && price) {
      addItemToList(listId, selectedItemId, Number.parseFloat(quantity), Number.parseFloat(price))
      setSelectedItemId("")
      setQuantity("1")
      setPrice("")
      setSearchTerm("")
      setShowAddItem(false)
    }
  }

  const handleCreateAndAddItem = async () => {
    if (newItemName.trim() && newItemCategory.trim() && quantity && price) {
      // Criar o item e receber o item criado diretamente
      const createdItem = await addItem(newItemName.trim(), newItemCategory.trim(), newItemUnit)

      if (createdItem) {
        // Adicionar imediatamente à lista usando o item retornado
        await addItemToList(listId, createdItem.id, Number.parseFloat(quantity), Number.parseFloat(price))

        // Reset form
        setNewItemName("")
        setNewItemCategory("")
        setNewItemUnit("unidade")
        setQuantity("1")
        setPrice("")
        setShowCreateItem(false)
        setShowAddItem(false)
      }
    }
  }

  const handleEditListItem = (listItem: ListItem) => {
    setEditingListItem(listItem)
    setEditListItemQuantity(listItem.quantity.toString())
    setEditListItemPrice(listItem.price.toString())
    setShowEditListItem(true)
  }

  const handleUpdateListItem = () => {
    if (editingListItem && editListItemQuantity && editListItemPrice) {
      updateListItem(editingListItem.id, {
        quantity: Number.parseFloat(editListItemQuantity),
        price: Number.parseFloat(editListItemPrice),
      })
      setShowEditListItem(false)
      setEditingListItem(null)
    }
  }

  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    setSelectedItemId("")
  }

  const handleSwipe = (itemId: string, direction: "left" | "right") => {
    if (direction === "left") {
      setSwipedItemId(swipedItemId === itemId ? null : itemId)
    } else {
      setSwipedItemId(null)
    }
  }

  // Função para lidar com eventos de mouse (desktop)
  const handleMouseSwipe = (itemId: string, e: React.MouseEvent) => {
    // Só ativar swipe no mobile
    if (isDesktop) return

    const startX = e.clientX
    let isDragging = false

    const handleMouseMove = (e: MouseEvent) => {
      const currentX = e.clientX
      const diff = startX - currentX

      if (Math.abs(diff) > 10) {
        isDragging = true
      }

      if (diff > 50) {
        handleSwipe(itemId, "left")
        document.removeEventListener("mousemove", handleMouseMove)
        document.removeEventListener("mouseup", handleMouseUp)
      } else if (diff < -50) {
        handleSwipe(itemId, "right")
        document.removeEventListener("mousemove", handleMouseMove)
        document.removeEventListener("mouseup", handleMouseUp)
      }
    }

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)

      // Se não houve drag significativo, trata como click
      if (!isDragging && swipedItemId === itemId) {
        setSwipedItemId(null)
      }
    }

    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)
  }

  if (!list) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Lista não encontrada</h1>
          <Link href="/">
            <Button className="bg-purple-600 hover:bg-purple-700">Voltar ao início</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-black/95 backdrop-blur-sm border-b border-gray-800">
        <div className="flex items-center gap-4 p-4">
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white hover:bg-gray-800 border-0">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold truncate">{list.name}</h1>
            {list.description && <p className="text-sm text-gray-400 truncate">{list.description}</p>}
          </div>
          <Dialog open={showAddItem} onOpenChange={setShowAddItem}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-purple-600 hover:bg-purple-700 border-0">
                <Plus className="w-4 h-4 mr-1" />
                Item
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-950 border-gray-800 text-white max-w-md">
              <DialogHeader>
                <DialogTitle>Adicionar Item à Lista</DialogTitle>
              </DialogHeader>

              {!showCreateItem ? (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="search">Buscar Item</Label>
                    <Input
                      id="search"
                      value={searchTerm}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      placeholder="Digite o nome do item..."
                      className="bg-gray-900 border-gray-700 text-white mt-1"
                    />
                  </div>

                  {/* Resultados da busca */}
                  {searchTerm && (
                    <div className="space-y-2">
                      {/* Se o item existe mas já está na lista */}
                      {existingItem && itemAlreadyInList && (
                        <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-4 text-center">
                          <div className="text-yellow-400 mb-2">⚠️</div>
                          <p className="text-sm text-yellow-300 mb-2">&quot;{existingItem.name}&quot; já está nesta lista!</p>
                          <p className="text-xs text-yellow-400">Verifique os itens abaixo ou busque outro nome.</p>
                        </div>
                      )}

                      {/* Se o item existe e não está na lista */}
                      {existingItem && !itemAlreadyInList && (
                        <>
                          <Label className="text-sm text-gray-400">Item encontrado:</Label>
                          <button
                            onClick={() => setSelectedItemId(existingItem.id)}
                            className={`w-full text-left p-3 rounded-lg border transition-colors ${
                              selectedItemId === existingItem.id
                                ? "bg-purple-900/30 border-purple-600 text-white"
                                : "bg-gray-900 border-gray-700 text-gray-300 hover:bg-gray-800"
                            }`}
                          >
                            <div className="font-medium">{existingItem.name}</div>
                            <div className="text-sm text-gray-400">
                              {existingItem.category} • {existingItem.unit}
                            </div>
                          </button>
                        </>
                      )}

                      {/* Outros itens similares */}
                      {availableItems.length > 0 && !existingItem && (
                        <>
                          <Label className="text-sm text-gray-400">Itens encontrados:</Label>
                          <div className="max-h-40 overflow-y-auto space-y-1">
                            {availableItems.slice(0, 5).map((item) => (
                              <button
                                key={item.id}
                                onClick={() => setSelectedItemId(item.id)}
                                className={`text-left p-3 rounded-lg border transition-colors ${
                                  selectedItemId === item.id
                                    ? "bg-purple-900/30 border-purple-600 text-white"
                                    : "bg-gray-900 border-gray-700 text-gray-300 hover:bg-gray-800"
                                }`}
                              >
                                <div className="font-medium">{item.name}</div>
                                <div className="text-sm text-gray-400">
                                  {item.category} • {item.unit}
                                </div>
                              </button>
                            ))}
                          </div>
                        </>
                      )}

                      {/* Se não existe nenhum item */}
                      {!existingItem && availableItems.length === 0 && (
                        <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 text-center">
                          <Sparkles className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-300 mb-3">Item &quot;{searchTerm}&quot; não encontrado</p>
                          <Button
                            onClick={() => {
                              setNewItemName(searchTerm)
                              setShowCreateItem(true)
                            }}
                            className="bg-purple-600 hover:bg-purple-700 border-0"
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Criar &quot;{searchTerm}&quot;
                          </Button>
                        </div>
                      )}
                    </div>
                  )}

                  {selectedItemId && (
                    <>
                      <div className="bg-purple-900/20 border border-purple-700 rounded-lg p-3">
                        <div className="text-sm text-purple-300">
                          ✓ Item selecionado: {items.find((i) => i.id === selectedItemId)?.name}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="quantity">Quantidade</Label>
                          <Input
                            id="quantity"
                            type="number"
                            step="0.1"
                            min="0.1"
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            className="bg-gray-900 border-gray-700 text-white mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="price">Preço (R$)</Label>
                          <Input
                            id="price"
                            type="number"
                            step="0.01"
                            min="0"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            className="bg-gray-900 border-gray-700 text-white mt-1"
                          />
                        </div>
                      </div>
                      <div className="flex gap-3 pt-2">
                        <Button onClick={handleAddItem} className="flex-1 bg-purple-600 hover:bg-purple-700 border-0">
                          Adicionar à Lista
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setSelectedItemId("")
                            setSearchTerm("")
                            setShowAddItem(false)
                          }}
                          className="bg-gray-900 border-gray-700 text-white hover:bg-gray-800"
                        >
                          Cancelar
                        </Button>
                      </div>
                    </>
                  )}

                  {!selectedItemId && !searchTerm && (
                    <div className="text-center py-6">
                      <div className="text-gray-400 mb-4">
                        <Search className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>Digite para buscar itens existentes</p>
                        <p className="text-sm">ou criar um novo item</p>
                      </div>
                      <Button
                        onClick={() => setShowCreateItem(true)}
                        variant="outline"
                        className="bg-gray-900 border-gray-700 text-white hover:bg-gray-800"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Criar Novo Item
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-gray-900 border border-gray-700 rounded-lg p-3">
                    <p className="text-sm text-gray-300">
                      <Sparkles className="w-4 h-4 inline mr-1 text-purple-400" />
                      Criando novo item
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="newItemName">Nome do Item</Label>
                    <Input
                      id="newItemName"
                      value={newItemName}
                      onChange={(e) => setNewItemName(e.target.value)}
                      placeholder="Ex: Arroz"
                      className="bg-gray-900 border-gray-700 text-white mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="newItemCategory">Categoria</Label>
                    <Input
                      id="newItemCategory"
                      value={newItemCategory}
                      onChange={(e) => setNewItemCategory(e.target.value)}
                      placeholder="Ex: Grãos"
                      className="bg-gray-900 border-gray-700 text-white mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="newItemUnit">Unidade</Label>
                    <AnimatedSelect
                      value={newItemUnit}
                      onValueChange={(value) => setNewItemUnit(value as "unidade" | "kg" | "litro")}
                      options={[
                        { value: "unidade", label: "Unidade" },
                        { value: "kg", label: "Quilograma (kg)" },
                        { value: "litro", label: "Litro (L)" }
                      ]}
                      placeholder="Selecione a unidade"
                      className="mt-1"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="newQuantity">Quantidade</Label>
                      <Input
                        id="newQuantity"
                        type="number"
                        step="0.1"
                        min="0.1"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        className="bg-gray-900 border-gray-700 text-white mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="newPrice">Preço (R$)</Label>
                      <Input
                        id="newPrice"
                        type="number"
                        step="0.01"
                        min="0"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="bg-gray-900 border-gray-700 text-white mt-1"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button
                      onClick={handleCreateAndAddItem}
                      disabled={!newItemName.trim() || !newItemCategory.trim() || !quantity || !price}
                      className="flex-1 bg-purple-600 hover:bg-purple-700 border-0"
                    >
                      Criar e Adicionar
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowCreateItem(false)}
                      className="bg-gray-900 border-gray-700 text-white hover:bg-gray-800"
                    >
                      Voltar
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="p-4 border-b border-gray-800">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">{listItems.length}</div>
            <div className="text-xs text-gray-400">Itens</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-400">{completedItems}</div>
            <div className="text-xs text-gray-400">Concluídos</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400">R$ {totalValue.toFixed(2)}</div>
            <div className="text-xs text-gray-400">Total</div>
          </div>
        </div>
      </div>

      {/* Items by Category */}
      <div className="p-4 space-y-6">
        {Object.keys(groupedItems).length === 0 ? (
          <Card className="bg-gray-950 border-gray-800 border-dashed">
            <CardContent className="p-8 text-center">
              <ShoppingBag className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-400 mb-2">Lista vazia</h3>
              <p className="text-gray-500 mb-4">Adicione itens à sua lista</p>
              <Button onClick={() => setShowAddItem(true)} className="bg-purple-600 hover:bg-purple-700 border-0">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Item
              </Button>
            </CardContent>
          </Card>
        ) : (
          Object.entries(groupedItems).map(([category, categoryItems]) => (
            <div key={category} className="space-y-3">
              {/* Category Header */}
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-semibold text-purple-300">{category}</h3>
                <div className="flex-1 h-px bg-gray-800"></div>
                <span className="text-sm text-gray-500">{categoryItems.length} itens</span>
              </div>

              {/* Category Items */}
              <div className="space-y-2">
                {categoryItems.map(({ listItem, item }, index) => (
                  <div key={listItem.id} className="animate-slide-in" style={{ animationDelay: `${index * 0.05}s` }}>
                    <div className="relative overflow-hidden rounded-lg bg-gray-950 border border-gray-800">
                      {/* Swipe Actions Background - Apenas Mobile */}
                      {!isDesktop && swipedItemId === listItem.id && (
                        <div className="absolute right-0 top-0 h-full w-24 flex items-center bg-red-600 z-0">
                          <div className="flex items-center justify-center w-full h-full gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-white hover:bg-red-700 border-0 p-2"
                              onClick={() => {
                                handleEditListItem(listItem)
                                setSwipedItemId(null)
                              }}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-white hover:bg-red-700 border-0 p-2"
                              onClick={() => {
                                removeItemFromList(listItem.id)
                                setSwipedItemId(null)
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Main Item Content */}
                      <div
                        className={`relative z-10 bg-gray-950 transition-all duration-300 ${
                          !isDesktop ? "cursor-pointer" : ""
                        } select-none ${listItem.completed ? "opacity-60" : ""} ${
                          !isDesktop && swipedItemId === listItem.id ? "-translate-x-24" : "translate-x-0"
                        }`}
                        onTouchStart={
                          !isDesktop
                            ? (e) => {
                                const startX = e.touches[0].clientX
                                const handleTouchMove = (e: TouchEvent) => {
                                  const currentX = e.touches[0].clientX
                                  const diff = startX - currentX
                                  if (diff > 50) {
                                    handleSwipe(listItem.id, "left")
                                    document.removeEventListener("touchmove", handleTouchMove)
                                  } else if (diff < -50) {
                                    handleSwipe(listItem.id, "right")
                                    document.removeEventListener("touchmove", handleTouchMove)
                                  }
                                }
                                document.addEventListener("touchmove", handleTouchMove)
                                document.addEventListener(
                                  "touchend",
                                  () => {
                                    document.removeEventListener("touchmove", handleTouchMove)
                                  },
                                  { once: true },
                                )
                              }
                            : undefined
                        }
                        onMouseDown={!isDesktop ? (e) => handleMouseSwipe(listItem.id, e) : undefined}
                        onClick={() => {
                          if (!isDesktop && swipedItemId === listItem.id) {
                            setSwipedItemId(null)
                          }
                        }}
                      >
                        <div className="p-3">
                          <div className="flex items-start gap-3">
                            {/* Custom Checkbox - Centralizado verticalmente */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                toggleItemCompleted(listItem.id)
                              }}
                              className={`w-6 h-6 rounded-sm border flex items-center justify-center transition-all duration-200 flex-shrink-0 my-auto ${
                                listItem.completed
                                  ? "bg-emerald-500 border-emerald-500"
                                  : "border-gray-500 hover:border-emerald-400"
                              }`}
                            >
                              {listItem.completed && <Check className="w-3 h-3 text-white" />}
                            </button>

                            {/* Item Info - Better Layout */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between mb-1">
                                {/* Item Name */}
                                <h4
                                  className={`font-semibold text-base leading-tight ${
                                    listItem.completed ? "line-through text-gray-400" : "text-white"
                                  }`}
                                >
                                  {item.name}
                                </h4>

                                {/* Total Price */}
                                <div className="text-right ml-3 flex-shrink-0">
                                  <div className="font-semibold text-white text-sm">
                                    R$ {(listItem.price * listItem.quantity).toFixed(2)}
                                  </div>
                                </div>
                              </div>

                              {/* Quantity and Unit Price */}
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-400">
                                  {listItem.quantity} {item.unit}
                                </span>
                                <span className="text-gray-400">
                                  R$ {listItem.price.toFixed(2)} / {item.unit}
                                </span>
                              </div>
                            </div>

                            {/* Desktop Action Buttons - Sempre Visíveis */}
                            {isDesktop && (
                              <div className="flex items-center gap-1 ml-2 my-auto">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-gray-400 hover:text-white hover:bg-gray-800 border-0 p-2"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleEditListItem(listItem)
                                  }}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-gray-400 hover:text-red-400 hover:bg-red-900/20 border-0 p-2"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    removeItemFromList(listItem.id)
                                  }}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Dialog para editar item na lista */}
      <AnimatedDialog
        open={showEditListItem}
        onOpenChange={setShowEditListItem}
        title="Editar Item na Lista"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          {editingListItem && (
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-3">
              <div className="text-sm text-gray-300">
                Editando: {items.find((i) => i.id === editingListItem.itemId)?.name}
              </div>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="editListItemQuantity">Quantidade</Label>
              <Input
                id="editListItemQuantity"
                type="number"
                step="0.1"
                min="0.1"
                value={editListItemQuantity}
                onChange={(e) => setEditListItemQuantity(e.target.value)}
                className="bg-gray-900 border-gray-700 text-white mt-1"
              />
            </div>
            <div>
              <Label htmlFor="editListItemPrice">Preço (R$)</Label>
              <Input
                id="editListItemPrice"
                type="number"
                step="0.01"
                min="0"
                value={editListItemPrice}
                onChange={(e) => setEditListItemPrice(e.target.value)}
                className="bg-gray-900 border-gray-700 text-white mt-1"
              />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button onClick={handleUpdateListItem} className="flex-1 bg-purple-600 hover:bg-purple-700 border-0">
              Salvar Alterações
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowEditListItem(false)}
              className="bg-gray-900 border-gray-700 text-white hover:bg-gray-800"
            >
              Cancelar
            </Button>
          </div>
        </div>
      </AnimatedDialog>
    </div>
  )
}
