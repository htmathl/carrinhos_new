"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Command, Send, Sparkles, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useAppStore } from "../store/useAppStore"

interface CommandResult {
  success: boolean
  message: string
  type: "success" | "error" | "info"
  action?: {
    type: "edit-item" | "edit-list" | "delete-item" | "delete-list"
    data: any
  }
}

export default function CommandBar() {
  const [command, setCommand] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState<CommandResult | null>(null)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const { processCommand } = useAppStore()
  const inputRef = useRef<HTMLInputElement>(null)

  const commandExamples = [
    "add arroz na mercado",
    "novo leite categoria laticínios",
    "add lista compras",
    "del lista feira",
    "del arroz",
    "edit lista mercado",
    "edit leite",
    "add feijão na feira",
    "novo açúcar categoria mercearia kg",
  ]

  useEffect(() => {
    if (command.length > 2) {
      const filtered = commandExamples.filter((example) => example.toLowerCase().includes(command.toLowerCase()))
      setSuggestions(filtered.slice(0, 3))
    } else {
      setSuggestions([])
    }
  }, [command])

  useEffect(() => {
    if (result) {
      // Se há uma ação, executar ela
      if (result.action) {
        const event = new CustomEvent("command-action", {
          detail: { action: result.action },
        })
        window.dispatchEvent(event)
      }

      const timer = setTimeout(() => {
        setResult(null)
      }, 4000)
      return () => clearTimeout(timer)
    }
  }, [result])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!command.trim()) return

    setIsProcessing(true)
    setSuggestions([])

    try {
      const commandResult = await processCommand(command.trim())
      setResult(commandResult)
      setCommand("")
    } catch (error) {
      setResult({
        success: false,
        message: "Erro ao processar comando",
        type: "error",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setCommand(suggestion)
    setSuggestions([])
    inputRef.current?.focus()
  }

  const getResultIcon = () => {
    if (!result) return null
    switch (result.type) {
      case "success":
        return <CheckCircle className="w-4 h-4 text-emerald-400" />
      case "error":
        return <XCircle className="w-4 h-4 text-red-400" />
      case "info":
        return <AlertCircle className="w-4 h-4 text-blue-400" />
    }
  }

  const getResultColor = () => {
    if (!result) return ""
    switch (result.type) {
      case "success":
        return "text-emerald-400 bg-emerald-900/20 border-emerald-800"
      case "error":
        return "text-red-400 bg-red-900/20 border-red-800"
      case "info":
        return "text-blue-400 bg-blue-900/20 border-blue-800"
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="sticky top-16 z-40 bg-black/95 backdrop-blur-sm border-b border-gray-800"
    >
      <div className="p-4 space-y-3">
        <form onSubmit={handleSubmit} className="relative">
          <motion.div 
            className="relative"
            whileFocus={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <Command className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-400" />
            <Input
              ref={inputRef}
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              placeholder="Digite um comando... Ex: 'add arroz na mercado'"
              className="pl-12 pr-12 bg-gray-950 border-gray-700 text-white placeholder-gray-500 h-12"
              disabled={isProcessing}
            />
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="absolute right-1 top-1/2 transform -translate-y-1/2"
            >
              <Button
                type="submit"
                size="sm"
                disabled={!command.trim() || isProcessing}
                className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 border-0"
              >
                {isProcessing ? <Sparkles className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </motion.div>
          </motion.div>

          {/* Suggestions */}
          <AnimatePresence>
            {suggestions.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="absolute top-full left-0 right-0 mt-2 bg-gray-950 border border-gray-700 rounded-lg z-50 overflow-hidden"
              >
                <div className="p-2 space-y-1">
                  {suggestions.map((suggestion, index) => (
                    <motion.button
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ 
                        duration: 0.2, 
                        delay: index * 0.05,
                        ease: [0.16, 1, 0.3, 1]
                      }}
                      whileHover={{ 
                        backgroundColor: "rgb(17 24 39)", 
                        x: 4,
                        transition: { duration: 0.15 }
                      }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full text-left px-3 py-2 text-sm text-gray-300 rounded transition-colors"
                    >
                      <Sparkles className="w-3 h-3 inline mr-2 text-purple-400" />
                      {suggestion}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </form>

        {/* Command Result */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm ${getResultColor()}`}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, duration: 0.2 }}
              >
                {getResultIcon()}
              </motion.div>
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15, duration: 0.2 }}
              >
                {result.message}
              </motion.span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Command Help */}
        <AnimatePresence>
          {!command && !result && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="text-xs text-gray-500 space-y-1"
            >
              <div className="flex flex-wrap gap-2">
                {[
                  { text: 'add {item} na {lista}', color: "text-purple-400" },
                  { text: 'novo {item}', color: "text-emerald-400" },
                  { text: 'add lista {nome}', color: "text-blue-400" },
                  { text: 'del {item/lista}', color: "text-red-400" },
                  { text: 'edit {item/lista}', color: "text-yellow-400" }
                ].map((item, index) => (
                  <motion.span
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ 
                      duration: 0.2, 
                      delay: 0.3 + index * 0.1,
                      ease: [0.16, 1, 0.3, 1]
                    }}
                    whileHover={{ scale: 1.05 }}
                    className={`bg-gray-950 px-2 py-1 rounded ${item.color} cursor-default`}
                  >
                    {item.text}
                  </motion.span>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
