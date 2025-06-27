"use client"

import { useState, useRef, useEffect, type ReactNode } from "react"

interface DropdownItem {
  label: string
  icon?: ReactNode
  onClick: () => void
  className?: string
}

interface AnimatedDropdownProps {
  trigger: ReactNode
  items: DropdownItem[]
  className?: string
}

export default function AnimatedDropdown({ trigger, items, className = "" }: AnimatedDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const handleItemClick = (onClick: () => void) => {
    onClick()
    setIsOpen(false)
  }

  // Fechar ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Trigger */}
      <div onClick={() => setIsOpen(!isOpen)}>{trigger}</div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-1 z-50 bg-gray-950 border border-gray-700 rounded-lg shadow-lg overflow-hidden min-w-[160px] animate-dropdown-in">
          {items.map((item, index) => (
            <button
              key={index}
              onClick={() => handleItemClick(item.onClick)}
              className={`w-full text-left px-3 py-2 flex items-center gap-2 transition-colors duration-150 first:rounded-t-lg last:rounded-b-lg animate-item-fade-in ${
                item.className || "text-white hover:bg-gray-900"
              }`}
              style={{ animationDelay: `${index * 20}ms` }}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
