"use client"

import { motion, AnimatePresence } from "framer-motion"
import { ReactNode } from "react"

interface AnimatedCardProps {
  children: ReactNode
  isVisible?: boolean
  delay?: number
  className?: string
}

export default function AnimatedCard({ 
  children, 
  isVisible = true, 
  delay = 0, 
  className = "" 
}: AnimatedCardProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{
            duration: 0.2,
            ease: "easeOut",
            delay: delay
          }}
          className={className}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Variação para listas com animação em sequência
interface AnimatedListProps {
  children: ReactNode[]
  className?: string
  itemClassName?: string
}

export function AnimatedList({ children, className = "", itemClassName = "" }: AnimatedListProps) {
  return (
    <div className={className}>
      {children.map((child, index) => (
        <AnimatedCard 
          key={index} 
          delay={index * 0.05} 
          className={itemClassName}
        >
          {child}
        </AnimatedCard>
      ))}
    </div>
  )
}
