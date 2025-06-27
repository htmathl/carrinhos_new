"use client"

import { motion, AnimatePresence } from "framer-motion"
import { ReactNode } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface AnimatedDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  children: ReactNode
  className?: string
  maxWidth?: string
}

export default function AnimatedDialog({ 
  open, 
  onOpenChange, 
  title, 
  children, 
  className = "bg-gray-950 border-gray-800 text-white",
  maxWidth = "max-w-md"
}: AnimatedDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`${className} ${maxWidth}`}>
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ 
                opacity: 0, 
                scale: 0.95,
                y: -20
              }}
              animate={{ 
                opacity: 1, 
                scale: 1,
                y: 0
              }}
              exit={{ 
                opacity: 0, 
                scale: 0.95,
                y: -20
              }}
              transition={{
                duration: 0.2,
                ease: [0.16, 1, 0.3, 1]
              }}
              className="space-y-6"
            >
              <DialogHeader className="pb-2">
                <DialogTitle className="text-lg font-semibold text-white">{title}</DialogTitle>
              </DialogHeader>
              <div className="pt-2">
                {children}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  )
}
