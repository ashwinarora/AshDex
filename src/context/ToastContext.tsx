'use client'
import { createContext, useContext, useState, ReactNode } from 'react'

type ToastType = 'success' | 'error'

interface Toast {
  id: number
  type: ToastType
  title: string
  message: string
}

interface ToastContextType {
  toasts: Toast[]
  showToast: (type: ToastType, title: string, message: string) => void
  hideToast: (id: number) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = (type: ToastType, title: string, message: string) => {
    const newToast: Toast = {
      id: Date.now(),
      type,
      title,
      message
    }
    setToasts((prev) => [...prev, newToast])
    setTimeout(() => {
      hideToast(newToast.id)
    }, 2000)
  }

  const hideToast = (id: number) => {
    setToasts((prev) => prev?.filter((toast) => toast?.id !== id))
  }

  return (
    <ToastContext.Provider value={{ toasts, showToast, hideToast }}>
      {children}
    </ToastContext.Provider>
  )
}

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}
