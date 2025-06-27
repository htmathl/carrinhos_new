"use client"

import { motion } from "framer-motion"
import { ReactNode } from "react"

interface AnimatedListItemProps {
  children: ReactNode
  index?: number
  delay?: number
  className?: string
  layoutId?: string
}

export default function AnimatedListItem({ 
  children, 
  index = 0, 
  delay = 0,
  className = "p-1",
  layoutId
}: AnimatedListItemProps) {
  return (
    <motion.div
      layoutId={layoutId}
      initial={{ 
        opacity: 0, 
        x: -20,
        scale: 0.95
      }}
      animate={{ 
        opacity: 1, 
        x: 0,
        scale: 1
      }}
      exit={{ 
        opacity: 0, 
        x: 20,
        scale: 0.95
      }}
      transition={{
        duration: 0.3,
        ease: [0.16, 1, 0.3, 1],
        delay: delay || index * 0.05
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// Componente para container de lista animada
interface AnimatedListContainerProps {
  children: ReactNode
  className?: string
}

export function AnimatedListContainer({ children, className = "space-y-2" }: AnimatedListContainerProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
