import { ReactNode } from "react"

export interface Item {
    id: string
    name: string
    category: string
    unit: "unidade" | "kg" | "litro"
    createdAt: Date
  }
  
  export interface ShoppingList {
    id: string
    name: string
    description: string
    createdAt: Date
  }
  
  export interface ListItem {
    unit: ReactNode
    id: string
    listId: string
    itemId: string
    quantity: number
    price: number
    completed: boolean
    addedAt: Date
  }
  