'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import { ReactNode } from 'react'
import { ToastPosition, toast, ToastContainer, ToastOptions } from 'react-toastify'
import { useUser } from './UserContext'

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
  const { currentUser } = useUser()
  const [toasts, setToasts] = useState<Toast[]>([])
  const [popupPosition, setPopupPosition] = useState<ToastPosition | undefined>(undefined)
  const possiblePositions: ToastPosition[] = [
    'top-left',
    'top-right',
    'bottom-right',
    'bottom-left'
  ]

  const hideToast = (id: number) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id))
  }

  const showToast = (type: ToastType, title: string, message: string) => {
    const options: ToastOptions = {
      position: popupPosition,
      autoClose: 3000,
      closeButton: true,
      hideProgressBar: true,
      onClose: () => console.log(`Toast closed: ${title}`)
    }
    const content = (
      <div>
        <strong>{title}</strong>
        <div>{message}</div>
      </div>
    )
    if (type === 'success') toast.success(content, options)
    else if (type === 'error') toast.error(content, options)
  }

  useEffect(() => {
    if (currentUser) {
      setPopupPosition(possiblePositions[currentUser?.user_preferences?.popup_position || 2])
    }
  }, [currentUser])

  return (
    <ToastContext.Provider value={{ toasts, showToast, hideToast }}>
      <ToastContainer />
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
