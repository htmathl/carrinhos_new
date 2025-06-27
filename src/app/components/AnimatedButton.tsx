"use client"

import { motion, TargetAndTransition } from "framer-motion"
import { Button } from "@/components/ui/button"
import { forwardRef } from "react"

interface AnimatedButtonProps extends React.ComponentProps<typeof Button> {
  whileHover?: TargetAndTransition
  whileTap?: TargetAndTransition
}

const AnimatedButton = forwardRef<
  React.ElementRef<typeof Button>,
  AnimatedButtonProps
>(({ className, whileHover, whileTap, children, ...props }, ref) => {
  return (
    <motion.div
      whileHover={whileHover || { scale: 1.02 }}
      whileTap={whileTap || { scale: 0.98 }}
      transition={{ duration: 0.1, ease: "easeOut" }}
    >
      <Button
        ref={ref}
        className={className}
        {...props}
      >
        {children}
      </Button>
    </motion.div>
  )
})

AnimatedButton.displayName = "AnimatedButton"

export default AnimatedButton
